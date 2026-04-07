import type { LogEventType } from './base.js';
import type { RuntimeLogEvent } from './schema.js';
import type { ClickstreamLogEvent } from './schema.js';
import type { TelemetryLogEvent } from './schema.js';
import type { LoggerConfig, ProviderConfig } from './config.js';
export interface Logger {
    /**
     * Sets service metadata and worker transport. Returns logger for chaining.
     * Optional — logger works as a zero-config console printer without it.
     *
     * @example
     * logger
     *   .init({ service: 'komodo-api', version: '1.0', env: 'production', level: 'warn' })
     *   .addListener.runtime({ endpoint: '/api/log' })
     *   .addListener.clickstream({ endpoint: '/api/log', batchSize: 25 });
     */
    init(config: LoggerConfig): Logger;
    /**
     * Registers a remote endpoint for an event type. Returns logger for chaining.
     * Sub-loggers are no-ops until their listener is added.
     */
    addListener: {
        runtime(cfg: ProviderConfig): Logger;
        clickstream(cfg: ProviderConfig): Logger;
        interaction(cfg: ProviderConfig): Logger;
        telemetry(cfg: ProviderConfig): Logger;
    };
    debug(message: string, details?: RuntimeLogEvent['details'], requestId?: string): void;
    info(message: string, details?: RuntimeLogEvent['details'], requestId?: string): void;
    warn(message: string, details?: RuntimeLogEvent['details'], requestId?: string): void;
    error(message: string, details?: RuntimeLogEvent['details'], requestId?: string): void;
    clickstream: {
        /**
         * @example
         * logger.clickstream.track('click', { id: 'buy-now', label: 'Buy Now' });
         */
        track(action: ClickstreamLogEvent['details']['action'], target: ClickstreamLogEvent['details']['target'], requestId?: string): void;
    };
    interaction: {
        /**
         * @example
         * logger.interaction.track('add_to_cart', { itemId: 'sku-123', quantity: 2 });
         */
        track(action: string, data?: Record<string, unknown>, requestId?: string): void;
    };
    telemetry: {
        /**
         * @example
         * logger.telemetry.trace('checkout.load', { duration: 245, component: 'CheckoutPage' });
         */
        trace(name: string, attributes?: Partial<TelemetryLogEvent['details']>, requestId?: string): void;
    };
    /** Triggers an immediate flush for one provider type, or all if omitted. */
    flush(type?: LogEventType): void;
    /** Signals the worker to stop and waits for a drain window before terminating. */
    stop(): void;
}
export declare const logger: Logger;
export default logger;
//# sourceMappingURL=logger.d.ts.map