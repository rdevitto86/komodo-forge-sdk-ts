import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export interface DynamoDBTableLookupProps {
	tableName: string;
	taskRoles: iam.IRole[];
}

export interface DynamoDBTableCreateProps {
	tableName: string;
	partitionKey: dynamodb.Attribute;
	sortKey?: dynamodb.Attribute;
	taskRoles?: iam.IRole[];
	readWriteRoles?: iam.IRole[];
	billingMode?: dynamodb.BillingMode;
	encryption?: dynamodb.TableEncryption;
	timeToLiveAttribute?: string;
	pointInTimeRecovery?: boolean;
	deletionProtection?: boolean;
	removalPolicy?: cdk.RemovalPolicy;
	tags?: Record<string, string>;
}

export type DynamoDBTableProps = DynamoDBTableLookupProps | DynamoDBTableCreateProps;

const isCreateProps = (props: DynamoDBTableProps): props is DynamoDBTableCreateProps =>
	'partitionKey' in props && props.partitionKey !== undefined;

export class DynamoDBTable extends Construct {
	public readonly table: dynamodb.ITable | dynamodb.Table;

	constructor(scope: Construct, id: string, props: DynamoDBTableProps) {
		super(scope, id);

		this.table = isCreateProps(props) ? this.createTable(props) : this.lookupTable(props);

		for (const role of props.taskRoles ?? []) this.table.grantReadData(role);
		if (isCreateProps(props)) {
			for (const role of props.readWriteRoles ?? []) this.table.grantReadWriteData(role);
		}
	}

	private lookupTable(props: DynamoDBTableLookupProps): dynamodb.ITable {
		return dynamodb.Table.fromTableName(this, 'Resource', props.tableName);
	}

	private createTable(props: DynamoDBTableCreateProps): dynamodb.Table {
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
