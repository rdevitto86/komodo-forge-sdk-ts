import * as cdk from 'aws-cdk-lib';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as subscriptions from 'aws-cdk-lib/aws-sns-subscriptions';
import { Construct } from 'constructs';

export interface SnsTopicSubscription {
	endpoint: string;
	protocol: sns.SubscriptionProtocol;
	filterPolicy?: { [attribute: string]: sns.SubscriptionFilter };
	rawMessageDelivery?: boolean;
}

export class UnsupportedSubscriptionProtocolError extends Error {
	constructor(protocol: string) {
		super(`Use an endpoint-based protocol (email, email-json, http, https, sms); received "${protocol}"`);
		this.name = 'UnsupportedSubscriptionProtocolError';
	}
}

const buildSubscription = (subscription: SnsTopicSubscription): sns.ITopicSubscription => {
	const filterPolicy = subscription.filterPolicy;

	switch (subscription.protocol) {
		case sns.SubscriptionProtocol.EMAIL:
			return new subscriptions.EmailSubscription(subscription.endpoint, { ...(filterPolicy && { filterPolicy }) });
		case sns.SubscriptionProtocol.EMAIL_JSON:
			return new subscriptions.EmailSubscription(subscription.endpoint, {
				json: true,
				...(filterPolicy && { filterPolicy }),
			});
		case sns.SubscriptionProtocol.HTTP:
		case sns.SubscriptionProtocol.HTTPS:
			return new subscriptions.UrlSubscription(subscription.endpoint, {
				...(filterPolicy && { filterPolicy }),
				...(subscription.rawMessageDelivery !== undefined && {
					rawMessageDelivery: subscription.rawMessageDelivery,
				}),
			});
		case sns.SubscriptionProtocol.SMS:
			return new subscriptions.SmsSubscription(subscription.endpoint, { ...(filterPolicy && { filterPolicy }) });
		default:
			throw new UnsupportedSubscriptionProtocolError(subscription.protocol);
	}
};

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
			this.topic.addSubscription(buildSubscription(subscription));
		}
	}
}
