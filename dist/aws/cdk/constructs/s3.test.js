import * as cdk from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { beforeEach, describe, expect, it } from 'vitest';
import { S3Bucket } from './s3.js';
describe('constructs/s3Bucket', () => {
    let mockStack;
    beforeEach(() => {
        mockStack = new cdk.Stack();
    });
    it('should build bucket with defaults', () => {
        const construct = new S3Bucket(mockStack, 'Bucket');
        expect(construct.bucket).toBeInstanceOf(s3.Bucket);
    });
    it('blocks all public access by default', () => {
        new S3Bucket(mockStack, 'Bucket');
        Template.fromStack(mockStack).hasResourceProperties('AWS::S3::Bucket', {
            PublicAccessBlockConfiguration: {
                BlockPublicAcls: true,
                BlockPublicPolicy: true,
                IgnorePublicAcls: true,
                RestrictPublicBuckets: true,
            },
        });
    });
    it('enables versioning and managed encryption by default', () => {
        new S3Bucket(mockStack, 'Bucket');
        Template.fromStack(mockStack).hasResourceProperties('AWS::S3::Bucket', Match.objectLike({
            VersioningConfiguration: { Status: 'Enabled' },
            BucketEncryption: {
                ServerSideEncryptionConfiguration: [{ ServerSideEncryptionByDefault: { SSEAlgorithm: 'AES256' } }],
            },
        }));
    });
    it('denies non-TLS access by default', () => {
        new S3Bucket(mockStack, 'Bucket');
        Template.fromStack(mockStack).hasResourceProperties('AWS::S3::BucketPolicy', Match.objectLike({
            PolicyDocument: {
                Statement: Match.arrayWith([
                    Match.objectLike({
                        Effect: 'Deny',
                        Condition: { Bool: { 'aws:SecureTransport': 'false' } },
                    }),
                ]),
                Version: '2012-10-17',
            },
        }));
    });
    it('defaults to retain so a stateful bucket is never destroyed implicitly', () => {
        new S3Bucket(mockStack, 'Bucket');
        Template.fromStack(mockStack).hasResource('AWS::S3::Bucket', { DeletionPolicy: 'Retain' });
    });
    it('applies lifecycle rules when supplied', () => {
        new S3Bucket(mockStack, 'Bucket', {
            lifecycleRules: [{ id: 'expire', enabled: true, expiration: cdk.Duration.days(30) }],
        });
        Template.fromStack(mockStack).hasResourceProperties('AWS::S3::Bucket', Match.objectLike({
            LifecycleConfiguration: {
                Rules: Match.arrayWith([Match.objectLike({ Id: 'expire', Status: 'Enabled', ExpirationInDays: 30 })]),
            },
        }));
    });
    it('grants read-write to readWriteRoles', () => {
        const role = new iam.Role(mockStack, 'Role', { assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com') });
        new S3Bucket(mockStack, 'Bucket', { readWriteRoles: [role] });
        Template.fromStack(mockStack).hasResourceProperties('AWS::IAM::Policy', Match.objectLike({
            PolicyDocument: {
                Statement: Match.arrayWith([Match.objectLike({ Action: Match.arrayWith(['s3:PutObject']) })]),
                Version: '2012-10-17',
            },
        }));
    });
});
//# sourceMappingURL=s3.test.js.map