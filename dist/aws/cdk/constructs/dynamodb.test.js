import * as cdk from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as iam from 'aws-cdk-lib/aws-iam';
import { beforeEach, describe, expect, it } from 'vitest';
import { DynamoDBTable } from './dynamodb.js';
describe('constructs/DynamoDBTable', () => {
    let stack;
    beforeEach(() => {
        stack = new cdk.Stack();
    });
    it('looks up the table by the given name', () => {
        expect(new DynamoDBTable(stack, 'Table', { tableName: 'my-table', taskRoles: [] }).table.tableName).toBe('my-table');
    });
    it('grants read data to a single provided role', () => {
        const role = new iam.Role(stack, 'Role', { assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com') });
        new DynamoDBTable(stack, 'Table', {
            tableName: 'my-table',
            taskRoles: [role],
        });
        for (const action of ['dynamodb:GetItem', 'dynamodb:Query', 'dynamodb:Scan']) {
            Template.fromStack(stack).hasResourceProperties('AWS::IAM::Policy', Match.objectLike({
                PolicyDocument: {
                    Statement: Match.arrayWith([
                        Match.objectLike({
                            Action: Match.arrayWith([action]),
                            Effect: 'Allow',
                        }),
                    ]),
                    Version: '2012-10-17',
                },
                Roles: Match.arrayWith([{ Ref: stack.getLogicalId(role.node.defaultChild) }]),
            }));
        }
    });
    it('grants read data to each of multiple provided roles', () => {
        const roleA = new iam.Role(stack, 'RoleA', { assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com') });
        const roleB = new iam.Role(stack, 'RoleB', { assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com') });
        new DynamoDBTable(stack, 'Table', {
            tableName: 'my-table',
            taskRoles: [roleA, roleB],
        });
        const template = Template.fromStack(stack);
        expect(Object.keys(template.findResources('AWS::IAM::Policy')).length).toBe(2);
        template.hasResourceProperties('AWS::IAM::Policy', Match.objectLike({
            Roles: Match.arrayWith([{ Ref: stack.getLogicalId(roleA.node.defaultChild) }]),
        }));
        template.hasResourceProperties('AWS::IAM::Policy', Match.objectLike({
            Roles: Match.arrayWith([{ Ref: stack.getLogicalId(roleB.node.defaultChild) }]),
        }));
    });
    it('creates no grants when taskRoles is empty', () => {
        new DynamoDBTable(stack, 'Table', {
            tableName: 'my-table',
            taskRoles: [],
        });
        expect(Object.keys(Template.fromStack(stack).findResources('AWS::IAM::Policy')).length).toBe(0);
    });
    it('does not throw when instantiated directly on the stack it imports from', () => {
        expect(() => new DynamoDBTable(stack, 'Table', {
            tableName: 'my-table',
            taskRoles: [],
        })).not.toThrow();
    });
    it('creates a table when a partition key is supplied', () => {
        new DynamoDBTable(stack, 'Table', {
            tableName: 'created-table',
            partitionKey: { name: 'PK', type: dynamodb.AttributeType.STRING },
        });
        Template.fromStack(stack).hasResourceProperties('AWS::DynamoDB::Table', {
            TableName: 'created-table',
            KeySchema: [{ AttributeName: 'PK', KeyType: 'HASH' }],
        });
    });
    it('creates no table resource in lookup mode', () => {
        new DynamoDBTable(stack, 'Table', { tableName: 'my-table', taskRoles: [] });
        expect(Object.keys(Template.fromStack(stack).findResources('AWS::DynamoDB::Table')).length).toBe(0);
    });
    it('applies ttl, deletion protection, and point-in-time recovery when requested', () => {
        new DynamoDBTable(stack, 'Table', {
            tableName: 'locks',
            partitionKey: { name: 'PK', type: dynamodb.AttributeType.STRING },
            timeToLiveAttribute: 'leaseUntil',
            pointInTimeRecovery: true,
            deletionProtection: true,
        });
        Template.fromStack(stack).hasResourceProperties('AWS::DynamoDB::Table', Match.objectLike({
            DeletionProtectionEnabled: true,
            PointInTimeRecoverySpecification: { PointInTimeRecoveryEnabled: true },
            TimeToLiveSpecification: { AttributeName: 'leaseUntil', Enabled: true },
        }));
    });
    it('defaults to retain so a stateful table is never destroyed implicitly', () => {
        new DynamoDBTable(stack, 'Table', {
            tableName: 'locks',
            partitionKey: { name: 'PK', type: dynamodb.AttributeType.STRING },
        });
        Template.fromStack(stack).hasResource('AWS::DynamoDB::Table', { DeletionPolicy: 'Retain' });
    });
    it('grants read-write to readWriteRoles on a created table', () => {
        const role = new iam.Role(stack, 'RwRole', { assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com') });
        new DynamoDBTable(stack, 'Table', {
            tableName: 'locks',
            partitionKey: { name: 'PK', type: dynamodb.AttributeType.STRING },
            readWriteRoles: [role],
        });
        Template.fromStack(stack).hasResourceProperties('AWS::IAM::Policy', Match.objectLike({
            PolicyDocument: {
                Statement: Match.arrayWith([
                    Match.objectLike({ Action: Match.arrayWith(['dynamodb:PutItem']), Effect: 'Allow' }),
                ]),
                Version: '2012-10-17',
            },
        }));
    });
});
//# sourceMappingURL=dynamodb.test.js.map