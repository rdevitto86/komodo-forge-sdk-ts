import * as cdk from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
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
});
//# sourceMappingURL=dynamodb.test.js.map