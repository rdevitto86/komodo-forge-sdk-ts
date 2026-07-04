import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
export interface VpcSubnetGroup {
    name: string;
    subnetType: ec2.SubnetType;
    cidrMask?: number;
}
export interface VpcProps {
    id?: string;
    vpcId?: string;
    maxAzs?: number;
    natGateways?: number;
    subnetGroups?: VpcSubnetGroup[];
    cidr?: string;
    enableDnsHostnames?: boolean;
    enableDnsSupport?: boolean;
    vpnGateway?: boolean;
    vpnRoutePropagation?: ec2.SubnetSelection[];
    tags?: Record<string, string>;
}
export declare class Vpc extends Construct {
    readonly vpc: ec2.Vpc;
    constructor(scope: Construct, id: string, props?: VpcProps);
}
//# sourceMappingURL=vpc.d.ts.map