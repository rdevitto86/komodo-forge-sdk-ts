import * as cdk from 'aws-cdk-lib';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';
import type { DeployColor } from '../config/index.js';

export interface FargateServiceProps {
	vpc: ec2.IVpc;
	cluster: ecs.ICluster;
	logGroup: logs.ILogGroup;
	serviceName: string;
	image: ecs.ContainerImage;
	port: number;
	privatePort?: number;
	environment?: Record<string, string>;
	healthCheckCommand?: string[];
	healthCheckPath?: string;
	certificateArn: string;
	cpu?: number;
	memoryLimitMiB?: number;
	desiredCount?: number;
	minCapacity?: number;
	maxCapacity?: number;
	streamPrefix?: string;
	secretPath?: string;
	enableBlueGreen?: boolean;
	deployColor?: DeployColor;
	albSecurityGroup?: ec2.SecurityGroup;
	taskSecurityGroup?: ec2.SecurityGroup;
	requireExplicitSecurityGroups?: boolean;
	alarmThresholds?: {
		cpuPercent?: number;
		memoryPercent?: number;
		unhealthyTargets?: number;
		high5xxErrors?: number;
	};
}

export class FargateService extends Construct {
	readonly service: ecs.FargateService;
	readonly blueService?: ecs.FargateService;
	readonly greenService?: ecs.FargateService;
	readonly alb: elbv2.ApplicationLoadBalancer;
	readonly albSecurityGroup: ec2.SecurityGroup;
	readonly taskSecurityGroup: ec2.SecurityGroup;
	readonly taskDefinition: ecs.FargateTaskDefinition;
	readonly blueTargetGroup?: elbv2.ApplicationTargetGroup;
	readonly greenTargetGroup?: elbv2.ApplicationTargetGroup;

