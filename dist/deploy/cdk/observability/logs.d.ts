import * as cdk from 'aws-cdk-lib';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as kms from 'aws-cdk-lib/aws-kms';
export interface LogGroupProps {
    stack: cdk.Stack;
    logGroupName?: string;
    retention?: logs.RetentionDays;
    removalPolicy?: cdk.RemovalPolicy;
    encryptionKey?: kms.IKey;
    tags?: Record<string, string>;
}
export declare class LogGroupBuilder {
    private props;
    constructor(stack: cdk.Stack);
    setLogGroupName(name: string): this;
    setRetention(retention: logs.RetentionDays): this;
    setRemovalPolicy(policy: cdk.RemovalPolicy): this;
    setEncryptionKey(key: kms.IKey): this;
    setTags(tags: Record<string, string>): this;
    build(): logs.LogGroup;
}
export declare const createLogGroup: (stack: cdk.Stack, props?: Partial<LogGroupProps>) => LogGroupBuilder;
//# sourceMappingURL=logs.d.ts.map