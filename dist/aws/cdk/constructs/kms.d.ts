import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as kms from 'aws-cdk-lib/aws-kms';
import { Construct } from 'constructs';
export interface KmsKeyProps {
    keyId?: string;
    alias?: string;
    description?: string;
    enableKeyRotation?: boolean;
    enabled?: boolean;
    keyUsage?: kms.KeyUsage;
    keySpec?: kms.KeySpec;
    removalPolicy?: cdk.RemovalPolicy;
    policy?: iam.PolicyDocument;
    administrators?: iam.IPrincipal[];
    tags?: Record<string, string>;
}
export declare class KmsKey extends Construct {
    readonly key: kms.Key;
    constructor(scope: Construct, id: string, props?: KmsKeyProps);
}
//# sourceMappingURL=kms.d.ts.map