	constructor(scope: Construct, id: string, props: FargateServiceProps) {
		super(scope, id);

		const healthCheckPath = props.healthCheckPath ?? '/health';
		const alarmThresholds = props.alarmThresholds ?? {};
		const deployColor: DeployColor = props.deployColor ?? 'blue';

		if (props.requireExplicitSecurityGroups && (!props.albSecurityGroup || !props.taskSecurityGroup)) {
			throw new Error(
				'missing required albSecurityGroup or taskSecurityGroup when requireExplicitSecurityGroups is set',
			);
		}

		this.albSecurityGroup =
			props.albSecurityGroup ??
			new ec2.SecurityGroup(this, 'AlbSG', {
				vpc: props.vpc,
				description: 'ALB ingress',
				allowAllOutbound: true,
			});
		this.albSecurityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80));
		this.albSecurityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(443));

		this.taskSecurityGroup =
			props.taskSecurityGroup ??
			new ec2.SecurityGroup(this, 'TaskSG', {
				vpc: props.vpc,
				description: 'Fargate task',
				allowAllOutbound: true,
			});
		this.taskSecurityGroup.addIngressRule(this.albSecurityGroup, ec2.Port.tcp(props.port));
		if (props.privatePort) {
			this.taskSecurityGroup.addIngressRule(ec2.Peer.ipv4(props.vpc.vpcCidrBlock), ec2.Port.tcp(props.privatePort));
		}

		this.taskDefinition = new ecs.FargateTaskDefinition(this, 'TaskDef', {
			cpu: props.cpu ?? 256,
			memoryLimitMiB: props.memoryLimitMiB ?? 512,
		});

		if (props.secretPath) {
			secretsmanager.Secret.fromSecretNameV2(this, 'Secret', props.secretPath).grantRead(this.taskDefinition.taskRole);
		}

		const portMappings = [{ containerPort: props.port, protocol: ecs.Protocol.TCP }];
		if (props.privatePort) {
			portMappings.push({ containerPort: props.privatePort, protocol: ecs.Protocol.TCP });
		}

		this.taskDefinition.addContainer('container', {
			image: props.image,
			essential: true,
			containerName: props.serviceName,
			portMappings,
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
				streamPrefix: props.streamPrefix ?? 'service',
			}),
		});

		if (props.enableBlueGreen) {
			this.blueTargetGroup = new elbv2.ApplicationTargetGroup(this, 'BlueTargetGroup', {
				vpc: props.vpc,
				port: props.port,
				protocol: elbv2.ApplicationProtocol.HTTP,
				healthCheck: {
					path: healthCheckPath,
					interval: cdk.Duration.seconds(30),
					timeout: cdk.Duration.seconds(5),
				},
			});

			this.greenTargetGroup = new elbv2.ApplicationTargetGroup(this, 'GreenTargetGroup', {
				vpc: props.vpc,
				port: props.port,
				protocol: elbv2.ApplicationProtocol.HTTP,
				healthCheck: {
					path: healthCheckPath,
					interval: cdk.Duration.seconds(30),
					timeout: cdk.Duration.seconds(5),
				},
			});

			const blueDesiredCount = deployColor === 'blue' ? (props.desiredCount ?? 1) : 0;
			const greenDesiredCount = deployColor === 'green' ? (props.desiredCount ?? 1) : 0;
			const blueMinCapacity = deployColor === 'blue' ? (props.minCapacity ?? 1) : 0;
			const greenMinCapacity = deployColor === 'green' ? (props.minCapacity ?? 1) : 0;

			this.blueService = new ecs.FargateService(this, 'BlueService', {
				cluster: props.cluster,
				taskDefinition: this.taskDefinition,
				desiredCount: blueDesiredCount,
				securityGroups: [this.taskSecurityGroup],
				assignPublicIp: false,
				serviceName: `${props.serviceName}-blue`,
			});

			this.greenService = new ecs.FargateService(this, 'GreenService', {
				cluster: props.cluster,
				taskDefinition: this.taskDefinition,
				desiredCount: greenDesiredCount,
				securityGroups: [this.taskSecurityGroup],
				assignPublicIp: false,
				serviceName: `${props.serviceName}-green`,
			});

			this.blueService
				.autoScaleTaskCount({
					minCapacity: blueMinCapacity,
					maxCapacity: props.maxCapacity ?? 2,
				})
				.scaleOnCpuUtilization('CpuScaling', { targetUtilizationPercent: 70 });

			this.greenService
				.autoScaleTaskCount({
					minCapacity: greenMinCapacity,
					maxCapacity: props.maxCapacity ?? 2,
				})
				.scaleOnCpuUtilization('CpuScaling', { targetUtilizationPercent: 70 });

			this.service = deployColor === 'green' ? this.greenService : this.blueService;
		} else {
			this.service = new ecs.FargateService(this, 'Service', {
				cluster: props.cluster,
				taskDefinition: this.taskDefinition,
				desiredCount: props.desiredCount ?? 1,
				securityGroups: [this.taskSecurityGroup],
				assignPublicIp: false,
				serviceName: props.serviceName,
			});

			this.service
				.autoScaleTaskCount({
					minCapacity: props.minCapacity ?? 1,
					maxCapacity: props.maxCapacity ?? 2,
				})
				.scaleOnCpuUtilization('CpuScaling', { targetUtilizationPercent: 70 });
		}

		new cloudwatch.Alarm(this, 'CpuHighAlarm', {
			metric: this.service.metricCpuUtilization(),
			threshold: alarmThresholds.cpuPercent ?? 80,
			evaluationPeriods: 3,
			comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
			treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
		});

		new cloudwatch.Alarm(this, 'MemoryHighAlarm', {
			metric: this.service.metricMemoryUtilization(),
			threshold: alarmThresholds.memoryPercent ?? 80,
			evaluationPeriods: 3,
			comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
			treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
		});

		this.alb = new elbv2.ApplicationLoadBalancer(this, 'ALB', {
			vpc: props.vpc,
			internetFacing: true,
			securityGroup: this.albSecurityGroup,
		});

		this.alb.addListener('HttpListener', {
			port: 80,
			protocol: elbv2.ApplicationProtocol.HTTP,
			defaultAction: elbv2.ListenerAction.redirect({
				protocol: 'HTTPS',
				port: '443',
				permanent: true,
			}),
		});

		const httpsListener = this.alb.addListener('HttpsListener', {
			port: 443,
			protocol: elbv2.ApplicationProtocol.HTTPS,
			sslPolicy: elbv2.SslPolicy.RECOMMENDED_TLS,
			certificates: [acm.Certificate.fromCertificateArn(this, 'Certificate', props.certificateArn)],
		});

		if (props.enableBlueGreen) {
			const activeTargetGroup = deployColor === 'green' ? this.greenTargetGroup! : this.blueTargetGroup!;
			const standbyTargetGroup = deployColor === 'green' ? this.blueTargetGroup! : this.greenTargetGroup!;
			const standbyColor = deployColor === 'green' ? 'blue' : 'green';

			httpsListener.addTargetGroups('ActiveTargetGroup', {
				targetGroups: [activeTargetGroup],
			});

			httpsListener.addTargetGroups('StandbyTargetGroup', {
				targetGroups: [standbyTargetGroup],
				priority: 100,
				conditions: [elbv2.ListenerCondition.httpHeader('X-Deploy-Color', [standbyColor])],
			});
		} else {
			httpsListener.addTargets('Target', {
				port: props.port,
				protocol: elbv2.ApplicationProtocol.HTTP,
				targets: [
					this.service.loadBalancerTarget({
						containerName: props.serviceName,
						containerPort: props.port,
					}),
				],
				healthCheck: {
					path: healthCheckPath,
					port: String(props.port),
					interval: cdk.Duration.seconds(30),
					timeout: cdk.Duration.seconds(5),
				},
			});
		}

		new cloudwatch.Alarm(this, 'UnhealthyTargetsAlarm', {
			metric: new cloudwatch.Metric({
				metricName: 'UnHealthyHostCount',
				namespace: 'AWS/ApplicationELB',
				dimensionsMap: { LoadBalancer: this.alb.loadBalancerArn },
				statistic: 'Average',
				period: cdk.Duration.seconds(60),
			}),
			threshold: alarmThresholds.unhealthyTargets ?? 1,
			evaluationPeriods: 2,
			comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
			treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
		});

		new cloudwatch.Alarm(this, 'High5xxErrorAlarm', {
			metric: new cloudwatch.Metric({
				metricName: 'HTTPCode_Target_5XX',
				namespace: 'AWS/ApplicationELB',
				dimensionsMap: { LoadBalancer: this.alb.loadBalancerArn },
				statistic: 'Sum',
				period: cdk.Duration.seconds(60),
			}),
			threshold: alarmThresholds.high5xxErrors ?? 5,
			evaluationPeriods: 2,
			comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
			treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
		});
	}
}
