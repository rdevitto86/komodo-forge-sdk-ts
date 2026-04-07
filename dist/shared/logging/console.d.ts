import type { LogLevel } from './base.js';
/**
 * Zero-config console-only logger. No remote shipping, no worker, no redaction.
 * Call init() to set service metadata — optional, works without it.
 *
 * @example
 * consoleLogger.warn('Something went wrong', { status: 503 });
 *
 * // Optional setup:
 * consoleLogger.init({ service: 'komodo-api', env: 'production', level: 'warn' });
 */
export declare const consoleLogger: {
    init(config?: {
        service?: string;
        version?: string;
        env?: string;
        level?: LogLevel;
    }): void;
    debug(message: string, details?: Record<string, unknown>): void;
    info(message: string, details?: Record<string, unknown>): void;
    warn(message: string, details?: Record<string, unknown>): void;
    error(message: string, details?: Record<string, unknown>): void;
};
export default consoleLogger;
//# sourceMappingURL=console.d.ts.map