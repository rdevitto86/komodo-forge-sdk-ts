import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as kms from 'aws-cdk-lib/aws-kms';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';
export interface SecretProps {
    secretName?: string;
    description?: string;
    secretStringValue?: string;
    kmsKey?: kms.IKey;
    removalPolicy?: cdk.RemovalPolicy;
    replicaRegions?: secretsmanager.ReplicaRegion[];
    grantTargets?: iam.IGrantable[];
    tags?: Record<string, string>;
}
export declare class Secret extends Construct {
    readonly secret: secretsmanager.Secret;
    constructor(scope: Construct, id: string, props?: SecretProps);
}
//# sourceMappingURL=secrets.d.ts.map