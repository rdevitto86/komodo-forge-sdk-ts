import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as logs from 'aws-cdk-lib/aws-logs';
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
export declare class FargateService extends Construct {
    readonly service: ecs.FargateService;
    readonly blueService?: ecs.FargateService;
    readonly greenService?: ecs.FargateService;
    readonly alb: elbv2.ApplicationLoadBalancer;
    readonly albSecurityGroup: ec2.SecurityGroup;
    readonly taskSecurityGroup: ec2.SecurityGroup;
    readonly taskDefinition: ecs.FargateTaskDefinition;
    readonly blueTargetGroup?: elbv2.ApplicationTargetGroup;
    readonly greenTargetGroup?: elbv2.ApplicationTargetGroup;
    constructor(scope: Construct, id: string, props: FargateServiceProps);
}
//# sourceMappingURL=fargate.d.ts.map