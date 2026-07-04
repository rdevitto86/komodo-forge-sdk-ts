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

export class Alarm extends Construct {
	public readonly alarm: cloudwatch.Alarm;

	constructor(scope: Construct, id: string, props: AlarmProps) {
		super(scope, id);

		this.alarm = new cloudwatch.Alarm(this, props.alarmName ?? 'Alarm', {
			metric: props.metric,
			threshold: props.threshold ?? 0,
			comparisonOperator: props.comparisonOperator ?? cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
			evaluationPeriods: props.evaluationPeriods ?? 1,
			...(props.treatMissingData && { treatMissingData: props.treatMissingData }),
			...(props.alarmDescription && { alarmDescription: props.alarmDescription }),
			...(props.actionsEnabled !== undefined && { actionsEnabled: props.actionsEnabled }),
			...(props.alarmActions && { alarmActions: props.alarmActions }),
			...(props.okActions && { okActions: props.okActions }),
			...(props.insufficientDataActions && { insufficientDataActions: props.insufficientDataActions }),
			...(props.datapointsToAlarm && { datapointsToAlarm: props.datapointsToAlarm }),
			...(props.period && { period: props.period }),
		});
	}
}
