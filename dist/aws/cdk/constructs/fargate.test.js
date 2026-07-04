import * as cdk from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as logs from 'aws-cdk-lib/aws-logs';
import { beforeEach, describe, expect, it } from 'vitest';
import { FargateService } from './fargate.js';
describe('constructs/FargateService', () => {
    let stack;
    let vpc;
    let cluster;
    let logGroup;
    let baseProps;
    beforeEach(() => {
        stack = new cdk.Stack();
        vpc = new ec2.Vpc(stack, 'Vpc', { maxAzs: 2, natGateways: 0 });
        cluster = new ecs.Cluster(stack, 'Cluster', { vpc });
        logGroup = new logs.LogGroup(stack, 'LogGroup');
        baseProps = {
            vpc,
            cluster,
            logGroup,
            serviceName: 'test-service',
            image: ecs.ContainerImage.fromRegistry('nginx'),
            port: 8080,
            certificateArn: 'arn:aws:acm:us-east-2:123456789012:certificate/test',
        };
    });
    describe('requireExplicitSecurityGroups', () => {
        it('throws when set and both security groups are omitted', () => {
            expect(() => new FargateService(stack, 'Svc', {
                ...baseProps,
                requireExplicitSecurityGroups: true,
            })).toThrow('missing required albSecurityGroup or taskSecurityGroup when requireExplicitSecurityGroups is set');
        });
        it('throws when set and only albSecurityGroup is provided', () => {
            expect(() => new FargateService(stack, 'Svc', {
                ...baseProps,
                requireExplicitSecurityGroups: true,
                albSecurityGroup: new ec2.SecurityGroup(stack, 'AlbSG', { vpc }),
            })).toThrow('missing required albSecurityGroup or taskSecurityGroup when requireExplicitSecurityGroups is set');
        });
        it('throws when set and only taskSecurityGroup is provided', () => {
            expect(() => new FargateService(stack, 'Svc', {
                ...baseProps,
                requireExplicitSecurityGroups: true,
                taskSecurityGroup: new ec2.SecurityGroup(stack, 'TaskSG', { vpc }),
            })).toThrow('missing required albSecurityGroup or taskSecurityGroup when requireExplicitSecurityGroups is set');
        });
        it('does not throw when set and both security groups are provided', () => {
            expect(() => new FargateService(stack, 'Svc', {
                ...baseProps,
                requireExplicitSecurityGroups: true,
                albSecurityGroup: new ec2.SecurityGroup(stack, 'AlbSG', { vpc }),
                taskSecurityGroup: new ec2.SecurityGroup(stack, 'TaskSG', { vpc }),
            })).not.toThrow();
        });
        it('does not throw when unset regardless of security groups', () => {
            expect(() => new FargateService(stack, 'Svc', { ...baseProps })).not.toThrow();
        });
    });
    describe('blue/green defaults', () => {
        it('defaults to a single service when enableBlueGreen is omitted', () => {
            const construct = new FargateService(stack, 'Svc', { ...baseProps });
            expect(construct.blueService).toBeUndefined();
            expect(construct.greenService).toBeUndefined();
            expect(construct.service).toBeDefined();
            const template = Template.fromStack(stack);
            template.resourceCountIs('AWS::ECS::Service', 1);
        });
        it('creates blue and green services when enableBlueGreen is true, with blue as the active service', () => {
            const construct = new FargateService(stack, 'Svc', { ...baseProps, enableBlueGreen: true });
            expect(construct.blueService).toBeDefined();
            expect(construct.greenService).toBeDefined();
            expect(construct.service).toBe(construct.blueService);
            const template = Template.fromStack(stack);
            template.resourceCountIs('AWS::ECS::Service', 2);
            template.hasResourceProperties('AWS::ECS::Service', Match.objectLike({ DesiredCount: 1 }));
            template.hasResourceProperties('AWS::ECS::Service', Match.objectLike({ DesiredCount: 0 }));
        });
    });
    describe('deployColor traffic cutover', () => {
        it('routes default traffic to blue when deployColor is omitted', () => {
            const construct = new FargateService(stack, 'Svc', { ...baseProps, enableBlueGreen: true });
            expect(construct.service).toBe(construct.blueService);
            const template = Template.fromStack(stack);
            const blueTgId = stack.getLogicalId(construct.blueTargetGroup.node.defaultChild);
            template.hasResourceProperties('AWS::ElasticLoadBalancingV2::Listener', Match.objectLike({
                Port: 443,
                DefaultActions: [Match.objectLike({ TargetGroupArn: { Ref: blueTgId }, Type: 'forward' })],
            }));
            template.hasResourceProperties('AWS::ElasticLoadBalancingV2::ListenerRule', Match.objectLike({
                Conditions: [Match.objectLike({ HttpHeaderConfig: Match.objectLike({ Values: ['green'] }) })],
            }));
        });
        it('routes default traffic to blue explicitly when deployColor is blue', () => {
            const construct = new FargateService(stack, 'Svc', {
                ...baseProps,
                enableBlueGreen: true,
                deployColor: 'blue',
            });
            expect(construct.service).toBe(construct.blueService);
            const template = Template.fromStack(stack);
            const blueTgId = stack.getLogicalId(construct.blueTargetGroup.node.defaultChild);
            template.hasResourceProperties('AWS::ElasticLoadBalancingV2::Listener', Match.objectLike({
                Port: 443,
                DefaultActions: [Match.objectLike({ TargetGroupArn: { Ref: blueTgId }, Type: 'forward' })],
            }));
            template.hasResourceProperties('AWS::ElasticLoadBalancingV2::ListenerRule', Match.objectLike({
                Conditions: [Match.objectLike({ HttpHeaderConfig: Match.objectLike({ Values: ['green'] }) })],
            }));
        });
        it('routes default traffic to green when deployColor is green', () => {
            const construct = new FargateService(stack, 'Svc', {
                ...baseProps,
                enableBlueGreen: true,
                deployColor: 'green',
            });
            expect(construct.service).toBe(construct.greenService);
            const template = Template.fromStack(stack);
            const greenTgId = stack.getLogicalId(construct.greenTargetGroup.node.defaultChild);
            template.hasResourceProperties('AWS::ElasticLoadBalancingV2::Listener', Match.objectLike({
                Port: 443,
                DefaultActions: [Match.objectLike({ TargetGroupArn: { Ref: greenTgId }, Type: 'forward' })],
            }));
            template.hasResourceProperties('AWS::ElasticLoadBalancingV2::ListenerRule', Match.objectLike({
                Conditions: [Match.objectLike({ HttpHeaderConfig: Match.objectLike({ Values: ['blue'] }) })],
            }));
        });
    });
    describe('capacity follows deployColor', () => {
        it('gives the green service a non-zero desired count and blue a zero desired count when deployColor is green', () => {
            const construct = new FargateService(stack, 'Svc', {
                ...baseProps,
                enableBlueGreen: true,
                deployColor: 'green',
                desiredCount: 3,
            });
            const template = Template.fromStack(stack);
            const blueServiceLogicalId = stack.getLogicalId(construct.blueService.node.defaultChild);
            const greenServiceLogicalId = stack.getLogicalId(construct.greenService.node.defaultChild);
            const resources = template.findResources('AWS::ECS::Service');
            expect(resources[blueServiceLogicalId].Properties.DesiredCount).toBe(0);
            expect(resources[greenServiceLogicalId].Properties.DesiredCount).toBe(3);
        });
    });
    describe('alarms', () => {
        it('creates the four alarms with default thresholds', () => {
            new FargateService(stack, 'Svc', { ...baseProps });
            const template = Template.fromStack(stack);
            template.hasResourceProperties('AWS::CloudWatch::Alarm', Match.objectLike({
                Threshold: 80,
                MetricName: 'CPUUtilization',
                Namespace: 'AWS/ECS',
            }));
            template.hasResourceProperties('AWS::CloudWatch::Alarm', Match.objectLike({
                Threshold: 80,
                MetricName: 'MemoryUtilization',
                Namespace: 'AWS/ECS',
            }));
            template.hasResourceProperties('AWS::CloudWatch::Alarm', Match.objectLike({
                Threshold: 1,
                MetricName: 'UnHealthyHostCount',
                Namespace: 'AWS/ApplicationELB',
            }));
            template.hasResourceProperties('AWS::CloudWatch::Alarm', Match.objectLike({
                Threshold: 5,
                MetricName: 'HTTPCode_Target_5XX',
                Namespace: 'AWS/ApplicationELB',
            }));
        });
        it('applies the cpuPercent alarm threshold override', () => {
            new FargateService(stack, 'Svc', { ...baseProps, alarmThresholds: { cpuPercent: 90 } });
            Template.fromStack(stack).hasResourceProperties('AWS::CloudWatch::Alarm', Match.objectLike({
                Threshold: 90,
                MetricName: 'CPUUtilization',
                Namespace: 'AWS/ECS',
            }));
        });
    });
    describe('secretPath', () => {
        it('grants the task role secrets-manager read access when secretPath is provided', () => {
            new FargateService(stack, 'Svc', { ...baseProps, secretPath: 'my-app/secret' });
            Template.fromStack(stack).hasResourceProperties('AWS::IAM::Policy', Match.objectLike({
                PolicyDocument: {
                    Statement: Match.arrayWith([
                        Match.objectLike({
                            Action: Match.arrayWith(['secretsmanager:GetSecretValue']),
                            Effect: 'Allow',
                        }),
                    ]),
                    Version: '2012-10-17',
                },
            }));
        });
    });
    describe('container configuration', () => {
        it('passes custom environment variables through to the container', () => {
            new FargateService(stack, 'Svc', { ...baseProps, environment: { FOO: 'bar' } });
            Template.fromStack(stack).hasResourceProperties('AWS::ECS::TaskDefinition', Match.objectLike({
                ContainerDefinitions: Match.arrayWith([
                    Match.objectLike({
                        Environment: Match.arrayWith([{ Name: 'FOO', Value: 'bar' }]),
                    }),
                ]),
            }));
        });
        it('overrides the container health check command', () => {
            new FargateService(stack, 'Svc', {
                ...baseProps,
                healthCheckCommand: ['CMD-SHELL', 'curl -f http://localhost/health || exit 1'],
            });
            Template.fromStack(stack).hasResourceProperties('AWS::ECS::TaskDefinition', Match.objectLike({
                ContainerDefinitions: Match.arrayWith([
                    Match.objectLike({
                        HealthCheck: Match.objectLike({
                            Command: ['CMD-SHELL', 'curl -f http://localhost/health || exit 1'],
                        }),
                    }),
                ]),
            }));
        });
    });
    describe('port mappings', () => {
        it('maps only the public port when privatePort is omitted', () => {
            new FargateService(stack, 'Svc', { ...baseProps });
            Template.fromStack(stack).hasResourceProperties('AWS::ECS::TaskDefinition', Match.objectLike({
                ContainerDefinitions: Match.arrayWith([
                    Match.objectLike({
                        PortMappings: [{ ContainerPort: 8080, Protocol: 'tcp' }],
                    }),
                ]),
            }));
        });
        it('maps both ports when privatePort is provided', () => {
            new FargateService(stack, 'Svc', { ...baseProps, privatePort: 9090 });
            Template.fromStack(stack).hasResourceProperties('AWS::ECS::TaskDefinition', Match.objectLike({
                ContainerDefinitions: Match.arrayWith([
                    Match.objectLike({
                        PortMappings: [
                            { ContainerPort: 8080, Protocol: 'tcp' },
                            { ContainerPort: 9090, Protocol: 'tcp' },
                        ],
                    }),
                ]),
            }));
        });
    });
});
//# sourceMappingURL=fargate.test.js.map