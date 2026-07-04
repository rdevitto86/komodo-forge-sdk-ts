import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export interface IamPolicyProps {
	policyName?: string;
	statements?: iam.PolicyStatement[];
	description?: string;
	roles?: iam.IRole[];
	users?: iam.IUser[];
	groups?: iam.IGroup[];
	tags?: Record<string, string>;
}

export class IamPolicy extends Construct {
	public readonly policy: iam.ManagedPolicy;

	constructor(scope: Construct, id: string, props: IamPolicyProps = {}) {
		super(scope, id);

		this.policy = new iam.ManagedPolicy(this, props.policyName || 'IamPolicy', {
			...(props.description && { description: props.description }),
			...(props.statements && props.statements.length > 0 && { statements: props.statements }),
			...(props.roles && props.roles.length > 0 && { roles: props.roles }),
			...(props.users && props.users.length > 0 && { users: props.users }),
			...(props.groups && props.groups.length > 0 && { groups: props.groups }),
		});

		if (props.tags) {
			Object.entries(props.tags).forEach(([key, value]) => {
				cdk.Tags.of(this.policy).add(key, value);
			});
		}
	}
}
