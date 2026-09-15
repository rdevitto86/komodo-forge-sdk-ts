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

export class S3Bucket extends Construct {
	public readonly bucket: s3.Bucket;

	constructor(scope: Construct, id: string, props: S3BucketProps = {}) {
		super(scope, id);

		this.bucket = new s3.Bucket(this, 'Resource', {
			...(props.bucketName && { bucketName: props.bucketName }),
			versioned: props.versioned ?? true,
			encryption: props.encryption ?? s3.BucketEncryption.S3_MANAGED,
			...(props.encryptionKey && { encryptionKey: props.encryptionKey }),
			blockPublicAccess: props.blockPublicAccess ?? s3.BlockPublicAccess.BLOCK_ALL,
			objectOwnership: props.objectOwnership ?? s3.ObjectOwnership.BUCKET_OWNER_ENFORCED,
			enforceSSL: props.enforceSSL ?? true,
			...(props.lifecycleRules && { lifecycleRules: props.lifecycleRules }),
			...(props.serverAccessLogsBucket && { serverAccessLogsBucket: props.serverAccessLogsBucket }),
			...(props.serverAccessLogsPrefix && { serverAccessLogsPrefix: props.serverAccessLogsPrefix }),
			removalPolicy: props.removalPolicy ?? cdk.RemovalPolicy.RETAIN,
			...(props.autoDeleteObjects !== undefined && { autoDeleteObjects: props.autoDeleteObjects }),
		});

		for (const role of props.readRoles ?? []) this.bucket.grantRead(role);
		for (const role of props.readWriteRoles ?? []) this.bucket.grantReadWrite(role);

		if (props.tags) {
			Object.entries(props.tags).forEach(([key, value]) => {
				cdk.Tags.of(this.bucket).add(key, value);
			});
		}
	}
}
