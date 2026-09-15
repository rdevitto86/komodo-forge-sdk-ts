import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as kms from 'aws-cdk-lib/aws-kms';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
export interface S3BucketProps {
    bucketName?: string;
    versioned?: boolean;
    encryption?: s3.BucketEncryption;
    encryptionKey?: kms.IKey;
    blockPublicAccess?: s3.BlockPublicAccess;
    objectOwnership?: s3.ObjectOwnership;
    enforceSSL?: boolean;
    lifecycleRules?: s3.LifecycleRule[];
    serverAccessLogsBucket?: s3.IBucket;
    serverAccessLogsPrefix?: string;
    removalPolicy?: cdk.RemovalPolicy;
    autoDeleteObjects?: boolean;
    readRoles?: iam.IRole[];
    readWriteRoles?: iam.IRole[];
    tags?: Record<string, string>;
}
export declare class S3Bucket extends Construct {
    readonly bucket: s3.Bucket;
    constructor(scope: Construct, id: string, props?: S3BucketProps);
}
//# sourceMappingURL=s3.d.ts.map