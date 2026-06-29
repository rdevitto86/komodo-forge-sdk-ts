import * as cdk from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as logs from 'aws-cdk-lib/aws-logs';
import { beforeEach, describe, expect, it } from 'vitest';
import { MetricFilterAlarm } from './metricFilterAlarm.js';
import { WafWebAcl } from './wafWebAcl.js';

describe('constructs/WafWebAcl', () => {
	let stack: cdk.Stack;

	beforeEach(() => {
		stack = new cdk.Stack();
	});

	it('creates WebACL with REGIONAL scope', () => {
		new WafWebAcl(stack, 'Waf', { metricPrefix: 'test' });
		const template = Template.fromStack(stack);
		template.hasResourceProperties('AWS::WAFv2::WebACL', {
			Scope: 'REGIONAL',
		});
	});

	it('adds managed rule groups with auto-incrementing priority', () => {
		new WafWebAcl(stack, 'Waf', {
			metricPrefix: 'test',
			managedRuleGroups: [{ name: 'AWSManagedRulesCommonRuleSet' }, { name: 'AWSManagedRulesSQLiRuleSet' }],
		});
		const template = Template.fromStack(stack);
		template.hasResourceProperties('AWS::WAFv2::WebACL', {
			Rules: Match.arrayWith([
				Match.objectLike({
					Name: 'AWSManagedRulesCommonRuleSet',
					Priority: 1,
					Statement: {
						ManagedRuleGroupStatement: {
							VendorName: 'AWS',
							Name: 'AWSManagedRulesCommonRuleSet',
						},
					},
				}),
				Match.objectLike({
					Name: 'AWSManagedRulesSQLiRuleSet',
					Priority: 2,
					Statement: {
						ManagedRuleGroupStatement: {
							VendorName: 'AWS',
							Name: 'AWSManagedRulesSQLiRuleSet',
						},
					},
				}),
			]),
		});
	});

	it('adds global rate limit rule when globalRateLimit provided', () => {
		new WafWebAcl(stack, 'Waf', {
			metricPrefix: 'test',
			globalRateLimit: 2000,
		});
		const template = Template.fromStack(stack);
		template.hasResourceProperties('AWS::WAFv2::WebACL', {
			Rules: Match.arrayWith([
				Match.objectLike({
					Name: 'GlobalRateLimit',
					Action: { Block: {} },
					Statement: {
						RateBasedStatement: {
							Limit: 2000,
							AggregateKeyType: 'IP',
						},
					},
				}),
			]),
		});
	});

	it('adds path-scoped rate limit rules', () => {
		new WafWebAcl(stack, 'Waf', {
			metricPrefix: 'test',
			rateLimitRules: [{ name: 'LoginLimit', limit: 100, pathPrefix: '/api/login' }],
		});
		const template = Template.fromStack(stack);
		template.hasResourceProperties('AWS::WAFv2::WebACL', {
			Rules: Match.arrayWith([
				Match.objectLike({
					Name: 'LoginLimit',
					Action: { Block: {} },
					Statement: {
						RateBasedStatement: Match.objectLike({
							Limit: 100,
							AggregateKeyType: 'IP',
							ScopeDownStatement: {
								ByteMatchStatement: Match.objectLike({
									SearchString: '/api/login',
									PositionalConstraint: 'STARTS_WITH',
								}),
							},
						}),
					},
				}),
			]),
		});
	});

	it('associates with ALB when associateAlb provided', () => {
		const vpc = new ec2.Vpc(stack, 'Vpc');
		const alb = new cdk.aws_elasticloadbalancingv2.ApplicationLoadBalancer(stack, 'Alb', {
			vpc,
			internetFacing: true,
		});
		new WafWebAcl(stack, 'Waf', {
			metricPrefix: 'test',
			associateAlb: alb,
		});
		const template = Template.fromStack(stack);
		template.hasResource('AWS::WAFv2::WebACLAssociation', {});
	});

	it('does not create association when associateAlb omitted', () => {
		new WafWebAcl(stack, 'Waf', { metricPrefix: 'test' });
		const template = Template.fromStack(stack);
		const assocs = template.findResources('AWS::WAFv2::WebACLAssociation');
		expect(Object.keys(assocs).length).toBe(0);
	});

	it('rule count matches managed groups + global + rate limit rules', () => {
		new WafWebAcl(stack, 'Waf', {
			metricPrefix: 'test',
			managedRuleGroups: [{ name: 'AWSManagedRulesCommonRuleSet' }, { name: 'AWSManagedRulesSQLiRuleSet' }],
			globalRateLimit: 2000,
			rateLimitRules: [
				{ name: 'LoginLimit', limit: 100, pathPrefix: '/api/login' },
				{ name: 'SignupLimit', limit: 50, pathPrefix: '/api/signup' },
			],
		});
		const template = Template.fromStack(stack);
		template.hasResourceProperties('AWS::WAFv2::WebACL', {
			Rules: Match.arrayWith([
				Match.objectLike({ Priority: 1 }),
				Match.objectLike({ Priority: 2 }),
				Match.objectLike({ Priority: 3 }),
				Match.objectLike({ Priority: 4 }),
				Match.objectLike({ Priority: 5 }),
			]),
		});
		const webAcls = template.findResources('AWS::WAFv2::WebACL');
		const aclKey = Object.keys(webAcls)[0]!;
		const rules = webAcls[aclKey]!.Properties.Rules as unknown[];
		expect(rules.length).toBe(5);
	});
});

describe('constructs/MetricFilterAlarm', () => {
	let stack: cdk.Stack;
	let logGroup: logs.LogGroup;

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
		const template = Template.fromStack(stack);
		template.hasResourceProperties('AWS::Logs::MetricFilter', {
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
		const template = Template.fromStack(stack);
		template.hasResourceProperties('AWS::CloudWatch::Alarm', {
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
		const template = Template.fromStack(stack);
		template.hasResourceProperties('AWS::CloudWatch::Alarm', {
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
		const template = Template.fromStack(stack);
		template.hasResourceProperties('AWS::CloudWatch::Alarm', {
			Threshold: 1,
			EvaluationPeriods: 2,
			Period: 60,
			Statistic: 'Average',
			ComparisonOperator: 'GreaterThanOrEqualToThreshold',
			TreatMissingData: 'breaching',
		});
	});
});
