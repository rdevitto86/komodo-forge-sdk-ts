/**
 * Global constants for used across Komodo apps including environment, host, and port configurations
 */

// Komodo constants
export const KOMODO_NAMESPACE = 'komodo';
export const KOMODO_NAMESPACE_SHORT = 'kmdo';
export const KOMODO_NAME_FULL = 'Komodo Future Solutions';
export const KOMODO_NAME_SHORT = 'Komodo';
export const KOMODO_LEGAL_TYPE = 'LLC';

// Environment constants
export const ENV_LOCAL = 'local';
export const ENV_DEV = 'dev';
export const ENV_DEV_FULL = 'development';
export const ENV_PERF = 'perf';
export const ENV_PERF_FULL = 'performance';
export const ENV_QA = 'qa';
export const ENV_QA_FULL = 'quality-assurance';
export const ENV_STAGING = 'stg';
export const ENV_STAGING_FULL = 'staging';
export const ENV_PROD = 'prod';
export const ENV_PROD_FULL = 'production';

// Host constants
export const HOST_LOCAL = 'localhost';

// Port constants
export const DEFAULT_PORT_LOCAL = 8080;
export const DEFAULT_PORT_HTTP = 80;
export const DEFAULT_PORT_HTTPS = 443;

// App constants
export const DEFAULT_HEALTH_CHECK_PATH = '/health';
export const DEFAULT_EVAL_RULES_PATH = '/app/validation_rules.yaml';
export const DEFAULT_HEALTH_CHECK_COMMAND = ['CMD', '/komodo', '-healthcheck'];
export const DEFAULT_APP_VERSION = 'latest';

// CI/CD constants
export const CICD_TOOL_CDK = 'cdk';
export const CICD_TOOL_TERRAFORM = 'terraform';
export const CANARY_BLUE = 'blue';
export const CANARY_GREEN = 'green';
