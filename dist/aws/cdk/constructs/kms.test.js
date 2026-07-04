import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as kms from 'aws-cdk-lib/aws-kms';
import { beforeEach, describe, expect, it } from 'vitest';
import { KmsKey } from './kms.js';
describe('constructs/kmsKey', () => {
    let mockStack;
    beforeEach(() => {
        mockStack = new cdk.Stack(undefined, 'TestStack', {
            env: {
                account: '123456789012',
                region: 'us-east-1',
            },
        });
    });
    it('should build key with defaults', () => {
        const construct = new KmsKey(mockStack, 'KmsKey');
        expect(construct.key).toBeInstanceOf(kms.Key);
    });
    it('should build key with custom values', () => {
        const construct = new KmsKey(mockStack, 'KmsKey', {
            alias: 'custom-alias',
            description: 'Custom key description',
            enableKeyRotation: true,
            tags: { Environment: 'test' },
        });
        expect(construct.key).toBeInstanceOf(kms.Key);
    });
    it('should build key with usage, spec, removal policy, and access policy', () => {
        const policy = new iam.PolicyDocument();
        const construct = new KmsKey(mockStack, 'KmsKey', {
            keyUsage: kms.KeyUsage.ENCRYPT_DECRYPT,
            keySpec: kms.KeySpec.SYMMETRIC_DEFAULT,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            policy,
        });
        expect(construct.key).toBeInstanceOf(kms.Key);
    });
    it('should build key with disabled state', () => {
        const construct = new KmsKey(mockStack, 'KmsKey', { enabled: false });
        expect(construct.key).toBeInstanceOf(kms.Key);
    });
    it('should build key with administrators', () => {
        const admin1 = new iam.AccountPrincipal('123456789012');
        const admin2 = new iam.AccountPrincipal('123456789013');
        const construct = new KmsKey(mockStack, 'KmsKey', { administrators: [admin1, admin2] });
        expect(construct.key).toBeInstanceOf(kms.Key);
    });
    it('should build key from lookup when keyId is set', () => {
        const construct = new KmsKey(mockStack, 'KmsKey', { keyId: 'alias/test-key-id' });
        expect(construct.key).toBeDefined();
    });
});
//# sourceMappingURL=kms.test.js.map