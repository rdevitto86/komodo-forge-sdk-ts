import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
export class SecurityGroup extends Construct {
    securityGroup;
    constructor(scope, id, props) {
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
//# sourceMappingURL=securityGroup.js.map