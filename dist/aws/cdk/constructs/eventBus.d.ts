import * as cdk from 'aws-cdk-lib';
import * as events from 'aws-cdk-lib/aws-events';
import * as eventschemas from 'aws-cdk-lib/aws-eventschemas';
import { Construct } from 'constructs';
export declare const SCHEMA_TYPE_OPENAPI3 = "OpenApi3";
export declare const SCHEMA_TYPE_JSON_DRAFT4 = "JSONSchemaDraft4";
export interface EventBusSchema {
    schemaName: string;
    content: string;
    type?: string;
    description?: string;
}
export interface EventBusProps {
    busName: string;
    archiveEnabled?: boolean;
    archiveRetention?: cdk.Duration;
    archiveEventPattern?: events.EventPattern;
    archiveDescription?: string;
    registryEnabled?: boolean;
    registryName?: string;
    registryDescription?: string;
    schemas?: EventBusSchema[];
    tags?: Record<string, string>;
}
export declare class EventBus extends Construct {
    readonly bus: events.EventBus;
    readonly archive?: events.Archive;
    readonly registry?: eventschemas.CfnRegistry;
    readonly schemas: eventschemas.CfnSchema[];
    constructor(scope: Construct, id: string, props: EventBusProps);
}
//# sourceMappingURL=eventBus.d.ts.map