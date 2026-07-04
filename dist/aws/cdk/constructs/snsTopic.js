import * as cdk from 'aws-cdk-lib';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as subscriptions from 'aws-cdk-lib/aws-sns-subscriptions';
import { Construct } from 'constructs';
export class SnsTopic extends Construct {
    topic;
    constructor(scope, id, props = {}) {
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
//# sourceMappingURL=snsTopic.js.map