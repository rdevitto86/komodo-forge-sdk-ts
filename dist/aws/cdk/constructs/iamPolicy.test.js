import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import { beforeEach, describe, expect, it } from 'vitest';
import { IamPolicy } from './iamPolicy.js';
describe('constructs/iamPolicy', () => {
    let mockStack;
    beforeEach(() => {
        mockStack = new cdk.Stack(undefined, 'TestStack', {
            env: {
                account: '123456789012',
                region: 'us-east-1',
            },
        });
    });
    it('should build policy with defaults', () => {
        const construct = new IamPolicy(mockStack, 'IamPolicy');
        expect(construct.policy).toBeInstanceOf(iam.ManagedPolicy);
    });
    it('should build policy with custom values', () => {
        const construct = new IamPolicy(mockStack, 'IamPolicy', {
            policyName: 'custom-policy',
            description: 'Custom policy description',
            tags: { Environment: 'test' },
        });
        expect(construct.policy).toBeInstanceOf(iam.ManagedPolicy);
    });
    it('should build policy with statements', () => {
        const statements = [new iam.PolicyStatement(), new iam.PolicyStatement()];
        const construct = new IamPolicy(mockStack, 'IamPolicy', { statements });
        expect(construct.policy).toBeInstanceOf(iam.ManagedPolicy);
    });
    it('should build policy attached to roles', () => {
        const role1 = new iam.Role(mockStack, 'TestRole1', { assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com') });
        const role2 = new iam.Role(mockStack, 'TestRole2', { assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com') });
        const construct = new IamPolicy(mockStack, 'IamPolicy', { roles: [role1, role2] });
        expect(construct.policy).toBeInstanceOf(iam.ManagedPolicy);
    });
    it('should build policy attached to users', () => {
        const user1 = new iam.User(mockStack, 'TestUser1');
        const user2 = new iam.User(mockStack, 'TestUser2');
        const construct = new IamPolicy(mockStack, 'IamPolicy', { users: [user1, user2] });
        expect(construct.policy).toBeInstanceOf(iam.ManagedPolicy);
    });
    it('should build policy attached to groups', () => {
        const group1 = new iam.Group(mockStack, 'TestGroup1');
        const group2 = new iam.Group(mockStack, 'TestGroup2');
        const construct = new IamPolicy(mockStack, 'IamPolicy', { groups: [group1, group2] });
        expect(construct.policy).toBeInstanceOf(iam.ManagedPolicy);
    });
});
//# sourceMappingURL=iamPolicy.test.js.map