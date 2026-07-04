import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
type DynamoDBTableProps = {
    tableName: string;
    taskRoles: iam.IRole[];
};
export declare class DynamoDBTable extends Construct {
    readonly table: dynamodb.ITable;
    constructor(scope: Construct, id: string, props: DynamoDBTableProps);
}
export {};
//# sourceMappingURL=dynamodb.d.ts.map