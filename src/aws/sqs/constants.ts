// AWS SQS constants
export const SQS_QUEUE_PREFIX = 'komodo-';
export const SQS_QUEUE_SUFFIX_STG = '-stg';
export const SQS_QUEUE_SUFFIX_PROD = '-prod';
export const SQS_QUEUE_SUFFIX_DLQ = '-dlq';

// SQS queue attributes
export const SQS_DEFAULT_VISIBILITY_TIMEOUT_SECONDS = 30;
export const SQS_DEFAULT_MESSAGE_RETENTION_SECONDS = 345600; // 4 days
export const SQS_DEFAULT_RECEIVE_WAIT_TIME_SECONDS = 20; // long polling
export const SQS_DEFAULT_MAX_RECEIVE_COUNT = 3; // before moving to DLQ

// SQS message sizes
export const SQS_MAX_MESSAGE_SIZE_BYTES = 262144; // 256 KB
