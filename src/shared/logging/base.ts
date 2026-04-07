// Isolated base types — no SDK imports. Everything else in shared/logging imports from here.

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export type LogEventType = 'runtime' | 'clickstream' | 'interaction' | 'telemetry';

/**
 * Fields present on every log event regardless of type.
 * correlationId is intentionally absent — it belongs in `details` since its
 * source differs per context (sessionStorage in browser, X-Correlation-ID header on server).
 */
export interface BaseLogEvent {
  timestamp:  string;         // ISO 8601 — set at emit time
  level:      LogLevel;
  type:       LogEventType;
  service:    string;         // e.g. 'komodo-api', 'komodo-ui'
  env:        string;         // 'production' | 'staging' | 'development'
  version:    string;         // semver from config
  requestId?: string;         // X-Request-ID — per HTTP request
  userId?:    string;         // populated when authenticated
  sessionId?: string;         // JWT session identifier
  message:    string;
  details?:   Record<string, unknown>;
}
