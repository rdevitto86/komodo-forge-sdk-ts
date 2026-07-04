import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as kms from 'aws-cdk-lib/aws-kms';
import { Construct } from 'constructs';

export interface KmsKeyProps {
	keyId?: string;
	alias?: string;
	description?: string;
	enableKeyRotation?: boolean;
	enabled?: boolean;
	keyUsage?: kms.KeyUsage;
	keySpec?: kms.KeySpec;
	removalPolicy?: cdk.RemovalPolicy;
	policy?: iam.PolicyDocument;
	administrators?: iam.IPrincipal[];
	tags?: Record<string, string>;
}

export class KmsKey extends Construct {
	public readonly key: kms.Key;

	constructor(scope: Construct, id: string, props: KmsKeyProps = {}) {
		super(scope, id);

		if (props.keyId) {
			this.key = kms.Key.fromLookup(this, props.keyId, {
				aliasName: props.keyId,
			}) as kms.Key;
			return;
		}

		this.key = new kms.Key(this, props.alias || 'KmsKey', {
			...(props.description && { description: props.description }),
			enableKeyRotation: props.enableKeyRotation || false,
			enabled: props.enabled !== false,
			...(props.keyUsage && { keyUsage: props.keyUsage }),
			...(props.keySpec && { keySpec: props.keySpec }),
			...(props.removalPolicy && { removalPolicy: props.removalPolicy }),
			...(props.policy && { policy: props.policy }),
			...(props.alias && { aliasName: props.alias }),
		});

		if (props.tags) {
			Object.entries(props.tags).forEach(([key, value]) => {
				cdk.Tags.of(this.key).add(key, value);
			});
		}

		for (const admin of props.administrators ?? []) {
			this.key.grantAdmin(admin);
		}
	}
}
