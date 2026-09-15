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
export declare class DynamoDBTable extends Construct {
    readonly table: dynamodb.ITable | dynamodb.Table;
    constructor(scope: Construct, id: string, props: DynamoDBTableProps);
    private lookupTable;
    private createTable;
}
//# sourceMappingURL=dynamodb.d.ts.map