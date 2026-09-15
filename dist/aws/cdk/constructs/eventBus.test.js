import * as cdk from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { beforeEach, describe, expect, it } from 'vitest';
import { EventBus, SCHEMA_TYPE_JSON_DRAFT4 } from './eventBus.js';
const SCHEMA_CONTENT = JSON.stringify({ openapi: '3.0.0', info: { title: 'Placeholder', version: '1.0.0' } });
describe('constructs/eventBus', () => {
    let stack;
    beforeEach(() => {
        stack = new cdk.Stack(new cdk.App(), 'TestStack', { env: { account: '123456789012', region: 'us-east-2' } });
    });
    it('creates a named bus', () => {
        new EventBus(stack, 'Bus', { busName: 'komodo-cicd-ci-builds' });
        Template.fromStack(stack).hasResourceProperties('AWS::Events::EventBus', { Name: 'komodo-cicd-ci-builds' });
    });
    it('archives by default with 90 day retention', () => {
        new EventBus(stack, 'Bus', { busName: 'komodo-cicd-ci-builds' });
        Template.fromStack(stack).hasResourceProperties('AWS::Events::Archive', {
            ArchiveName: 'komodo-cicd-ci-builds-archive',
            RetentionDays: 90,
        });
    });
    it('scopes the default archive pattern to the deploying account', () => {
        new EventBus(stack, 'Bus', { busName: 'komodo-cicd-ci-builds' });
        Template.fromStack(stack).hasResourceProperties('AWS::Events::Archive', Match.objectLike({ EventPattern: { account: ['123456789012'] } }));
    });
    it('honours a retention override', () => {
        new EventBus(stack, 'Bus', { busName: 'b', archiveRetention: cdk.Duration.days(365) });
        Template.fromStack(stack).hasResourceProperties('AWS::Events::Archive', { RetentionDays: 365 });
    });
    it('creates no archive when disabled', () => {
        const construct = new EventBus(stack, 'Bus', { busName: 'b', archiveEnabled: false });
        expect(construct.archive).toBeUndefined();
        Template.fromStack(stack).resourceCountIs('AWS::Events::Archive', 0);
    });
    it('creates no schema registry unless asked', () => {
        const construct = new EventBus(stack, 'Bus', { busName: 'b' });
        expect(construct.registry).toBeUndefined();
        Template.fromStack(stack).resourceCountIs('AWS::EventSchemas::Registry', 0);
    });
    it('registers schemas against the registry when enabled', () => {
        const construct = new EventBus(stack, 'Bus', {
            busName: 'komodo-cicd-ci-builds',
            registryEnabled: true,
            schemas: [{ schemaName: 'stage.started', content: SCHEMA_CONTENT }],
        });
        expect(construct.schemas.length).toBe(1);
        const template = Template.fromStack(stack);
        template.hasResourceProperties('AWS::EventSchemas::Registry', { RegistryName: 'komodo-cicd-ci-builds' });
        template.hasResourceProperties('AWS::EventSchemas::Schema', {
            SchemaName: 'stage.started',
            Type: 'OpenApi3',
            RegistryName: 'komodo-cicd-ci-builds',
        });
    });
    it('honours a schema type override', () => {
        new EventBus(stack, 'Bus', {
            busName: 'b',
            registryEnabled: true,
            schemas: [{ schemaName: 's', content: SCHEMA_CONTENT, type: SCHEMA_TYPE_JSON_DRAFT4 }],
        });
        Template.fromStack(stack).hasResourceProperties('AWS::EventSchemas::Schema', { Type: 'JSONSchemaDraft4' });
    });
    it('creates each schema after the registry it belongs to', () => {
        new EventBus(stack, 'Bus', {
            busName: 'b',
            registryEnabled: true,
            schemas: [{ schemaName: 's', content: SCHEMA_CONTENT }],
        });
        const schemas = Template.fromStack(stack).findResources('AWS::EventSchemas::Schema');
        for (const schema of Object.values(schemas)) {
            expect(schema.DependsOn).toBeDefined();
        }
    });
});
//# sourceMappingURL=eventBus.test.js.map