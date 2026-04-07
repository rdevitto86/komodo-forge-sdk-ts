import type { LogLevel } from './base.js';

/** Worker transport strategy. 'auto' detects the environment at init time. */
export type Transport = 'auto' | 'fetch' | 'web-worker' | 'node-worker';

/** Remote shipping config for one event type. */
export interface ProviderConfig {
  endpoint:       string;
  /**
   * Auth/metadata headers sent with every remote batch.
   * Stored in memory only — never included in log payloads or redacted.
   */
  headers?:       Record<string, string>;
  /** Per-provider defaults: runtime 10, clickstream 20, interaction 10, telemetry 10 */
  batchSize?:     number;
  /** Per-provider defaults (ms): runtime 10 000, clickstream 5 000, interaction 10 000, telemetry 30 000 */
  flushInterval?: number;
}

export interface LoggerConfig {
  service:    string;
  version:    string;
  env:        string;
  /** Minimum level for runtime log output. Default: 'warn'. */
  level?:     LogLevel;
  /** Worker transport. Default: 'auto'. */
  transport?: Transport;
}
