import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { beforeEach, describe, expect, it } from 'vitest';
import { SecurityGroup } from './securityGroup.js';

describe('constructs/securityGroup', () => {
	let mockStack: cdk.Stack;
	let mockVpc: ec2.IVpc;

	beforeEach(() => {
		mockStack = new cdk.Stack(undefined, 'TestStack', {
			env: {
				account: '123456789012',
				region: 'us-east-1',
			},
		});
		mockVpc = new ec2.Vpc(mockStack, 'TestVpc') as ec2.IVpc;
	});

	it('should build security group with defaults', () => {
		const construct = new SecurityGroup(mockStack, 'SecurityGroup', { vpc: mockVpc });
		expect(construct.securityGroup).toBeInstanceOf(ec2.SecurityGroup);
	});

	it('should build security group with custom values', () => {
		const construct = new SecurityGroup(mockStack, 'SecurityGroup', {
			vpc: mockVpc,
			groupName: 'custom-sg',
			description: 'Custom security group',
			allowAllOutbound: false,
			tags: { Environment: 'test' },
		});
		expect(construct.securityGroup).toBeInstanceOf(ec2.SecurityGroup);
	});

	it('should build security group with ingress rules', () => {
		const construct = new SecurityGroup(mockStack, 'SecurityGroup', {
			vpc: mockVpc,
			groupName: 'sg-with-rules',
			ingressRules: [
				{ peer: ec2.Peer.ipv4('10.0.0.0/16'), connection: ec2.Port.tcp(80), description: 'HTTP' },
				{ peer: ec2.Peer.ipv4('10.0.0.0/16'), connection: ec2.Port.tcp(443) },
			],
		});
		expect(construct.securityGroup).toBeInstanceOf(ec2.SecurityGroup);
	});

	it('should build security group with egress rules', () => {
		const construct = new SecurityGroup(mockStack, 'SecurityGroup', {
			vpc: mockVpc,
			egressRules: [{ peer: ec2.Peer.ipv4('0.0.0.0/0'), connection: ec2.Port.tcp(443) }],
		});
		expect(construct.securityGroup).toBeInstanceOf(ec2.SecurityGroup);
	});
});
