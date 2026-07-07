import * as cdk from 'aws-cdk-lib';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as logs from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';
import { MetricFilterAlarm } from './metricFilterAlarm.js';
/**
 * Thin preset over MetricFilterAlarm scoped to rotation-reload failures: fires when a
 * scheduled secret rotation (e.g. signing key, OAuth client registry) fails to reload and
 * the failure is only logged, not otherwise surfaced. Instantiate one per rotating secret.
 */
export class RotationFailureAlarm extends Construct {
    metricFilterAlarm;
    constructor(scope, id, props) {
        super(scope, id);
        this.metricFilterAlarm = new MetricFilterAlarm(this, 'MetricFilterAlarm', {
            logGroup: props.logGroup,
            filterPattern: `{ $.msg = "*failed to reload*${props.label}*" }`,
            metricNamespace: props.metricNamespace,
            metricName: props.metricName ?? `RotationFailure-${props.label}`,
            alarmName: props.alarmName ?? `RotationFailure-${props.label}`,
            threshold: props.threshold,
            ...(props.evaluationPeriods !== undefined && { evaluationPeriods: props.evaluationPeriods }),
            ...(props.metricPeriod && { metricPeriod: props.metricPeriod }),
            ...(props.metricStatistic && { metricStatistic: props.metricStatistic }),
            ...(props.comparisonOperator && { comparisonOperator: props.comparisonOperator }),
            ...(props.treatMissingData && { treatMissingData: props.treatMissingData }),
            ...(props.metricValue && { metricValue: props.metricValue }),
            ...(props.defaultValue !== undefined && { defaultValue: props.defaultValue }),
        });
    }
}
//# sourceMappingURL=rotationFailureAlarm.js.map