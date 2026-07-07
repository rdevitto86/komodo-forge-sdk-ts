import * as cdk from 'aws-cdk-lib';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as logs from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';
import { MetricFilterAlarm } from './metricFilterAlarm.js';
export interface RotationFailureAlarmProps {
    logGroup: logs.ILogGroup;
    /**
     * Identifies what's rotating (e.g. "signing key", "client registry"). Used to build the
     * alarm/metric name and to match the corresponding `msg` field emitted by the rotation
     * reload callback (e.g. `{"msg":"failed to reload rotated signing key", ...}`).
     */
    label: string;
    metricNamespace: string;
    threshold: number;
    alarmName?: string;
    metricName?: string;
    evaluationPeriods?: number;
    metricPeriod?: cdk.Duration;
    metricStatistic?: string;
    comparisonOperator?: cloudwatch.ComparisonOperator;
    treatMissingData?: cloudwatch.TreatMissingData;
    metricValue?: string;
    defaultValue?: number;
}
/**
 * Thin preset over MetricFilterAlarm scoped to rotation-reload failures: fires when a
 * scheduled secret rotation (e.g. signing key, OAuth client registry) fails to reload and
 * the failure is only logged, not otherwise surfaced. Instantiate one per rotating secret.
 */
export declare class RotationFailureAlarm extends Construct {
    readonly metricFilterAlarm: MetricFilterAlarm;
    constructor(scope: Construct, id: string, props: RotationFailureAlarmProps);
}
//# sourceMappingURL=rotationFailureAlarm.d.ts.map