import * as cdk from 'aws-cdk-lib';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as cloudwatchActions from 'aws-cdk-lib/aws-cloudwatch-actions';
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

const withPeriod = (metric: cloudwatch.IMetric, period?: cdk.Duration): cloudwatch.IMetric => {
	if (!period) return metric;
	if (metric instanceof cloudwatch.Metric) return metric.with({ period });
	if (metric instanceof cloudwatch.MathExpression) return metric.with({ period });
	return metric;
};

export class Alarm extends Construct {
	public readonly alarm: cloudwatch.Alarm;

	constructor(scope: Construct, id: string, props: AlarmProps) {
		super(scope, id);

		this.alarm = new cloudwatch.Alarm(this, props.alarmName ?? 'Alarm', {
			metric: withPeriod(props.metric, props.period),
			threshold: props.threshold ?? 0,
			comparisonOperator: props.comparisonOperator ?? cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
			evaluationPeriods: props.evaluationPeriods ?? 1,
			...(props.treatMissingData && { treatMissingData: props.treatMissingData }),
			...(props.alarmDescription && { alarmDescription: props.alarmDescription }),
			...(props.actionsEnabled !== undefined && { actionsEnabled: props.actionsEnabled }),
			...(props.datapointsToAlarm && { datapointsToAlarm: props.datapointsToAlarm }),
		});

		for (const topic of props.alarmActions ?? []) {
			this.alarm.addAlarmAction(new cloudwatchActions.SnsAction(topic));
		}
		for (const topic of props.okActions ?? []) {
			this.alarm.addOkAction(new cloudwatchActions.SnsAction(topic));
		}
		for (const topic of props.insufficientDataActions ?? []) {
			this.alarm.addInsufficientDataAction(new cloudwatchActions.SnsAction(topic));
		}
	}
}
