// AWS Lambda constants
export const LAMBDA_ARCHITECTURE_X86_64 = 'x86_64';
export const LAMBDA_ARCHITECTURE_ARM64 = 'arm64';
export const LAMBDA_RUNTIME_NODEJS_LATEST = 'nodejs26.x';

// Lambda memory configurations (in MB)
export const LAMBDA_MEMORY_MIN = 128;
export const LAMBDA_MEMORY_MAX = 10240;
export const LAMBDA_MEMORY_DEFAULT = 256;

// Lambda timeout configurations (in seconds)
export const LAMBDA_TIMEOUT_MIN = 1;
export const LAMBDA_TIMEOUT_MAX = 900;
export const LAMBDA_TIMEOUT_DEFAULT = 30;
