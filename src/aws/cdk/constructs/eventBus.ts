import * as cdk from 'aws-cdk-lib';
import * as events from 'aws-cdk-lib/aws-events';
import * as eventschemas from 'aws-cdk-lib/aws-eventschemas';
import { Construct } from 'constructs';

export const SCHEMA_TYPE_OPENAPI3 = 'OpenApi3';
export const SCHEMA_TYPE_JSON_DRAFT4 = 'JSONSchemaDraft4';

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

const DEFAULT_ARCHIVE_RETENTION = cdk.Duration.days(90);

export class EventBus extends Construct {
	public readonly bus: events.EventBus;
	public readonly archive?: events.Archive;
	public readonly registry?: eventschemas.CfnRegistry;
	public readonly schemas: eventschemas.CfnSchema[] = [];

	constructor(scope: Construct, id: string, props: EventBusProps) {
		super(scope, id);

		this.bus = new events.EventBus(this, 'Resource', { eventBusName: props.busName });

		if (props.archiveEnabled ?? true) {
			this.archive = this.bus.archive('Archive', {
				archiveName: `${props.busName}-archive`,
				description: props.archiveDescription ?? `Replayable archive for ${props.busName}`,
				eventPattern: props.archiveEventPattern ?? { account: [cdk.Stack.of(this).account] },
				retention: props.archiveRetention ?? DEFAULT_ARCHIVE_RETENTION,
			});
		}

		if (props.registryEnabled ?? false) {
			const registryName = props.registryName ?? props.busName;

			this.registry = new eventschemas.CfnRegistry(this, 'Registry', {
				registryName,
				description: props.registryDescription ?? `Event schemas for ${props.busName}`,
			});

			for (const schema of props.schemas ?? []) {
				const resource = new eventschemas.CfnSchema(this, `Schema${schema.schemaName}`, {
					registryName,
					schemaName: schema.schemaName,
					type: schema.type ?? SCHEMA_TYPE_OPENAPI3,
					content: schema.content,
					...(schema.description && { description: schema.description }),
				});

				resource.addDependency(this.registry);
				this.schemas.push(resource);
			}
		}

		if (props.tags) {
			Object.entries(props.tags).forEach(([key, value]) => {
				cdk.Tags.of(this.bus).add(key, value);
			});
		}
	}
}
