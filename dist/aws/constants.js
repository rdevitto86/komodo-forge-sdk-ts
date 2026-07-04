export * as auroraConstants from './aurora/constants.js';
export * as cloudfrontConstants from './cloudfront/constants.js';
export * as cloudwatchConstants from './cloudwatch/constants.js';
export * as dynamodbConstants from './dynamodb/constants.js';
export * as elasticacheConstants from './elasticache/constants.js';
export * as lambdaConstants from './lambda/constants.js';
export * as s3Constants from './s3/constants.js';
export * as secretsManagerConstants from './secrets-manager/index.js';
export * as sesConstants from './ses/constants.js';
export * as snsConstants from './sns/constants.js';
export * as sqsConstants from './sqs/constants.js';
// AWS regions
export const REGION_EAST1 = 'us-east-1'; // Virginia, US
export const REGION_EAST2 = 'us-east-2'; // Ohio, US
export const REGION_WEST1 = 'us-west-1'; // Northern California, US
export const REGION_WEST2 = 'us-west-2'; // Oregon, US
export const REGION_EU_CENTRAL1 = 'eu-central-1'; // Frankfurt, DE
export const REGION_EU_WEST1 = 'eu-west-1'; // Ireland, IE
export const REGION_AP_SE1 = 'ap-southeast-1'; // Singapore, SG
export const REGION_AP_SE2 = 'ap-southeast-2'; // Sydney, AU
export const REGION_AP_SE4 = 'ap-southeast-4'; // Melbourne, AU
export const REGION_AP_NORTHEAST1 = 'ap-northeast-1'; // Tokyo, JP
export const REGION_AP_SOUTH1 = 'ap-south-1'; // Mumbai, IN
export const REGION_SA_EAST1 = 'sa-east-1'; // São Paulo, BR
export const REGION_AF_SOUTH1 = 'af-south-1'; // Cape Town, ZA
export const REGIONS = {
    REGION_EAST1,
    REGION_EAST2,
    REGION_WEST1,
    REGION_WEST2,
    REGION_EU_CENTRAL1,
    REGION_EU_WEST1,
    REGION_AP_SE1,
    REGION_AP_SE2,
    REGION_AP_SE4,
    REGION_AP_NORTHEAST1,
    REGION_AP_SOUTH1,
};
export const DEFAULT_REGION_US = REGION_EAST2;
export const DEFAULT_REGION_EAST = REGION_EAST2;
export const DEFAULT_REGION_WEST = REGION_WEST2;
export const DEFAULT_REGION_EU = REGION_EU_CENTRAL1;
export const DEFAULT_REGION_EU_CENTRAL = REGION_EU_CENTRAL1;
export const DEFAULT_REGION_EU_WEST = REGION_EU_WEST1;
export const DEFAULT_REGION_AP = REGION_AP_SE1;
export const DEFAULT_REGION_AP_SE = REGION_AP_SE1;
export const DEFAULT_REGION_AP_NORTHEAST = REGION_AP_NORTHEAST1;
export const DEFAULT_REGION_AP_SOUTH = REGION_AP_SOUTH1;
// AWS accounts
export const DEFAULT_ACCOUNT_US_NONPROD = '122703641091';
export const DEFAULT_ACCOUNT_US_PROD = '123456789012';
export const DEFAULT_ACCOUNT_NONPROD = DEFAULT_ACCOUNT_US_NONPROD; // global default
export const DEFAULT_ACCOUNT_PROD = DEFAULT_ACCOUNT_US_PROD; // global default
// AWS ARNs
// ARN patterns
export const ARN_PARTITION_AWS = 'aws';
export const ARN_PARTITION_AWS_CN = 'aws-cn';
export const ARN_PARTITION_AWS_US_GOV = 'aws-us-gov';
// AWS IAM/Roles
// Role naming patterns
export const IAM_ROLE_PREFIX = 'komodo-';
export const IAM_ROLE_SUFFIX_TASK = '-task';
export const IAM_ROLE_SUFFIX_EXECUTION = '-execution';
export const IAM_ROLE_SUFFIX_LAMBDA = '-lambda';
// Common IAM policy names
export const IAM_POLICY_NAME_BASELINE = 'KomodoBaseline';
export const IAM_POLICY_NAME_READONLY = 'KomodoReadOnly';
// AWS Security Groups
// Security group naming patterns
export const SG_PREFIX = 'komodo-';
export const SG_SUFFIX_ALB = '-alb';
export const SG_SUFFIX_ECS = '-ecs';
export const SG_SUFFIX_ELASTICACHE = '-elasticache';
export const SG_SUFFIX_RDS = '-rds';
// Common security group descriptions
export const SG_DESC_ALB = 'Komodo ALB security group';
export const SG_DESC_ECS = 'Komodo ECS task security group';
export const SG_DESC_ELASTICACHE = 'Komodo ElastiCache security group';
// Common ports
export const PORT_HTTP = 80;
export const PORT_HTTPS = 443;
export const PORT_SSH = 22;
export const PORT_REDIS = 6379;
export const PORT_POSTGRES = 5432;
export const PORT_MYSQL = 3306;
// AWS ALB/ELB/WAF
export const WAF_MANAGED_RULE_COMMON = 'AWSManagedRulesCommonRuleSet';
export const WAF_MANAGED_RULE_KNOWN_BAD_INPUTS = 'AWSManagedRulesKnownBadInputsRuleSet';
// WAF rate limiting defaults
export const WAF_DEFAULT_GLOBAL_RATE_LIMIT = 2000;
export const WAF_DEFAULT_RATE_LIMIT_RULE = 100;
// ALB naming patterns
export const ALB_PREFIX = 'komodo-';
export const ALB_SUFFIX_PUBLIC = '-public';
export const ALB_SUFFIX_PRIVATE = '-private';
// ALB health check defaults
export const ALB_HEALTH_CHECK_INTERVAL_SECONDS = 30;
export const ALB_HEALTH_CHECK_TIMEOUT_SECONDS = 5;
export const ALB_HEALTH_CHECK_HEALTHY_THRESHOLD = 3;
export const ALB_HEALTH_CHECK_UNHEALTHY_THRESHOLD = 3;
export const ALB_HEALTH_CHECK_PATH = '/health';
// TODO: Add ALB/ELB specific constants when needed
// AWS VPC/Network
export const DEFAULT_VPC_CIDR = '10.0.0.0/16';
// Subnet CIDR patterns
export const SUBNET_CIDR_BITS = 8;
export const SUBNET_PUBLIC_PREFIX = '10.0.1';
export const SUBNET_PRIVATE_PREFIX = '10.0.2';
export const SUBNET_ISOLATED_PREFIX = '10.0.3';
// VPC naming patterns
export const VPC_PREFIX = 'komodo-';
export const VPC_SUFFIX_STG = '-stg';
export const VPC_SUFFIX_PROD = '-prod';
// Common tag keys
export const TAG_KEY_ENVIRONMENT = 'environment';
export const TAG_KEY_PROJECT = 'project';
export const TAG_KEY_OWNER = 'owner';
export const TAG_KEY_COST_CENTER = 'costCenter';
export const TAG_KEY_DATA_CLASSIFICATION = 'dataClassification';
export const TAG_KEY_MANAGED_BY = 'managedBy';
// Common tag values
export const TAG_VALUE_MANAGED_BY_KOMODO = 'komodo';
export const TAG_VALUE_DATA_CLASSIFICATION_PUBLIC = 'public';
export const TAG_VALUE_DATA_CLASSIFICATION_INTERNAL = 'internal';
export const TAG_VALUE_DATA_CLASSIFICATION_SENSITIVE = 'sensitive';
export const TAG_VALUE_DATA_CLASSIFICATION_CONFIDENTIAL = 'confidential';
// AWS KMS
// KMS key naming patterns
export const KMS_KEY_PREFIX = 'komodo-';
export const KMS_KEY_SUFFIX_ALIAS = '/alias/';
export const KMS_KEY_SUFFIX_MAIN = '-main';
export const KMS_KEY_SUFFIX_DATA = '-data';
export const KMS_KEY_SUFFIX_ENCRYPTION = '-encryption';
// KMS key specs
export const KMS_KEY_SPEC_SYMMETRIC_DEFAULT = 'SYMMETRIC_DEFAULT';
export const KMS_KEY_SPEC_RSA_2048 = 'RSA_2048';
export const KMS_KEY_SPEC_RSA_3072 = 'RSA_3072';
export const KMS_KEY_SPEC_RSA_4096 = 'RSA_4096';
export const KMS_KEY_SPEC_ECC_NIST_P256 = 'ECC_NIST_P256';
export const KMS_KEY_SPEC_ECC_NIST_P384 = 'ECC_NIST_P384';
export const KMS_KEY_SPEC_ECC_NIST_P521 = 'ECC_NIST_P521';
// KMS key usage
export const KMS_KEY_USAGE_ENCRYPT_DECRYPT = 'ENCRYPT_DECRYPT';
export const KMS_KEY_USAGE_SIGN_VERIFY = 'SIGN_VERIFY';
export const KMS_KEY_USAGE_GENERATE_VERIFY_MAC = 'GENERATE_VERIFY_MAC';
// AWS ECS/EC2
export const DEFAULT_ECS_TASK_SIZES = {
    MICRO: { cpu: 256, memoryLimitMiB: 512 },
    SMALL: { cpu: 512, memoryLimitMiB: 1024 },
    MEDIUM: { cpu: 1024, memoryLimitMiB: 2048 },
    LARGE: { cpu: 2048, memoryLimitMiB: 4096 },
    XLARGE: { cpu: 4096, memoryLimitMiB: 8192 },
};
// ECS cluster naming patterns
export const ECS_CLUSTER_PREFIX = 'komodo-';
export const ECS_SERVICE_PREFIX = 'komodo-';
// ECS task definition naming patterns
export const ECS_TASK_DEF_PREFIX = 'komodo-';
// EC2 instance types
export const EC2_INSTANCE_TYPE_T3_MICRO = 't3.micro';
export const EC2_INSTANCE_TYPE_T3_SMALL = 't3.small';
export const EC2_INSTANCE_TYPE_T3_MEDIUM = 't3.medium';
export const EC2_INSTANCE_TYPE_T3_LARGE = 't3.large';
export const EC2_INSTANCE_TYPE_T3_XLARGE = 't3.xlarge';
export const EC2_INSTANCE_TYPE_T3_2XLARGE = 't3.2xlarge';
// EC2 AMI patterns
export const EC2_AMI_OWNER_AMAZON = 'amazon';
export const EC2_AMI_OWNER_AWS_MARKETPLACE = 'aws-marketplace';
//# sourceMappingURL=constants.js.map