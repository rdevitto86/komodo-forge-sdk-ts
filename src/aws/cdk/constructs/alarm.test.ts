import * as cdk from 'aws-cdk-lib';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as sns from 'aws-cdk-lib/aws-sns';
import { beforeEach, describe, expect, it } from 'vitest';
import { Alarm } from './alarm.js';

describe('constructs/alarm', () => {
	let mockStack: cdk.Stack;
	let mockMetric: cloudwatch.IMetric;

	beforeEach(() => {
		mockStack = new cdk.Stack();
		mockMetric = new cloudwatch.Metric({
			namespace: 'TestNamespace',
			metricName: 'TestMetric',
			statistic: 'Average',
			period: cdk.Duration.seconds(300),
		});
	});

	it('should build alarm with defaults', () => {
		const construct = new Alarm(mockStack, 'Alarm', { metric: mockMetric });
		expect(construct.alarm).toBeInstanceOf(cloudwatch.Alarm);
	});

	it('should build alarm with custom values', () => {
		const construct = new Alarm(mockStack, 'Alarm', {
			alarmName: 'custom-alarm',
			metric: mockMetric,
			threshold: 90,
			comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
			evaluationPeriods: 3,
			alarmDescription: 'Custom alarm description',
		});
		expect(construct.alarm).toBeInstanceOf(cloudwatch.Alarm);
	});

	it('should build alarm with treat missing data', () => {
		const construct = new Alarm(mockStack, 'Alarm', {
			metric: mockMetric,
			treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
		});
		expect(construct.alarm).toBeInstanceOf(cloudwatch.Alarm);
	});

	it('should build alarm with actions enabled', () => {
		const construct = new Alarm(mockStack, 'Alarm', { metric: mockMetric, actionsEnabled: true });
		expect(construct.alarm).toBeInstanceOf(cloudwatch.Alarm);
	});

	it('should build alarm with alarm actions', () => {
		const topic1 = new sns.Topic(mockStack, 'TestTopic1');
		const topic2 = new sns.Topic(mockStack, 'TestTopic2');
		const construct = new Alarm(mockStack, 'Alarm', { metric: mockMetric, alarmActions: [topic1, topic2] });
		expect(construct.alarm).toBeInstanceOf(cloudwatch.Alarm);
	});

	it('should build alarm with ok actions', () => {
		const topic1 = new sns.Topic(mockStack, 'TestTopic1');
		const topic2 = new sns.Topic(mockStack, 'TestTopic2');
		const construct = new Alarm(mockStack, 'Alarm', { metric: mockMetric, okActions: [topic1, topic2] });
		expect(construct.alarm).toBeInstanceOf(cloudwatch.Alarm);
	});

	it('should build alarm with insufficient data actions', () => {
		const topic1 = new sns.Topic(mockStack, 'TestTopic1');
		const topic2 = new sns.Topic(mockStack, 'TestTopic2');
		const construct = new Alarm(mockStack, 'Alarm', {
			metric: mockMetric,
			insufficientDataActions: [topic1, topic2],
		});
		expect(construct.alarm).toBeInstanceOf(cloudwatch.Alarm);
	});

	it('should build alarm with datapoints to alarm', () => {
		const construct = new Alarm(mockStack, 'Alarm', { metric: mockMetric, datapointsToAlarm: 3 });
		expect(construct.alarm).toBeInstanceOf(cloudwatch.Alarm);
	});

	it('should build alarm with period', () => {
		const construct = new Alarm(mockStack, 'Alarm', { metric: mockMetric, period: cdk.Duration.seconds(300) });
		expect(construct.alarm).toBeInstanceOf(cloudwatch.Alarm);
	});
});
