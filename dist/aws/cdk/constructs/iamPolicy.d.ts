import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
export interface IamPolicyProps {
    policyName?: string;
    statements?: iam.PolicyStatement[];
    description?: string;
    roles?: iam.IRole[];
    users?: iam.IUser[];
    groups?: iam.IGroup[];
    tags?: Record<string, string>;
}
export declare class IamPolicy extends Construct {
    readonly policy: iam.ManagedPolicy;
    constructor(scope: Construct, id: string, props?: IamPolicyProps);
}
//# sourceMappingURL=iamPolicy.d.ts.map