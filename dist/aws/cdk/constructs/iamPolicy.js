import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
export class IamPolicy extends Construct {
    policy;
    constructor(scope, id, props = {}) {
        super(scope, id);
        this.policy = new iam.ManagedPolicy(this, props.policyName || 'IamPolicy', {
            ...(props.description && { description: props.description }),
            ...(props.statements && props.statements.length > 0 && { statements: props.statements }),
            ...(props.roles && props.roles.length > 0 && { roles: props.roles }),
            ...(props.users && props.users.length > 0 && { users: props.users }),
            ...(props.groups && props.groups.length > 0 && { groups: props.groups }),
        });
        if (props.tags) {
            Object.entries(props.tags).forEach(([key, value]) => {
                cdk.Tags.of(this.policy).add(key, value);
            });
        }
    }
}
//# sourceMappingURL=iamPolicy.js.map