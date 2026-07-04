import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as kms from 'aws-cdk-lib/aws-kms';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';
export class Secret extends Construct {
    secret;
    constructor(scope, id, props = {}) {
        super(scope, id);
        this.secret = new secretsmanager.Secret(this, props.secretName || 'Secret', {
            ...(props.description && { description: props.description }),
            ...(props.secretStringValue && { secretStringValue: cdk.SecretValue.unsafePlainText(props.secretStringValue) }),
            ...(props.kmsKey && { encryptionKey: props.kmsKey }),
            ...(props.removalPolicy && { removalPolicy: props.removalPolicy }),
            ...(props.replicaRegions && { replicaRegions: props.replicaRegions }),
        });
        if (props.tags) {
            Object.entries(props.tags).forEach(([key, value]) => {
                cdk.Tags.of(this.secret).add(key, value);
            });
        }
        for (const grantee of props.grantTargets ?? []) {
            this.secret.grantRead(grantee);
        }
    }
}
//# sourceMappingURL=secrets.js.map