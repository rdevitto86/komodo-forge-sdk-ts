import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

type DynamoDBTableProps = {
  tableName: string;
  taskRoles: iam.IRole[];
};

export class DynamoDBTable extends Construct {
  public readonly table: dynamodb.ITable;

  constructor(scope: Construct, id: string, props: DynamoDBTableProps) {
    super(scope, id);

    this.table = dynamodb.Table.fromTableName(this, 'Resource', props.tableName);
    for (const role of props.taskRoles) this.table.grantReadData(role);
  }
}
