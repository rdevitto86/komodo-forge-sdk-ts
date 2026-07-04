import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';

export interface VpcSubnetGroup {
	name: string;
	subnetType: ec2.SubnetType;
	cidrMask?: number;
}

export interface VpcProps {
	id?: string;
	vpcId?: string;
	maxAzs?: number;
	natGateways?: number;
	subnetGroups?: VpcSubnetGroup[];
	cidr?: string;
	enableDnsHostnames?: boolean;
	enableDnsSupport?: boolean;
	vpnGateway?: boolean;
	vpnRoutePropagation?: ec2.SubnetSelection[];
	tags?: Record<string, string>;
}

export class Vpc extends Construct {
	public readonly vpc: ec2.Vpc;

	constructor(scope: Construct, id: string, props: VpcProps = {}) {
		super(scope, id);

		if (props.vpcId) {
			this.vpc = ec2.Vpc.fromLookup(this, props.id || 'Vpc', {
				vpcId: props.vpcId,
			}) as ec2.Vpc;
			return;
		}

		const subnetGroups: ec2.SubnetConfiguration[] = (props.subnetGroups ?? []).map((group) => ({
			name: group.name,
			subnetType: group.subnetType,
			...(group.cidrMask && { cidrMask: group.cidrMask }),
		}));

		this.vpc = new ec2.Vpc(this, props.id || 'Vpc', {
			maxAzs: props.maxAzs || 2,
			natGateways: props.natGateways || 1,
			...(subnetGroups.length > 0 && { subnetConfiguration: subnetGroups }),
			...(props.cidr && { cidr: props.cidr }),
			...(props.enableDnsHostnames !== undefined && { enableDnsHostnames: props.enableDnsHostnames }),
			...(props.enableDnsSupport !== undefined && { enableDnsSupport: props.enableDnsSupport }),
			...(props.vpnGateway && { vpnGateway: true }),
			...(props.vpnRoutePropagation && { vpnRoutePropagation: props.vpnRoutePropagation }),
		});

		if (props.tags) {
			Object.entries(props.tags).forEach(([key, value]) => {
				cdk.Tags.of(this.vpc).add(key, value);
			});
		}
	}
}
