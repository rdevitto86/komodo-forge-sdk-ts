import * as cdk from 'aws-cdk-lib';
import * as kms from 'aws-cdk-lib/aws-kms';
import * as logs from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';
export class LogGroup extends Construct {
    logGroup;
    constructor(scope, id, props = {}) {
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
//# sourceMappingURL=logGroup.js.map