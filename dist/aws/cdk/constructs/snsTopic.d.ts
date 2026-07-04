import * as sns from 'aws-cdk-lib/aws-sns';
import { Construct } from 'constructs';
export interface SnsTopicSubscription {
    endpoint: string;
    protocol: sns.SubscriptionProtocol;
    filterPolicy?: {
        [attribute: string]: sns.SubscriptionFilter;
    };
}
export interface SnsTopicProps {
    topicName?: string;
    displayName?: string;
    fifo?: boolean;
    contentBasedDeduplication?: boolean;
    subscriptions?: SnsTopicSubscription[];
    tags?: Record<string, string>;
}
export declare class SnsTopic extends Construct {
    readonly topic: sns.Topic;
    constructor(scope: Construct, id: string, props?: SnsTopicProps);
}
//# sourceMappingURL=snsTopic.d.ts.map