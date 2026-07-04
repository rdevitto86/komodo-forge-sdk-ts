// AWS CloudWatch/Alarms constants
export const CLOUDWATCH_NAMESPACE_ALB = 'AWS/ApplicationELB';
export const CLOUDWATCH_NAMESPACE_ECS = 'AWS/ECS';
export const CLOUDWATCH_NAMESPACE_LAMBDA = 'AWS/Lambda';

// Common metric names
export const METRIC_TARGET_RESPONSE_TIME = 'TargetResponseTime';
export const METRIC_REQUEST_COUNT = 'RequestCount';
export const METRIC_5XX_ERROR_COUNT = 'HTTPCode_Target_5XX_Count';
export const METRIC_4XX_ERROR_COUNT = 'HTTPCode_Target_4XX_Count';
export const METRIC_LATENCY_P50 = 'TargetResponseTime';
export const METRIC_LATENCY_P90 = 'TargetResponseTime';
export const METRIC_LATENCY_P99 = 'TargetResponseTime';

// Log retention periods (in days)
export const LOG_RETENTION_1_DAY = 1;
export const LOG_RETENTION_3_DAYS = 3;
export const LOG_RETENTION_5_DAYS = 5;
export const LOG_RETENTION_1_WEEK = 7;
export const LOG_RETENTION_2_WEEKS = 14;
export const LOG_RETENTION_1_MONTH = 30;
export const LOG_RETENTION_2_MONTHS = 60;
export const LOG_RETENTION_3_MONTHS = 90;
export const LOG_RETENTION_4_MONTHS = 120;
export const LOG_RETENTION_5_MONTHS = 150;
export const LOG_RETENTION_6_MONTHS = 180;
export const LOG_RETENTION_1_YEAR = 365;
export const LOG_RETENTION_2_YEARS = 730;
export const LOG_RETENTION_5_YEARS = 1827;
export const LOG_RETENTION_10_YEARS = 3653;
export const LOG_RETENTION_INFINITE = 0;

// Log group naming patterns
export const LOG_GROUP_PREFIX_ECS = '/ecs/';
export const LOG_GROUP_PREFIX_LAMBDA = '/aws/lambda/';
export const LOG_GROUP_PREFIX_API_GATEWAY = '/aws/apigateway/';

// Alarm evaluation periods
export const ALARM_DEFAULT_EVALUATION_PERIODS = 2;
export const ALARM_DEFAULT_PERIOD_SECONDS = 60;
