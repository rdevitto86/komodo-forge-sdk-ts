import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';

export interface SecurityGroupRule {
	peer: ec2.IPeer;
	connection: ec2.Port;
	description?: string;
	remoteRule?: boolean;
}

export interface SecurityGroupProps {
	vpc: ec2.IVpc;
	groupName?: string;
	description?: string;
	allowAllOutbound?: boolean;
	ingressRules?: SecurityGroupRule[];
	egressRules?: SecurityGroupRule[];
	tags?: Record<string, string>;
}

export class SecurityGroup extends Construct {
	public readonly securityGroup: ec2.SecurityGroup;

	constructor(scope: Construct, id: string, props: SecurityGroupProps) {
		super(scope, id);

		this.securityGroup = new ec2.SecurityGroup(this, props.groupName || 'SecurityGroup', {
			vpc: props.vpc,
			description: props.description || 'Security Group',
			allowAllOutbound: props.allowAllOutbound !== false,
		});

		if (props.tags) {
			Object.entries(props.tags).forEach(([key, value]) => {
				cdk.Tags.of(this.securityGroup).add(key, value);
			});
		}

		for (const rule of props.ingressRules ?? []) {
			this.securityGroup.addIngressRule(rule.peer, rule.connection, rule.description, rule.remoteRule);
		}
		for (const rule of props.egressRules ?? []) {
			this.securityGroup.addEgressRule(rule.peer, rule.connection, rule.description, rule.remoteRule);
		}
	}
}
