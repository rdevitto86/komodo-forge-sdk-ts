import * as cdk from 'aws-cdk-lib';
import * as kms from 'aws-cdk-lib/aws-kms';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as subscriptions from 'aws-cdk-lib/aws-sns-subscriptions';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import { Construct } from 'constructs';

export interface SqsQueueSubscription {
	topic: sns.ITopic;
	filterPolicy?: { [attribute: string]: sns.SubscriptionFilter };
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

export class SqsQueue extends Construct {
	public readonly queue: sqs.Queue;

	constructor(scope: Construct, id: string, props: SqsQueueProps = {}) {
		super(scope, id);

		this.queue = new sqs.Queue(this, props.queueName ?? 'SqsQueue', {
			...(props.visibilityTimeout && { visibilityTimeout: props.visibilityTimeout }),
			...(props.retentionPeriod && { retentionPeriod: props.retentionPeriod }),
			...(props.receiveMessageWaitTime && { receiveMessageWaitTime: props.receiveMessageWaitTime }),
			...(props.deadLetterQueue && {
				deadLetterQueue: {
					queue: props.deadLetterQueue,
					maxReceiveCount: props.maxReceiveCount || 3,
				},
			}),
			encryption: props.encryption || sqs.QueueEncryption.SQS_MANAGED,
			...(props.encryptionMasterKey && { encryptionMasterKey: props.encryptionMasterKey }),
			...(props.contentBasedDeduplication && { contentBasedDeduplication: props.contentBasedDeduplication }),
			...(props.fifo && { fifo: props.fifo }),
			...(props.fifoThroughputLimit && { fifoThroughputLimit: props.fifoThroughputLimit }),
			...(props.deliveryDelay && { deliveryDelay: props.deliveryDelay }),
			...(props.maxMessageSize && { maxMessageSize: props.maxMessageSize }),
			...(props.messageRetentionPeriod && { messageRetentionPeriod: props.messageRetentionPeriod }),
		});

		if (props.tags) {
			Object.entries(props.tags).forEach(([key, value]) => {
				cdk.Tags.of(this.queue).add(key, value);
			});
		}

		for (const subscription of props.subscriptions ?? []) {
			subscription.topic.addSubscription(
				new subscriptions.SqsSubscription(this.queue, {
					...(subscription.filterPolicy && { filterPolicy: subscription.filterPolicy }),
				}),
			);
		}
	}
}
