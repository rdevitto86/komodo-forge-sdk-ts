import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as kms from 'aws-cdk-lib/aws-kms';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { beforeEach, describe, expect, it } from 'vitest';
import { Secret } from './secrets.js';
describe('constructs/secret', () => {
    let mockStack;
    beforeEach(() => {
        mockStack = new cdk.Stack();
    });
    it('should build secret with defaults', () => {
        const construct = new Secret(mockStack, 'Secret');
        expect(construct.secret).toBeInstanceOf(secretsmanager.Secret);
    });
    it('should build secret with custom values', () => {
        const construct = new Secret(mockStack, 'Secret', {
            secretName: 'custom-secret',
            description: 'Custom secret description',
            secretStringValue: 'custom-value',
            tags: { Environment: 'test' },
        });
        expect(construct.secret).toBeInstanceOf(secretsmanager.Secret);
    });
    it('should build secret with kms key', () => {
        const key = new kms.Key(mockStack, 'TestKey');
        const construct = new Secret(mockStack, 'Secret', { kmsKey: key });
        expect(construct.secret).toBeInstanceOf(secretsmanager.Secret);
    });
    it('should build secret with removal policy and replica regions', () => {
        const construct = new Secret(mockStack, 'Secret', {
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            replicaRegions: [{ region: 'us-west-2' }],
        });
        expect(construct.secret).toBeInstanceOf(secretsmanager.Secret);
    });
    it('should build secret with grant targets', () => {
        const role1 = new iam.Role(mockStack, 'TestRole1', { assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com') });
        const role2 = new iam.Role(mockStack, 'TestRole2', { assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com') });
        const construct = new Secret(mockStack, 'Secret', { grantTargets: [role1, role2] });
        expect(construct.secret).toBeInstanceOf(secretsmanager.Secret);
    });
});
//# sourceMappingURL=secrets.test.js.map