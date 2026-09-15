import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
const isCreateProps = (props) => 'partitionKey' in props && props.partitionKey !== undefined;
export class DynamoDBTable extends Construct {
    table;
    constructor(scope, id, props) {
        super(scope, id);
        this.table = isCreateProps(props) ? this.createTable(props) : this.lookupTable(props);
        for (const role of props.taskRoles ?? [])
            this.table.grantReadData(role);
        if (isCreateProps(props)) {
            for (const role of props.readWriteRoles ?? [])
                this.table.grantReadWriteData(role);
        }
    }
    lookupTable(props) {
        return dynamodb.Table.fromTableName(this, 'Resource', props.tableName);
    }
    createTable(props) {
        const table = new dynamodb.Table(this, 'Resource', {
            tableName: props.tableName,
            partitionKey: props.partitionKey,
            ...(props.sortKey && { sortKey: props.sortKey }),
            billingMode: props.billingMode ?? dynamodb.BillingMode.PAY_PER_REQUEST,
            encryption: props.encryption ?? dynamodb.TableEncryption.AWS_MANAGED,
            ...(props.timeToLiveAttribute && { timeToLiveAttribute: props.timeToLiveAttribute }),
            pointInTimeRecoverySpecification: {
                pointInTimeRecoveryEnabled: props.pointInTimeRecovery ?? false,
            },
            deletionProtection: props.deletionProtection ?? false,
            removalPolicy: props.removalPolicy ?? cdk.RemovalPolicy.RETAIN,
        });
        if (props.tags) {
            Object.entries(props.tags).forEach(([key, value]) => {
                cdk.Tags.of(table).add(key, value);
            });
        }
        return table;
    }
}
//# sourceMappingURL=dynamodb.js.map