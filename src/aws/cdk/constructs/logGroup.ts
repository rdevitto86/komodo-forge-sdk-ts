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

export class LogGroup extends Construct {
	public readonly logGroup: logs.LogGroup;

	constructor(scope: Construct, id: string, props: LogGroupProps = {}) {
		super(scope, id);

		this.logGroup = new logs.LogGroup(this, props.logGroupName ?? 'LogGroup', {
			...(props.logGroupName && { logGroupName: props.logGroupName }),
			retention: props.retention ?? logs.RetentionDays.ONE_WEEK,
			...(props.removalPolicy && { removalPolicy: props.removalPolicy }),
			...(props.encryptionKey && { encryptionKey: props.encryptionKey }),
		});

		if (props.tags) {
			Object.entries(props.tags).forEach(([key, value]) => {
				cdk.Tags.of(this.logGroup).add(key, value);
			});
		}
	}
}
