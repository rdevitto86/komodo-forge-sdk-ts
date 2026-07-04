import * as cdk from 'aws-cdk-lib';
import * as kms from 'aws-cdk-lib/aws-kms';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import { beforeEach, describe, expect, it } from 'vitest';
import { SqsQueue } from './sqs.js';
describe('constructs/sqsQueue', () => {
    let mockStack;
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
});
//# sourceMappingURL=sqs.test.js.map