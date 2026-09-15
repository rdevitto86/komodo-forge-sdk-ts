import * as cdk from 'aws-cdk-lib';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import type * as sns from 'aws-cdk-lib/aws-sns';
import { Construct } from 'constructs';
export interface RollbackAlarmThresholds {
    unhealthyHosts?: number;
    targetErrorsPerPeriod?: number;
    loadBalancerErrorsPerPeriod?: number;
}
export interface RollbackAlarmEvaluation {
    unhealthyHostPeriods?: number;
    unhealthyHostDatapoints?: number;
    targetErrorPeriods?: number;
    targetErrorDatapoints?: number;
    loadBalancerErrorPeriods?: number;
    loadBalancerErrorDatapoints?: number;
}
export interface RollbackAlarmProps {
    targetGroup: elbv2.IApplicationTargetGroup;
    loadBalancer?: elbv2.IApplicationLoadBalancer;
    period?: cdk.Duration;
    thresholds?: RollbackAlarmThresholds;
    evaluation?: RollbackAlarmEvaluation;
    alarmActions?: sns.ITopic[];
    alarmNamePrefix?: string;
}
export declare class RollbackAlarm extends Construct {
    readonly unhealthyHostsAlarm: cloudwatch.Alarm;
    readonly targetErrorsAlarm: cloudwatch.Alarm;
    readonly loadBalancerErrorsAlarm?: cloudwatch.Alarm;
    constructor(scope: Construct, id: string, props: RollbackAlarmProps);
    get alarms(): cloudwatch.Alarm[];
}
//# sourceMappingURL=rollbackAlarm.d.ts.map