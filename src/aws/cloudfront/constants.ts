// AWS CloudFront constants
export const CLOUDFRONT_DISTRIBUTION_PREFIX = 'komodo-';
export const CLOUDFRONT_DISTRIBUTION_SUFFIX_STG = '-stg';
export const CLOUDFRONT_DISTRIBUTION_SUFFIX_PROD = '-prod';

// CloudFront cache behaviors
export const CLOUDFRONT_CACHE_POLICY_CACHING_OPTIMIZED = '658327ea-f89d-4fab-a63d-7e88639e58f6';
export const CLOUDFRONT_CACHE_POLICY_CACHING_DISABLED = '4135ea2d-9dfb-405a-bfdf-b4ce1d197caa';

// CloudFront origin request policies
export const CLOUDFRONT_ORIGIN_POLICY_ALL_VIEWER = '216adef6-5c7f-47e4-b989-5492eafa07d3';
export const CLOUDFRONT_ORIGIN_POLICY_NONE = 'b689b0a8-53d3-4076-9889-07ccf5b35edd';

// CloudFront TTL values (in seconds)
export const CLOUDFRONT_DEFAULT_TTL = 86400; // 24 hours
export const CLOUDFRONT_MIN_TTL = 0;
export const CLOUDFRONT_MAX_TTL = 31536000; // 365 days

// CloudFront price classes
export const CLOUDFRONT_PRICE_CLASS_100 = 'PriceClass_100';
export const CLOUDFRONT_PRICE_CLASS_200 = 'PriceClass_200';
export const CLOUDFRONT_PRICE_CLASS_ALL = 'PriceClass_All';
