import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as logs from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';
import { LogGroup } from './logGroup.js';

export interface LambdaFunctionProps {
	functionName: string;
	code: lambda.Code;
	handler: string;
	runtime?: lambda.Runtime;
	environment?: Record<string, string>;
	memorySize?: number;
	timeout?: cdk.Duration;
	reservedConcurrentExecutions?: number;
	role?: iam.IRole;
	logGroup?: logs.ILogGroup;
	tracing?: lambda.Tracing;
	deadLetterQueueEnabled?: boolean;
	permissions?: iam.PolicyStatement[];
	tags?: Record<string, string>;
}

export class LambdaFunction extends Construct {
	readonly function: lambda.Function;

	constructor(scope: Construct, id: string, props: LambdaFunctionProps) {
		super(scope, id);

		const logGroup =
			props.logGroup ??
			new LogGroup(this, 'LogGroup', {
				logGroupName: `/aws/lambda/${props.functionName}`,
				retention: logs.RetentionDays.ONE_WEEK,
			}).logGroup;

		this.function = new lambda.Function(this, 'Function', {
			functionName: props.functionName,
			runtime: props.runtime ?? lambda.Runtime.NODEJS_20_X,
			handler: props.handler,
			code: props.code,
			memorySize: props.memorySize ?? 128,
			timeout: props.timeout ?? cdk.Duration.seconds(30),
			tracing: props.tracing ?? lambda.Tracing.ACTIVE,
			deadLetterQueueEnabled: props.deadLetterQueueEnabled ?? false,
			logGroup,
			...(props.environment && { environment: props.environment }),
			...(props.reservedConcurrentExecutions !== undefined && {
				reservedConcurrentExecutions: props.reservedConcurrentExecutions,
			}),
			...(props.role && { role: props.role }),
		});

		for (const permission of props.permissions ?? []) {
			this.function.addToRolePolicy(permission);
		}

		for (const [key, value] of Object.entries(props.tags ?? {})) {
			cdk.Tags.of(this.function).add(key, value);
		}
	}
}
