import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as logs from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';
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
export declare class LambdaFunction extends Construct {
    readonly function: lambda.Function;
    constructor(scope: Construct, id: string, props: LambdaFunctionProps);
}
//# sourceMappingURL=lambda.d.ts.map