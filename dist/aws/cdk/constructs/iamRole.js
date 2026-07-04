import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
export class IamRole extends Construct {
    role;
    constructor(scope, id, props = {}) {
        super(scope, id);
        this.role = new iam.Role(this, props.roleName || 'IamRole', {
            assumedBy: props.assumedBy || new iam.ServicePrincipal('lambda.amazonaws.com'),
            ...(props.description && { description: props.description }),
            ...(props.permissionsBoundary && { permissionsBoundary: props.permissionsBoundary }),
            ...(props.inlinePolicies && Object.keys(props.inlinePolicies).length > 0 && { inlinePolicies: props.inlinePolicies }),
            ...(props.managedPolicies && props.managedPolicies.length > 0 && { managedPolicies: props.managedPolicies }),
            ...(props.maxSessionDuration && { maxSessionDuration: props.maxSessionDuration }),
            ...(props.path && { path: props.path }),
        });
        if (props.tags) {
            Object.entries(props.tags).forEach(([key, value]) => {
                cdk.Tags.of(this.role).add(key, value);
            });
        }
    }
}
export const attachPermissions = (role, statements) => {
    for (const statement of statements) {
        role.addToPrincipalPolicy(statement);
    }
};
//# sourceMappingURL=iamRole.js.map