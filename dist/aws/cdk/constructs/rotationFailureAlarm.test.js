import * as cdk from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import * as logs from 'aws-cdk-lib/aws-logs';
import { beforeEach, describe, it } from 'vitest';
import { RotationFailureAlarm } from './rotationFailureAlarm.js';
describe('constructs/RotationFailureAlarm', () => {
    let stack;
    let logGroup;
    beforeEach(() => {
        stack = new cdk.Stack();
        logGroup = new logs.LogGroup(stack, 'LogGroup');
    });
    it('builds a metric filter matching the rotation-failure log message for the given label', () => {
        new RotationFailureAlarm(stack, 'SigningKeyRotation', {
            logGroup,
            label: 'signing key',
            metricNamespace: 'AuthApi',
            threshold: 0,
        });
        Template.fromStack(stack).hasResourceProperties('AWS::Logs::MetricFilter', {
            FilterPattern: '{ $.msg = "*failed to reload*signing key*" }',
            MetricTransformations: Match.arrayWith([
                Match.objectLike({
                    MetricNamespace: 'AuthApi',
                    MetricName: 'RotationFailure-signing key',
                    MetricValue: '1',
                    DefaultValue: 0,
                }),
            ]),
        });
    });
    it('derives distinct alarms per rotating secret label', () => {
        new RotationFailureAlarm(stack, 'ClientRegistryRotation', {
            logGroup,
            label: 'client registry',
            metricNamespace: 'AuthApi',
            threshold: 0,
        });
        Template.fromStack(stack).hasResourceProperties('AWS::CloudWatch::Alarm', {
            AlarmName: 'RotationFailure-client registry',
            Namespace: 'AuthApi',
            MetricName: 'RotationFailure-client registry',
            Threshold: 0,
        });
    });
    it('allows overriding alarmName and metricName', () => {
        new RotationFailureAlarm(stack, 'SigningKeyRotation', {
            logGroup,
            label: 'signing key',
            metricNamespace: 'AuthApi',
            threshold: 0,
            alarmName: 'CustomRotationAlarm',
            metricName: 'CustomRotationMetric',
        });
        Template.fromStack(stack).hasResourceProperties('AWS::CloudWatch::Alarm', {
            AlarmName: 'CustomRotationAlarm',
            MetricName: 'CustomRotationMetric',
        });
    });
    it('passes through threshold, evaluationPeriods, and alarm tuning options', () => {
        new RotationFailureAlarm(stack, 'SigningKeyRotation', {
            logGroup,
            label: 'signing key',
            metricNamespace: 'AuthApi',
            threshold: 1,
            evaluationPeriods: 2,
            metricPeriod: cdk.Duration.minutes(15),
        });
        Template.fromStack(stack).hasResourceProperties('AWS::CloudWatch::Alarm', {
            Threshold: 1,
            EvaluationPeriods: 2,
            Period: 900,
            ComparisonOperator: 'GreaterThanThreshold',
            TreatMissingData: 'notBreaching',
        });
    });
});
//# sourceMappingURL=rotationFailureAlarm.test.js.map