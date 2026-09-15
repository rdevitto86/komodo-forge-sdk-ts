import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import * as sns from 'aws-cdk-lib/aws-sns';
import { beforeEach, describe, expect, it } from 'vitest';
import { SnsTopic, UnsupportedSubscriptionProtocolError } from './snsTopic.js';
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
    it('subscribes email over the email protocol', () => {
        new SnsTopic(mockStack, 'SnsTopic', {
            subscriptions: [{ endpoint: 'test@example.com', protocol: sns.SubscriptionProtocol.EMAIL }],
        });
        Template.fromStack(mockStack).hasResourceProperties('AWS::SNS::Subscription', {
            Protocol: 'email',
            Endpoint: 'test@example.com',
        });
    });
    it('subscribes an https endpoint over https rather than email', () => {
        new SnsTopic(mockStack, 'SnsTopic', {
            subscriptions: [{ endpoint: 'https://hooks.example.com/x', protocol: sns.SubscriptionProtocol.HTTPS }],
        });
        Template.fromStack(mockStack).hasResourceProperties('AWS::SNS::Subscription', {
            Protocol: 'https',
            Endpoint: 'https://hooks.example.com/x',
        });
    });
    it('subscribes sms over the sms protocol', () => {
        new SnsTopic(mockStack, 'SnsTopic', {
            subscriptions: [{ endpoint: '+15555550100', protocol: sns.SubscriptionProtocol.SMS }],
        });
        Template.fromStack(mockStack).hasResourceProperties('AWS::SNS::Subscription', { Protocol: 'sms' });
    });
    it('subscribes email-json distinctly from plain email', () => {
        new SnsTopic(mockStack, 'SnsTopic', {
            subscriptions: [{ endpoint: 'test@example.com', protocol: sns.SubscriptionProtocol.EMAIL_JSON }],
        });
        Template.fromStack(mockStack).hasResourceProperties('AWS::SNS::Subscription', { Protocol: 'email-json' });
    });
    it('throws on a protocol that cannot be built from an endpoint string', () => {
        expect(() => new SnsTopic(mockStack, 'SnsTopic', {
            subscriptions: [{ endpoint: 'arn:aws:sqs:us-east-1:1:q', protocol: sns.SubscriptionProtocol.SQS }],
        })).toThrow(UnsupportedSubscriptionProtocolError);
    });
});
//# sourceMappingURL=snsTopic.test.js.map