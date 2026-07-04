// AWS Secrets Manager constants
export const SECRETS_PREFIX = 'komodo/';
export const SECRETS_MANAGER_DEFAULT_KMS_KEY_ID = 'aws/secretsmanager';

// Secret naming patterns
export const SECRET_NAME_PATTERN = '{env}/{service}';
export const SECRET_NAME_PATTERN_FULL = 'komodo/{env}/{service}';

// Secret rotation
export const SECRET_ROTATION_ENABLED = true;
export const SECRET_ROTATION_INTERVAL_DAYS = 30;
