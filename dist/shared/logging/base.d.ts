export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export type LogEventType = 'runtime' | 'clickstream' | 'interaction' | 'telemetry';
/**
 * Fields present on every log event regardless of type.
 * correlationId is intentionally absent — it belongs in `details` since its
 * source differs per context (sessionStorage in browser, X-Correlation-ID header on server).
 */
export interface BaseLogEvent {
    timestamp: string;
    level: LogLevel;
    type: LogEventType;
    service: string;
    env: string;
    version: string;
    requestId?: string;
    userId?: string;
    sessionId?: string;
    message: string;
    details?: Record<string, unknown>;
}
//# sourceMappingURL=base.d.ts.map