import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
export class DynamoDBTable extends Construct {
    table;
    constructor(scope, id, props) {
        super(scope, id);
        this.table = dynamodb.Table.fromTableName(props.stack, id, props.tableName);
        for (const role of props.taskRoles)
            this.table.grantReadData(role);
    }
}
//# sourceMappingURL=dynamodb.js.map