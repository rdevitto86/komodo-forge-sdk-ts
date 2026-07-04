import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { beforeEach, describe, expect, it } from 'vitest';
import { Vpc } from './vpc.js';
describe('constructs/vpc', () => {
    let mockStack;
    beforeEach(() => {
        mockStack = new cdk.Stack(undefined, 'TestStack', {
            env: {
                account: '123456789012',
                region: 'us-east-1',
            },
        });
    });
    it('should build vpc with defaults', () => {
        const construct = new Vpc(mockStack, 'Vpc');
        expect(construct.vpc).toBeInstanceOf(ec2.Vpc);
    });
    it('should build vpc with custom values', () => {
        const construct = new Vpc(mockStack, 'Vpc', {
            id: 'custom-vpc',
            maxAzs: 3,
            natGateways: 2,
            cidr: '10.0.0.0/16',
            tags: { Environment: 'test' },
        });
        expect(construct.vpc).toBeInstanceOf(ec2.Vpc);
    });
    it('should build vpc with dns and vpn settings', () => {
        const construct = new Vpc(mockStack, 'Vpc', {
            enableDnsHostnames: true,
            enableDnsSupport: true,
            vpnGateway: true,
            vpnRoutePropagation: [{ subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS }],
        });
        expect(construct.vpc).toBeInstanceOf(ec2.Vpc);
    });
    it('should build vpc with subnet group', () => {
        const construct = new Vpc(mockStack, 'Vpc', {
            subnetGroups: [{ name: 'public', subnetType: ec2.SubnetType.PUBLIC, cidrMask: 24 }],
        });
        expect(construct.vpc).toBeInstanceOf(ec2.Vpc);
    });
    it('should build vpc from lookup when vpcId is set', () => {
        const construct = new Vpc(mockStack, 'Vpc', { id: 'lookup-vpc', vpcId: 'vpc-12345678' });
        expect(construct.vpc).toBeDefined();
    });
});
//# sourceMappingURL=vpc.test.js.map