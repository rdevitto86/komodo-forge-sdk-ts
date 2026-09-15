import * as cdk from 'aws-cdk-lib';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import type * as sns from 'aws-cdk-lib/aws-sns';
import { Construct } from 'constructs';
import { Alarm } from './alarm.js';

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

const DEFAULT_PERIOD = cdk.Duration.minutes(1);
const DEFAULT_UNHEALTHY_HOSTS = 1;
const DEFAULT_TARGET_ERRORS = 5;
const DEFAULT_LOAD_BALANCER_ERRORS = 0;

export class RollbackAlarm extends Construct {
	public readonly unhealthyHostsAlarm: cloudwatch.Alarm;
	public readonly targetErrorsAlarm: cloudwatch.Alarm;
	public readonly loadBalancerErrorsAlarm?: cloudwatch.Alarm;

	constructor(scope: Construct, id: string, props: RollbackAlarmProps) {
		super(scope, id);

		const period = props.period ?? DEFAULT_PERIOD;
		const thresholds = props.thresholds ?? {};
		const evaluation = props.evaluation ?? {};
		const alarmActions = props.alarmActions ?? [];
		const prefix = props.alarmNamePrefix ?? id;

		this.unhealthyHostsAlarm = new Alarm(this, 'UnhealthyHosts', {
			alarmName: `${prefix}-unhealthy-hosts`,
			alarmDescription: 'Rollback trigger: targets failing health checks after deployment',
			metric: props.targetGroup.metrics.unhealthyHostCount({ period, statistic: 'Maximum' }),
			threshold: thresholds.unhealthyHosts ?? DEFAULT_UNHEALTHY_HOSTS,
			comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
			evaluationPeriods: evaluation.unhealthyHostPeriods ?? 3,
			datapointsToAlarm: evaluation.unhealthyHostDatapoints ?? 2,
			treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
			alarmActions,
		}).alarm;

		this.targetErrorsAlarm = new Alarm(this, 'TargetErrors', {
			alarmName: `${prefix}-target-5xx`,
			alarmDescription: 'Rollback trigger: application returning 5xx under live traffic',
			metric: props.targetGroup.metrics.httpCodeTarget(elbv2.HttpCodeTarget.TARGET_5XX_COUNT, {
				period,
				statistic: 'Sum',
			}),
			threshold: thresholds.targetErrorsPerPeriod ?? DEFAULT_TARGET_ERRORS,
			comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
			evaluationPeriods: evaluation.targetErrorPeriods ?? 5,
			datapointsToAlarm: evaluation.targetErrorDatapoints ?? 3,
			treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
			alarmActions,
		}).alarm;

		if (props.loadBalancer) {
			this.loadBalancerErrorsAlarm = new Alarm(this, 'LoadBalancerErrors', {
				alarmName: `${prefix}-elb-5xx`,
				alarmDescription: 'Rollback trigger: load balancer found no healthy target to route to',
				metric: props.loadBalancer.metrics.httpCodeElb(elbv2.HttpCodeElb.ELB_5XX_COUNT, {
					period,
					statistic: 'Sum',
				}),
				threshold: thresholds.loadBalancerErrorsPerPeriod ?? DEFAULT_LOAD_BALANCER_ERRORS,
				comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
				evaluationPeriods: evaluation.loadBalancerErrorPeriods ?? 2,
				datapointsToAlarm: evaluation.loadBalancerErrorDatapoints ?? 2,
				treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
				alarmActions,
			}).alarm;
		}
	}

	public get alarms(): cloudwatch.Alarm[] {
		const all = [this.unhealthyHostsAlarm, this.targetErrorsAlarm];
		if (this.loadBalancerErrorsAlarm) all.push(this.loadBalancerErrorsAlarm);
		return all;
	}
}
