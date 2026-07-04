import * as cdk from 'aws-cdk-lib';
import * as kms from 'aws-cdk-lib/aws-kms';
import * as logs from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';
export interface LogGroupProps {
    logGroupName?: string;
    retention?: logs.RetentionDays;
    removalPolicy?: cdk.RemovalPolicy;
    encryptionKey?: kms.IKey;
    tags?: Record<string, string>;
}
export declare class LogGroup extends Construct {
    readonly logGroup: logs.LogGroup;
    constructor(scope: Construct, id: string, props?: LogGroupProps);
}
//# sourceMappingURL=logGroup.d.ts.map