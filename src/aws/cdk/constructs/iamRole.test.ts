import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import { beforeEach, describe, expect, it } from 'vitest';
import { attachPermissions, IamRole } from './iamRole.js';

describe('constructs/iamRole', () => {
	let mockStack: cdk.Stack;

	beforeEach(() => {
		mockStack = new cdk.Stack(undefined, 'TestStack', {
			env: {
				account: '123456789012',
				region: 'us-east-1',
			},
		});
	});

	it('should build role with defaults', () => {
		const construct = new IamRole(mockStack, 'IamRole');
		expect(construct.role).toBeInstanceOf(iam.Role);
	});

	it('should build role with custom values', () => {
		const construct = new IamRole(mockStack, 'IamRole', {
			roleName: 'custom-role',
			description: 'Custom role description',
			path: '/custom/',
			tags: { Environment: 'test' },
		});
		expect(construct.role).toBeInstanceOf(iam.Role);
	});

	it('should build role with assumedBy principal', () => {
		const principal = new iam.ServicePrincipal('lambda.amazonaws.com');
		const construct = new IamRole(mockStack, 'IamRole', { assumedBy: principal });
		expect(construct.role).toBeInstanceOf(iam.Role);
	});

	it('should build role with permissions boundary', () => {
		const boundary = new iam.ManagedPolicy(mockStack, 'BoundaryPolicy');
		const construct = new IamRole(mockStack, 'IamRole', { permissionsBoundary: boundary });
		expect(construct.role).toBeInstanceOf(iam.Role);
	});

	it('should build role with inline policies', () => {
		const document = new iam.PolicyDocument();
		const construct = new IamRole(mockStack, 'IamRole', { inlinePolicies: { 'test-policy': document } });
		expect(construct.role).toBeInstanceOf(iam.Role);
	});

	it('should build role with managed policies', () => {
		const policy = new iam.ManagedPolicy(mockStack, 'TestPolicy');
		const construct = new IamRole(mockStack, 'IamRole', { managedPolicies: [policy] });
		expect(construct.role).toBeInstanceOf(iam.Role);
	});

	it('should build role with max session duration', () => {
		const construct = new IamRole(mockStack, 'IamRole', { maxSessionDuration: cdk.Duration.hours(1) });
		expect(construct.role).toBeInstanceOf(iam.Role);
	});

	describe('attachPermissions', () => {
		it('should attach permissions to role', () => {
			const role = new iam.Role(mockStack, 'TestRole', { assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com') });
			const statements = [new iam.PolicyStatement()];
			expect(() => attachPermissions(role, statements)).not.toThrow();
		});
	});
});
