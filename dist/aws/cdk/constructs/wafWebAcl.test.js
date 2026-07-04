import { WafWebAcl } from './wafWebAcl.js';
import { beforeEach, describe, expect, it } from 'vitest';
import { Template } from 'aws-cdk-lib/assertions';
import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Match } from 'aws-cdk-lib/assertions';
describe('constructs/WafWebAcl', () => {
    let stack;
    beforeEach(() => {
        stack = new cdk.Stack();
    });
    it('creates WebACL with REGIONAL scope', () => {
        new WafWebAcl(stack, 'Waf', { metricPrefix: 'test' });
        Template.fromStack(stack).hasResourceProperties('AWS::WAFv2::WebACL', {
            Scope: 'REGIONAL',
        });
    });
    it('adds managed rule groups with auto-incrementing priority', () => {
        new WafWebAcl(stack, 'Waf', {
            metricPrefix: 'test',
            managedRuleGroups: [
                { name: 'AWSManagedRulesCommonRuleSet' },
                { name: 'AWSManagedRulesSQLiRuleSet' },
            ],
        });
        Template.fromStack(stack).hasResourceProperties('AWS::WAFv2::WebACL', {
            Rules: Match.arrayWith([
                Match.objectLike({
                    Name: 'AWSManagedRulesCommonRuleSet',
                    Priority: 1,
                    Statement: {
                        ManagedRuleGroupStatement: {
                            VendorName: 'AWS',
                            Name: 'AWSManagedRulesCommonRuleSet',
                        },
                    },
                }),
                Match.objectLike({
                    Name: 'AWSManagedRulesSQLiRuleSet',
                    Priority: 2,
                    Statement: {
                        ManagedRuleGroupStatement: {
                            VendorName: 'AWS',
                            Name: 'AWSManagedRulesSQLiRuleSet',
                        },
                    },
                }),
            ]),
        });
    });
    it('adds global rate limit rule when globalRateLimit provided', () => {
        new WafWebAcl(stack, 'Waf', {
            metricPrefix: 'test',
            globalRateLimit: 2000,
        });
        Template.fromStack(stack).hasResourceProperties('AWS::WAFv2::WebACL', {
            Rules: Match.arrayWith([
                Match.objectLike({
                    Name: 'GlobalRateLimit',
                    Action: { Block: {} },
                    Statement: {
                        RateBasedStatement: {
                            Limit: 2000,
                            AggregateKeyType: 'IP',
                        },
                    },
                }),
            ]),
        });
    });
    it('adds path-scoped rate limit rules', () => {
        new WafWebAcl(stack, 'Waf', {
            metricPrefix: 'test',
            rateLimitRules: [{ name: 'LoginLimit', limit: 100, pathPrefix: '/api/login' }],
        });
        Template.fromStack(stack).hasResourceProperties('AWS::WAFv2::WebACL', {
            Rules: Match.arrayWith([
                Match.objectLike({
                    Name: 'LoginLimit',
                    Action: { Block: {} },
                    Statement: {
                        RateBasedStatement: Match.objectLike({
                            Limit: 100,
                            AggregateKeyType: 'IP',
                            ScopeDownStatement: {
                                ByteMatchStatement: Match.objectLike({
                                    SearchString: '/api/login',
                                    PositionalConstraint: 'STARTS_WITH',
                                }),
                            },
                        }),
                    },
                }),
            ]),
        });
    });
    it('associates with ALB when associateAlb provided', () => {
        new WafWebAcl(stack, 'Waf', {
            metricPrefix: 'test',
            associateAlb: new cdk.aws_elasticloadbalancingv2.ApplicationLoadBalancer(stack, 'Alb', {
                vpc: new ec2.Vpc(stack, 'Vpc'),
                internetFacing: true,
            }),
        });
        Template.fromStack(stack)
            .hasResource('AWS::WAFv2::WebACLAssociation', {});
    });
    it('does not create association when associateAlb omitted', () => {
        new WafWebAcl(stack, 'Waf', { metricPrefix: 'test' });
        expect(Object.keys(Template.fromStack(stack).findResources('AWS::WAFv2::WebACLAssociation')).length).toBe(0);
    });
    it('rule count matches managed groups + global + rate limit rules', () => {
        new WafWebAcl(stack, 'Waf', {
            metricPrefix: 'test',
            managedRuleGroups: [{ name: 'AWSManagedRulesCommonRuleSet' }, { name: 'AWSManagedRulesSQLiRuleSet' }],
            globalRateLimit: 2000,
            rateLimitRules: [
                { name: 'LoginLimit', limit: 100, pathPrefix: '/api/login' },
                { name: 'SignupLimit', limit: 50, pathPrefix: '/api/signup' },
            ],
        });
        const template = Template.fromStack(stack);
        template.hasResourceProperties('AWS::WAFv2::WebACL', {
            Rules: Match.arrayWith([
                Match.objectLike({ Priority: 1 }),
                Match.objectLike({ Priority: 2 }),
                Match.objectLike({ Priority: 3 }),
                Match.objectLike({ Priority: 4 }),
                Match.objectLike({ Priority: 5 }),
            ]),
        });
        const webAcls = template.findResources('AWS::WAFv2::WebACL');
        const aclKey = Object.keys(webAcls)[0];
        const rules = webAcls[aclKey].Properties.Rules;
        expect(rules.length).toBe(5);
    });
    it('creates WebACL with CLOUDFRONT scope', () => {
        new WafWebAcl(stack, 'Waf', { metricPrefix: 'test', scope: 'CLOUDFRONT' });
        Template.fromStack(stack).hasResourceProperties('AWS::WAFv2::WebACL', {
            Scope: 'CLOUDFRONT',
        });
    });
    it('adds a global-style rate limit rule without a path scope-down statement', () => {
        new WafWebAcl(stack, 'Waf', {
            metricPrefix: 'test',
            rateLimitRules: [{ name: 'NoPathLimit', limit: 200 }],
        });
        Template.fromStack(stack).hasResourceProperties('AWS::WAFv2::WebACL', {
            Rules: Match.arrayWith([
                Match.objectLike({
                    Name: 'NoPathLimit',
                    Action: { Block: {} },
                    Statement: {
                        RateBasedStatement: {
                            Limit: 200,
                            AggregateKeyType: 'IP',
                        },
                    },
                }),
            ]),
        });
    });
});
//# sourceMappingURL=wafWebAcl.test.js.map