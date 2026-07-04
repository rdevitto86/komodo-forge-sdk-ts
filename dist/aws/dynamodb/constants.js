// AWS DynamoDB constants
export const DYNAMODB_BILLING_MODE = {
    PAY_PER_REQUEST: 'PAY_PER_REQUEST',
    PROVISIONED: 'PROVISIONED',
};
// Default capacity units for provisioned mode
export const DYNAMODB_DEFAULT_READ_CAPACITY = 5;
export const DYNAMODB_DEFAULT_WRITE_CAPACITY = 5;
// Table naming patterns
export const DYNAMODB_TABLE_PREFIX = 'komodo-';
export const DYNAMODB_TABLE_SUFFIX_STG = '-stg';
export const DYNAMODB_TABLE_SUFFIX_PROD = '-prod';
// Common attribute names
export const DYNAMODB_PK_NAME = 'pk';
export const DYNAMODB_SK_NAME = 'sk';
export const DYNAMODB_GSI_NAME_PREFIX = 'gsi-';
export const DYNAMODB_LSI_NAME_PREFIX = 'lsi-';
//# sourceMappingURL=constants.js.map