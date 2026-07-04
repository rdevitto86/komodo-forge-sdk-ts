import * as cdk from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as logs from 'aws-cdk-lib/aws-logs';
import { beforeEach, describe, expect, it } from 'vitest';
import { LambdaFunction, type LambdaFunctionProps } from './lambda.js';

describe('constructs/LambdaFunction', () => {
	let stack: cdk.Stack;
	let baseProps: LambdaFunctionProps;

	beforeEach(() => {
		stack = new cdk.Stack();
		baseProps = {
			functionName: 'test-function',
			code: lambda.Code.fromInline('exports.handler = async () => {};'),
			handler: 'index.handler',
		};
	});

	it('creates a function with default runtime, memory, timeout, and tracing', () => {
		new LambdaFunction(stack, 'Fn', baseProps);

		Template.fromStack(stack).hasResourceProperties(
			'AWS::Lambda::Function',
			Match.objectLike({
				FunctionName: 'test-function',
				Handler: 'index.handler',
				Runtime: 'nodejs20.x',
				MemorySize: 128,
				Timeout: 30,
				TracingConfig: { Mode: 'Active' },
			}),
		);
	});

	it('applies overrides for runtime, memory, timeout, and environment', () => {
		new LambdaFunction(stack, 'Fn', {
			...baseProps,
			runtime: lambda.Runtime.NODEJS_22_X,
			memorySize: 512,
			timeout: cdk.Duration.seconds(60),
			environment: { FOO: 'bar' },
		});

		Template.fromStack(stack).hasResourceProperties(
			'AWS::Lambda::Function',
			Match.objectLike({
				Runtime: 'nodejs22.x',
				MemorySize: 512,
				Timeout: 60,
				Environment: { Variables: { FOO: 'bar' } },
			}),
		);
	});

	it('attaches provided policy statements to the function role', () => {
		const construct = new LambdaFunction(stack, 'Fn', {
			...baseProps,
			permissions: [new iam.PolicyStatement({ actions: ['s3:GetObject'], resources: ['*'] })],
		});
		expect(construct.function).toBeDefined();

		Template.fromStack(stack).hasResourceProperties(
			'AWS::IAM::Policy',
			Match.objectLike({
				PolicyDocument: {
					Statement: Match.arrayWith([Match.objectLike({ Action: 's3:GetObject', Effect: 'Allow' })]),
					Version: '2012-10-17',
				},
			}),
		);
	});

	it('applies tags to the function', () => {
		new LambdaFunction(stack, 'Fn', { ...baseProps, tags: { owner: 'test-owner' } });

		Template.fromStack(stack).hasResourceProperties(
			'AWS::Lambda::Function',
			Match.objectLike({
				Tags: Match.arrayWith([{ Key: 'owner', Value: 'test-owner' }]),
			}),
		);
	});

	it('auto-creates a default log group with 7-day retention when logGroup is omitted', () => {
		new LambdaFunction(stack, 'Fn', baseProps);

		Template.fromStack(stack).hasResourceProperties(
			'AWS::Logs::LogGroup',
			Match.objectLike({
				LogGroupName: '/aws/lambda/test-function',
				RetentionInDays: 7,
			}),
		);
	});

	it('uses a caller-provided log group instead of creating a default one', () => {
		new LambdaFunction(stack, 'Fn', {
			...baseProps,
			logGroup: new logs.LogGroup(stack, 'CustomLogGroup', {
				logGroupName: '/custom/log-group',
				retention: logs.RetentionDays.ONE_MONTH,
			})
		});
		const template = Template.fromStack(stack);
		const logGroups = template.findResources('AWS::Logs::LogGroup');
		expect(Object.keys(logGroups).length).toBe(1);

		template.hasResourceProperties(
			'AWS::Logs::LogGroup',
			Match.objectLike({
				LogGroupName: '/custom/log-group',
				RetentionInDays: 30,
			}),
		);
	});

	it('sets deadLetterQueueEnabled when true', () => {
		new LambdaFunction(stack, 'Fn', { ...baseProps, deadLetterQueueEnabled: true });

		Template.fromStack(stack).hasResourceProperties(
			'AWS::Lambda::Function',
			Match.objectLike({
				DeadLetterConfig: Match.objectLike({}),
			}),
		);
	});

	it('applies reservedConcurrentExecutions override', () => {
		new LambdaFunction(stack, 'Fn', { ...baseProps, reservedConcurrentExecutions: 5 });

		Template.fromStack(stack).hasResourceProperties(
			'AWS::Lambda::Function',
			Match.objectLike({
				ReservedConcurrentExecutions: 5,
			}),
		);
	});

	it('uses a caller-provided role instead of an auto-generated one', () => {
		const role = new iam.Role(stack, 'CustomRole', { assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com') });
		new LambdaFunction(stack, 'Fn', { ...baseProps, role });
		const template = Template.fromStack(stack);
		const roleLogicalId = stack.getLogicalId(role.node.defaultChild as cdk.CfnElement);

		template.hasResourceProperties(
			'AWS::Lambda::Function',
			Match.objectLike({
				Role: { 'Fn::GetAtt': [roleLogicalId, 'Arn'] },
			}),
		);
		const roles = template.findResources('AWS::IAM::Role');
		expect(Object.keys(roles).length).toBe(1);
	});
});
