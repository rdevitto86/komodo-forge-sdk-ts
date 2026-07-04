// AWS ElastiCache/Redis constants
export const DEFAULT_REDIS_PORT = 6379;
// ElastiCache cluster naming patterns
export const ELASTICACHE_CLUSTER_PREFIX = 'komodo-';
export const ELASTICACHE_CLUSTER_SUFFIX_STG = '-stg';
export const ELASTICACHE_CLUSTER_SUFFIX_PROD = '-prod';
export const ELASTICACHE_CLUSTER_SUFFIX_REPLICA = '-replica';
// Redis engine versions
export const REDIS_ENGINE_VERSION = '7.x';
export const REDIS_ENGINE_VERSION_LATEST = '7.2';
// ElastiCache node types (memory optimized)
export const CACHE_NODE_TYPE_T3_MICRO = 'cache.t3.micro';
export const CACHE_NODE_TYPE_T3_SMALL = 'cache.t3.small';
export const CACHE_NODE_TYPE_T3_MEDIUM = 'cache.t3.medium';
export const CACHE_NODE_TYPE_T3_LARGE = 'cache.t3.large';
export const CACHE_NODE_TYPE_T3_XLARGE = 'cache.t3.xlarge';
export const CACHE_NODE_TYPE_T3_2XLARGE = 'cache.t3.2xlarge';
// ElastiCache node types (memory optimized - M series)
export const CACHE_NODE_TYPE_M6G_LARGE = 'cache.m6g.large';
export const CACHE_NODE_TYPE_M6G_XLARGE = 'cache.m6g.xlarge';
export const CACHE_NODE_TYPE_M6G_2XLARGE = 'cache.m6g.2xlarge';
export const CACHE_NODE_TYPE_M6G_4XLARGE = 'cache.m6g.4xlarge';
export const CACHE_NODE_TYPE_M6G_8XLARGE = 'cache.m6g.8xlarge';
export const CACHE_NODE_TYPE_M6G_12XLARGE = 'cache.m6g.12xlarge';
export const CACHE_NODE_TYPE_M6G_16XLARGE = 'cache.m6g.16xlarge';
// ElastiCache parameter groups
export const DEFAULT_PARAMETER_GROUP_REDIS = 'default.redis7';
export const DEFAULT_PARAMETER_GROUP_REDIS_CLUSTER = 'default.redis7.cluster';
// ElastiCache security configurations
export const ELASTICACHE_AUTH_TOKEN_MAX_LENGTH = 128;
export const ELASTICACHE_TRANSIT_ENCRYPTION_ENABLED = true;
export const ELASTICACHE_AT_REST_ENCRYPTION_ENABLED = true;
// ElastiCache cluster configurations
export const ELASTICACHE_NUM_CACHE_CLUSTERS_MIN = 1;
export const ELASTICACHE_NUM_CACHE_CLUSTERS_MAX = 15;
export const ELASTICACHE_REPLICA_COUNT_MIN = 0;
export const ELASTICACHE_REPLICA_COUNT_MAX = 5;
// ElastiCache maintenance window
export const ELASTICACHE_MAINTENANCE_WINDOW_DAY = 'sun';
export const ELASTICACHE_MAINTENANCE_WINDOW_START = '03:00';
export const ELASTICACHE_MAINTENANCE_WINDOW_DURATION_HOURS = 1;
// ElastiCache snapshot configurations
export const ELASTICACHE_SNAPSHOT_RETENTION_LIMIT_DAYS = 7;
export const ELASTICACHE_SNAPSHOT_WINDOW_DAY = 'sun';
export const ELASTICACHE_SNAPSHOT_WINDOW_START = '04:00';
// ElastiCache automatic failover
export const ELASTICACHE_AUTOMATIC_FAILOVER_ENABLED = true;
export const ELASTICACHE_MULTI_AZ_ENABLED = true;
// ElastiCache eviction policies
export const REDIS_EVICTION_POLICY_VOLATILE_LRU = 'volatile-lru';
export const REDIS_EVICTION_POLICY_ALLKEYS_LRU = 'allkeys-lru';
export const REDIS_EVICTION_POLICY_VOLATILE_LFU = 'volatile-lfu';
export const REDIS_EVICTION_POLICY_ALLKEYS_LFU = 'allkeys-lfu';
export const REDIS_EVICTION_POLICY_VOLATILE_RANDOM = 'volatile-random';
export const REDIS_EVICTION_POLICY_ALLKEYS_RANDOM = 'allkeys-random';
export const REDIS_EVICTION_POLICY_VOLATILE_TTL = 'volatile-ttl';
export const REDIS_EVICTION_POLICY_NOEVICTION = 'noeviction';
//# sourceMappingURL=constants.js.map