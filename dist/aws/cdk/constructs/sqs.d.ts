import * as cdk from 'aws-cdk-lib';
import * as kms from 'aws-cdk-lib/aws-kms';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import { Construct } from 'constructs';
export interface SqsQueueSubscription {
    topic: sns.ITopic;
    filterPolicy?: {
        [attribute: string]: sns.SubscriptionFilter;
    };
}
export interface SqsQueueProps {
    queueName?: string;
    visibilityTimeout?: cdk.Duration;
    retentionPeriod?: cdk.Duration;
    receiveMessageWaitTime?: cdk.Duration;
    deadLetterQueue?: sqs.IQueue;
    maxReceiveCount?: number;
    encryption?: sqs.QueueEncryption;
    encryptionMasterKey?: kms.IKey;
    contentBasedDeduplication?: boolean;
    fifo?: boolean;
    fifoThroughputLimit?: sqs.FifoThroughputLimit;
    deliveryDelay?: cdk.Duration;
    maxMessageSize?: number;
    messageRetentionPeriod?: cdk.Duration;
    subscriptions?: SqsQueueSubscription[];
    tags?: Record<string, string>;
}
export declare class SqsQueue extends Construct {
    readonly queue: sqs.Queue;
    constructor(scope: Construct, id: string, props?: SqsQueueProps);
}
//# sourceMappingURL=sqs.d.ts.map