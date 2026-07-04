import * as cdk from 'aws-cdk-lib';
import * as sns from 'aws-cdk-lib/aws-sns';
import { beforeEach, describe, expect, it } from 'vitest';
import { SnsTopic } from './snsTopic.js';
describe('constructs/snsTopic', () => {
    let mockStack;
    beforeEach(() => {
        mockStack = new cdk.Stack();
    });
    it('should build topic with defaults', () => {
        const construct = new SnsTopic(mockStack, 'SnsTopic');
        expect(construct.topic).toBeInstanceOf(sns.Topic);
    });
    it('should build topic with custom values', () => {
        const construct = new SnsTopic(mockStack, 'SnsTopic', {
            topicName: 'custom-topic',
            displayName: 'Custom Topic',
            tags: { Environment: 'test' },
        });
        expect(construct.topic).toBeInstanceOf(sns.Topic);
    });
    it('should build topic with fifo and content based deduplication', () => {
        const construct = new SnsTopic(mockStack, 'SnsTopic', {
            topicName: 'fifo-topic.fifo',
            fifo: true,
            contentBasedDeduplication: true,
        });
        expect(construct.topic).toBeInstanceOf(sns.Topic);
    });
    it('should build topic with subscription', () => {
        const construct = new SnsTopic(mockStack, 'SnsTopic', {
            subscriptions: [{ endpoint: 'test@example.com', protocol: sns.SubscriptionProtocol.EMAIL }],
        });
        expect(construct.topic).toBeInstanceOf(sns.Topic);
    });
});
//# sourceMappingURL=snsTopic.test.js.map