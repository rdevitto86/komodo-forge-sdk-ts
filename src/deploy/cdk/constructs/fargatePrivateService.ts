import * as cdk from 'aws-cdk-lib';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';

export interface FargatePrivateServiceProps {
  vpc: ec2.IVpc;
  cluster: ecs.ICluster;
  logGroup: logs.ILogGroup;
  serviceName: string;
  image: ecs.ContainerImage;
  containerPort: number;
  environment?: Record<string, string>;
  healthCheckCommand?: string[];
  cpu?: number;
  memoryLimitMiB?: number;
  desiredCount?: number;
  minCapacity?: number;
  maxCapacity?: number;
  streamPrefix?: string;
  secretPath?: string;
}

export class FargatePrivateService extends Construct {
  public readonly service: ecs.FargateService;
  public readonly taskSecurityGroup: ec2.SecurityGroup;
  public readonly taskDefinition: ecs.FargateTaskDefinition;

  constructor(scope: Construct, id: string, props: FargatePrivateServiceProps) {
    super(scope, id);

    const cpu = props.cpu ?? 256;
    const memoryLimitMiB = props.memoryLimitMiB ?? 512;

    this.taskDefinition = new ecs.FargateTaskDefinition(this, 'TaskDef', {
      cpu,
      memoryLimitMiB,
    });

    if (props.secretPath) {
      const secret = secretsmanager.Secret.fromSecretNameV2(this, 'Secret', props.secretPath);
      secret.grantRead(this.taskDefinition.taskRole);
    }

    this.taskDefinition.addContainer('container', {
      image: props.image,
      essential: true,
      containerName: props.serviceName,
      portMappings: [{ containerPort: props.containerPort, protocol: ecs.Protocol.TCP }],
      healthCheck: {
        command: props.healthCheckCommand ?? ['CMD-SHELL', 'exit 0'],
        interval: cdk.Duration.seconds(30),
        timeout: cdk.Duration.seconds(5),
        retries: 3,
        startPeriod: cdk.Duration.seconds(10),
      },
      ...(props.environment && { environment: props.environment }),
      logging: ecs.LogDrivers.awsLogs({
        logGroup: props.logGroup,
        streamPrefix: props.streamPrefix ?? 'private',
      }),
    });

    this.taskSecurityGroup = new ec2.SecurityGroup(this, 'TaskSG', {
      vpc: props.vpc,
      description: 'Fargate task',
      allowAllOutbound: true,
    });
    this.taskSecurityGroup.addIngressRule(
      ec2.Peer.ipv4(props.vpc.vpcCidrBlock),
      ec2.Port.tcp(props.containerPort),
    );

    this.service = new ecs.FargateService(this, 'Service', {
      cluster: props.cluster,
      taskDefinition: this.taskDefinition,
      desiredCount: props.desiredCount ?? 1,
      securityGroups: [this.taskSecurityGroup],
      assignPublicIp: false,
      serviceName: props.serviceName,
    });

    const scaling = this.service.autoScaleTaskCount({
      minCapacity: props.minCapacity ?? 1,
      maxCapacity: props.maxCapacity ?? 2,
    });
    scaling.scaleOnCpuUtilization('CpuScaling', {
      targetUtilizationPercent: 70,
    });

    new cloudwatch.Alarm(this, 'CpuHighAlarm', {
      metric: this.service.metricCpuUtilization(),
      threshold: 80,
      evaluationPeriods: 3,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    });

    new cloudwatch.Alarm(this, 'MemoryHighAlarm', {
      metric: this.service.metricMemoryUtilization(),
      threshold: 80,
      evaluationPeriods: 3,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    });
  }
}
