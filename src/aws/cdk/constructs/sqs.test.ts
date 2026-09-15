import * as cdk from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import * as kms from 'aws-cdk-lib/aws-kms';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import { beforeEach, describe, expect, it } from 'vitest';
import { SqsQueue } from './sqs.js';

describe('constructs/sqsQueue', () => {
	let mockStack: cdk.Stack;

	beforeEach(() => {
		mockStack = new cdk.Stack();
	});

	it('should build queue with defaults', () => {
		const construct = new SqsQueue(mockStack, 'SqsQueue');
		expect(construct.queue).toBeInstanceOf(sqs.Queue);
	});

	it('should build queue with custom values', () => {
		const construct = new SqsQueue(mockStack, 'SqsQueue', {
			queueName: 'custom-queue',
			visibilityTimeout: cdk.Duration.seconds(60),
			retentionPeriod: cdk.Duration.days(14),
			tags: { Environment: 'test' },
		});
		expect(construct.queue).toBeInstanceOf(sqs.Queue);
	});

	it('should build queue with dead letter queue', () => {
		const dlq = new sqs.Queue(mockStack, 'TestDLQ');
		const construct = new SqsQueue(mockStack, 'SqsQueue', { deadLetterQueue: dlq, maxReceiveCount: 5 });
		expect(construct.queue).toBeInstanceOf(sqs.Queue);
	});

	it('should build queue with kms encryption', () => {
		const key = new kms.Key(mockStack, 'TestKey');
		const construct = new SqsQueue(mockStack, 'SqsQueue', {
			encryption: sqs.QueueEncryption.KMS,
			encryptionMasterKey: key,
		});
		expect(construct.queue).toBeInstanceOf(sqs.Queue);
	});

	it('should build fifo queue', () => {
		const construct = new SqsQueue(mockStack, 'SqsQueue', {
			queueName: 'fifo-queue.fifo',
			fifo: true,
			contentBasedDeduplication: true,
			fifoThroughputLimit: sqs.FifoThroughputLimit.PER_QUEUE,
		});
		expect(construct.queue).toBeInstanceOf(sqs.Queue);
	});

	it('should build queue with delivery delay, max message size, and retention period', () => {
		const construct = new SqsQueue(mockStack, 'SqsQueue', {
			deliveryDelay: cdk.Duration.seconds(10),
			maxMessageSize: 256000,
			messageRetentionPeriod: cdk.Duration.days(14),
		});
		expect(construct.queue).toBeInstanceOf(sqs.Queue);
	});

	it('should build queue with receive message wait time', () => {
		const construct = new SqsQueue(mockStack, 'SqsQueue', { receiveMessageWaitTime: cdk.Duration.seconds(20) });
		expect(construct.queue).toBeInstanceOf(sqs.Queue);
	});

	it('should build queue with subscription', () => {
		const topic = new sns.Topic(mockStack, 'TestTopic');
		const construct = new SqsQueue(mockStack, 'SqsQueue', { subscriptions: [{ topic }] });
		expect(construct.queue).toBeInstanceOf(sqs.Queue);
	});

	it('sets the physical queue name rather than only the construct id', () => {
		new SqsQueue(mockStack, 'SqsQueue', { queueName: 'komodo-cicd-ci-queue' });
		Template.fromStack(mockStack).hasResourceProperties('AWS::SQS::Queue', { QueueName: 'komodo-cicd-ci-queue' });
	});

	it('generates a name when none is supplied', () => {
		new SqsQueue(mockStack, 'SqsQueue');
		Template.fromStack(mockStack).hasResourceProperties('AWS::SQS::Queue', Match.not({ QueueName: Match.anyValue() }));
	});

	it('enforces TLS with a deny policy when enforceSSL is set', () => {
		new SqsQueue(mockStack, 'SqsQueue', { enforceSSL: true });
		Template.fromStack(mockStack).hasResourceProperties(
			'AWS::SQS::QueuePolicy',
			Match.objectLike({
				PolicyDocument: {
					Statement: Match.arrayWith([
						Match.objectLike({
							Effect: 'Deny',
							Condition: { Bool: { 'aws:SecureTransport': 'false' } },
						}),
					]),
					Version: '2012-10-17',
				},
			}),
		);
	});

	it('applies the requested removal policy', () => {
		new SqsQueue(mockStack, 'SqsQueue', { removalPolicy: cdk.RemovalPolicy.RETAIN });
		Template.fromStack(mockStack).hasResource('AWS::SQS::Queue', { DeletionPolicy: 'Retain' });
	});
});
