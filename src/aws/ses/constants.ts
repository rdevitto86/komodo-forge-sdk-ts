// AWS SES constants
export const SES_CONFIGURATION_SET_PREFIX = 'komodo-';
export const SES_CONFIGURATION_SET_SUFFIX_STG = '-stg';
export const SES_CONFIGURATION_SET_SUFFIX_PROD = '-prod';

// SES sending limits
export const SES_MAX_SEND_RATE = 14; // messages per second
export const SES_MAX_SEND_QUOTA = 200; // 24-hour quota

// SES email types
export const SES_EMAIL_TYPE_TRANSACTIONAL = 'Transactional';
export const SES_EMAIL_TYPE_MARKETING = 'Marketing';

// SES reputation metrics
export const SES_REPUTATION_THRESHOLD_HEALTHY = 0.7;
