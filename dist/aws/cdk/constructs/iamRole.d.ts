import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
export interface IamRoleProps {
    roleName?: string;
    assumedBy?: iam.PrincipalBase;
    description?: string;
    permissionsBoundary?: iam.IManagedPolicy;
    inlinePolicies?: Record<string, iam.PolicyDocument>;
    managedPolicies?: iam.IManagedPolicy[];
    maxSessionDuration?: cdk.Duration;
    path?: string;
    tags?: Record<string, string>;
}
export declare class IamRole extends Construct {
    readonly role: iam.Role;
    constructor(scope: Construct, id: string, props?: IamRoleProps);
}
export declare const attachPermissions: (role: iam.IRole, statements: iam.PolicyStatement[]) => void;
//# sourceMappingURL=iamRole.d.ts.map