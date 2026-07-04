import * as cdk from 'aws-cdk-lib';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as sns from 'aws-cdk-lib/aws-sns';
import { Construct } from 'constructs';
export interface AlarmProps {
    alarmName?: string;
    metric: cloudwatch.IMetric;
    threshold?: number;
    comparisonOperator?: cloudwatch.ComparisonOperator;
    evaluationPeriods?: number;
    treatMissingData?: cloudwatch.TreatMissingData;
    alarmDescription?: string;
    actionsEnabled?: boolean;
    alarmActions?: sns.ITopic[];
    okActions?: sns.ITopic[];
    insufficientDataActions?: sns.ITopic[];
    datapointsToAlarm?: number;
    period?: cdk.Duration;
}
export declare class Alarm extends Construct {
    readonly alarm: cloudwatch.Alarm;
    constructor(scope: Construct, id: string, props: AlarmProps);
}
//# sourceMappingURL=alarm.d.ts.map