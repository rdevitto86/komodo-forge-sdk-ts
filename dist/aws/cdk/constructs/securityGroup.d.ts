import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
export interface SecurityGroupRule {
    peer: ec2.IPeer;
    connection: ec2.Port;
    description?: string;
    remoteRule?: boolean;
}
export interface SecurityGroupProps {
    vpc: ec2.IVpc;
    groupName?: string;
    description?: string;
    allowAllOutbound?: boolean;
    ingressRules?: SecurityGroupRule[];
    egressRules?: SecurityGroupRule[];
    tags?: Record<string, string>;
}
export declare class SecurityGroup extends Construct {
    readonly securityGroup: ec2.SecurityGroup;
    constructor(scope: Construct, id: string, props: SecurityGroupProps);
}
//# sourceMappingURL=securityGroup.d.ts.map