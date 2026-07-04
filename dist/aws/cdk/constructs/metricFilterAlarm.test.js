import * as cdk from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as logs from 'aws-cdk-lib/aws-logs';
import { beforeEach, describe, it } from 'vitest';
import { MetricFilterAlarm } from './metricFilterAlarm.js';
describe('constructs/MetricFilterAlarm', () => {
    let stack;
    let logGroup;
    beforeEach(() => {
        stack = new cdk.Stack();
        logGroup = new logs.LogGroup(stack, 'LogGroup');
    });
    it('creates a metric filter with correct namespace and metric name', () => {
        new MetricFilterAlarm(stack, 'MFA', {
            logGroup,
            filterPattern: '"ERROR"',
            metricNamespace: 'MyApp',
            metricName: 'ErrorCount',
            alarmName: 'ErrorAlarm',
            threshold: 5,
        });
        Template.fromStack(stack).hasResourceProperties('AWS::Logs::MetricFilter', {
            FilterPattern: '"ERROR"',
            MetricTransformations: Match.arrayWith([
                Match.objectLike({
                    MetricNamespace: 'MyApp',
                    MetricName: 'ErrorCount',
                    MetricValue: '1',
                    DefaultValue: 0,
                }),
            ]),
        });
    });
    it('creates an alarm with correct threshold and evaluation periods', () => {
        new MetricFilterAlarm(stack, 'MFA', {
            logGroup,
            filterPattern: '"ERROR"',
            metricNamespace: 'MyApp',
            metricName: 'ErrorCount',
            alarmName: 'ErrorAlarm',
            threshold: 5,
            evaluationPeriods: 3,
        });
        Template.fromStack(stack).hasResourceProperties('AWS::CloudWatch::Alarm', {
            AlarmName: 'ErrorAlarm',
            Threshold: 5,
            EvaluationPeriods: 3,
        });
    });
    it('uses default values when not specified', () => {
        new MetricFilterAlarm(stack, 'MFA', {
            logGroup,
            filterPattern: '"WARN"',
            metricNamespace: 'MyApp',
            metricName: 'WarnCount',
            alarmName: 'WarnAlarm',
            threshold: 10,
        });
        Template.fromStack(stack).hasResourceProperties('AWS::CloudWatch::Alarm', {
            EvaluationPeriods: 1,
            ComparisonOperator: 'GreaterThanThreshold',
            TreatMissingData: 'notBreaching',
            Period: 300,
            Statistic: 'Sum',
        });
    });
    it('uses custom values when provided', () => {
        new MetricFilterAlarm(stack, 'MFA', {
            logGroup,
            filterPattern: '"CRITICAL"',
            metricNamespace: 'MyApp',
            metricName: 'CriticalCount',
            alarmName: 'CriticalAlarm',
            threshold: 1,
            evaluationPeriods: 2,
            metricPeriod: cdk.Duration.minutes(1),
            metricStatistic: 'Average',
            comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
            treatMissingData: cloudwatch.TreatMissingData.BREACHING,
        });
        Template.fromStack(stack).hasResourceProperties('AWS::CloudWatch::Alarm', {
            Threshold: 1,
            EvaluationPeriods: 2,
            Period: 60,
            Statistic: 'Average',
            ComparisonOperator: 'GreaterThanOrEqualToThreshold',
            TreatMissingData: 'breaching',
        });
    });
    it('derives the alarm metric from the metric filter namespace and name', () => {
        new MetricFilterAlarm(stack, 'MFA', {
            logGroup,
            filterPattern: '"ERROR"',
            metricNamespace: 'DerivedNamespace',
            metricName: 'DerivedMetric',
            alarmName: 'DerivedAlarm',
            threshold: 5,
        });
        Template.fromStack(stack).hasResourceProperties('AWS::CloudWatch::Alarm', {
            AlarmName: 'DerivedAlarm',
            Namespace: 'DerivedNamespace',
            MetricName: 'DerivedMetric',
        });
    });
    it('applies metricValue and defaultValue overrides on the filter', () => {
        new MetricFilterAlarm(stack, 'MFA', {
            logGroup,
            filterPattern: '"ERROR"',
            metricNamespace: 'MyApp',
            metricName: 'ErrorCount',
            alarmName: 'ErrorAlarm',
            threshold: 5,
            metricValue: '$.errorCode',
            defaultValue: 42,
        });
        Template.fromStack(stack).hasResourceProperties('AWS::Logs::MetricFilter', {
            MetricTransformations: Match.arrayWith([
                Match.objectLike({
                    MetricValue: '$.errorCode',
                    DefaultValue: 42,
                }),
            ]),
        });
    });
});
//# sourceMappingURL=metricFilterAlarm.test.js.map