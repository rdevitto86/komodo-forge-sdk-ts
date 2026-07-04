import * as cdk from 'aws-cdk-lib';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as subscriptions from 'aws-cdk-lib/aws-sns-subscriptions';
import { Construct } from 'constructs';

export interface SnsTopicSubscription {
	endpoint: string;
	protocol: sns.SubscriptionProtocol;
	filterPolicy?: { [attribute: string]: sns.SubscriptionFilter };
}

export interface SnsTopicProps {
	topicName?: string;
	displayName?: string;
	fifo?: boolean;
	contentBasedDeduplication?: boolean;
	subscriptions?: SnsTopicSubscription[];
	tags?: Record<string, string>;
}

export class SnsTopic extends Construct {
	public readonly topic: sns.Topic;

	constructor(scope: Construct, id: string, props: SnsTopicProps = {}) {
		super(scope, id);

		this.topic = new sns.Topic(this, props.topicName ?? 'SnsTopic', {
			...(props.displayName && { displayName: props.displayName }),
			...(props.fifo && { fifo: props.fifo }),
			...(props.contentBasedDeduplication && { contentBasedDeduplication: props.contentBasedDeduplication }),
			...(props.topicName && { topicName: props.topicName }),
		});

		if (props.tags) {
			Object.entries(props.tags).forEach(([key, value]) => {
				cdk.Tags.of(this.topic).add(key, value);
			});
		}

		for (const subscription of props.subscriptions ?? []) {
			this.topic.addSubscription(new subscriptions.EmailSubscription(subscription.endpoint));
		}
	}
}
