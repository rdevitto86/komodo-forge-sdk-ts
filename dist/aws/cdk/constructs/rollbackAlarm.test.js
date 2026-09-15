import * as cdk from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as sns from 'aws-cdk-lib/aws-sns';
import { beforeEach, describe, expect, it } from 'vitest';
import { RollbackAlarm } from './rollbackAlarm.js';
describe('constructs/rollbackAlarm', () => {
    let stack;
    let targetGroup;
    let loadBalancer;
    beforeEach(() => {
        stack = new cdk.Stack(new cdk.App(), 'TestStack', { env: { account: '123456789012', region: 'us-east-2' } });
        const vpc = new ec2.Vpc(stack, 'Vpc', { maxAzs: 2, natGateways: 0 });
        loadBalancer = new elbv2.ApplicationLoadBalancer(stack, 'Alb', { vpc, internetFacing: false });
        targetGroup = new elbv2.ApplicationTargetGroup(stack, 'Tg', { vpc, port: 80 });
        loadBalancer.addListener('Listener', { port: 80, defaultTargetGroups: [targetGroup] });
    });
    it('creates unhealthy-host and target-5xx alarms by default', () => {
        const construct = new RollbackAlarm(stack, 'Rollback', { targetGroup });
        expect(construct.alarms.length).toBe(2);
    });
    it('adds the load balancer 5xx alarm only when a load balancer is supplied', () => {
        const construct = new RollbackAlarm(stack, 'Rollback', { targetGroup, loadBalancer });
        expect(construct.alarms.length).toBe(3);
        expect(construct.loadBalancerErrorsAlarm).toBeDefined();
    });
    it('fires on one unhealthy host, not two', () => {
        new RollbackAlarm(stack, 'Rollback', { targetGroup });
        Template.fromStack(stack).hasResourceProperties('AWS::CloudWatch::Alarm', {
            MetricName: 'UnHealthyHostCount',
            Threshold: 1,
            ComparisonOperator: 'GreaterThanOrEqualToThreshold',
            EvaluationPeriods: 3,
            DatapointsToAlarm: 2,
        });
    });
    it('uses the real target 5xx metric name', () => {
        new RollbackAlarm(stack, 'Rollback', { targetGroup });
        Template.fromStack(stack).hasResourceProperties('AWS::CloudWatch::Alarm', {
            MetricName: 'HTTPCode_Target_5XX_Count',
            Namespace: 'AWS/ApplicationELB',
            Threshold: 5,
            EvaluationPeriods: 5,
            DatapointsToAlarm: 3,
        });
    });
    it('dimensions the target alarm on the target group, not just the load balancer', () => {
        new RollbackAlarm(stack, 'Rollback', { targetGroup });
        const template = Template.fromStack(stack);
        for (const dimension of ['TargetGroup', 'LoadBalancer']) {
            template.hasResourceProperties('AWS::CloudWatch::Alarm', Match.objectLike({
                MetricName: 'HTTPCode_Target_5XX_Count',
                Dimensions: Match.arrayWith([Match.objectLike({ Name: dimension })]),
            }));
        }
    });
    it('treats missing data as not breaching on every alarm', () => {
        new RollbackAlarm(stack, 'Rollback', { targetGroup, loadBalancer });
        const alarms = Template.fromStack(stack).findResources('AWS::CloudWatch::Alarm');
        for (const alarm of Object.values(alarms)) {
            expect(alarm.Properties.TreatMissingData).toBe('notBreaching');
        }
    });
    it('rolls back on any load balancer 5xx', () => {
        new RollbackAlarm(stack, 'Rollback', { targetGroup, loadBalancer });
        Template.fromStack(stack).hasResourceProperties('AWS::CloudWatch::Alarm', {
            MetricName: 'HTTPCode_ELB_5XX_Count',
            Threshold: 0,
            ComparisonOperator: 'GreaterThanThreshold',
            EvaluationPeriods: 2,
            DatapointsToAlarm: 2,
        });
    });
    it('wires alarm actions to the supplied topics', () => {
        const topic = new sns.Topic(stack, 'Topic');
        new RollbackAlarm(stack, 'Rollback', { targetGroup, alarmActions: [topic] });
        Template.fromStack(stack).hasResourceProperties('AWS::CloudWatch::Alarm', Match.objectLike({
            MetricName: 'UnHealthyHostCount',
            AlarmActions: Match.arrayWith([{ Ref: stack.getLogicalId(topic.node.defaultChild) }]),
        }));
    });
    it('honours overridden thresholds and evaluation windows', () => {
        new RollbackAlarm(stack, 'Rollback', {
            targetGroup,
            thresholds: { targetErrorsPerPeriod: 50 },
            evaluation: { targetErrorPeriods: 10, targetErrorDatapoints: 8 },
        });
        Template.fromStack(stack).hasResourceProperties('AWS::CloudWatch::Alarm', {
            MetricName: 'HTTPCode_Target_5XX_Count',
            Threshold: 50,
            EvaluationPeriods: 10,
            DatapointsToAlarm: 8,
        });
    });
    it('leaves untouched defaults in place when only one threshold is overridden', () => {
        new RollbackAlarm(stack, 'Rollback', { targetGroup, thresholds: { targetErrorsPerPeriod: 50 } });
        Template.fromStack(stack).hasResourceProperties('AWS::CloudWatch::Alarm', {
            MetricName: 'UnHealthyHostCount',
            Threshold: 1,
        });
    });
});
//# sourceMappingURL=rollbackAlarm.test.js.map