import type { LogEventType, BaseLogEvent } from './base.js';
import type { ProviderConfig, Transport } from './config.js';
/**
 * LogHandler — singleton that owns the single worker thread shared by all loggers.
 *
 * All four event types (runtime, clickstream, interaction, telemetry) route through here.
 * The worker maintains a separate buffer and flush schedule per provider type.
 *
 * Transport selection:
 *   'auto'        → detect environment (Lambda → fetch, Node → node-worker, browser → web-worker)
 *   'fetch'       → fire-and-forget per-event; safe for Lambda
 *   'web-worker'  → browser Web Worker; requires bundler (Vite/webpack 5) to inline the script
 *   'node-worker' → Node.js worker_threads; best for Fargate / long-running services
 *
 * Node worker init is async (dynamic import). Events during startup are buffered
 * in-process and flushed to the worker once it's ready.
 */
export declare class LogHandler {
    #private;
    private constructor();
    static getInstance(): LogHandler;
    /** Stops the current instance and clears the singleton — call before re-configuring in tests. */
    static reset(): void;
    /**
     * Sets the worker transport. Called by logger.init().
     * Safe to call before any addProvider() calls.
     */
    configure(transport?: Transport): void;
    /**
     * Registers a remote endpoint for one event type and configures its worker queue.
     * Lazily starts the worker if configure() hasn't been called yet.
     */
    addProvider(type: LogEventType, cfg: ProviderConfig): void;
    /** Returns true if a remote endpoint is configured for the given event type. */
    hasProvider(type: LogEventType): boolean;
    /** Dispatches a log event to the worker. */
    send(event: BaseLogEvent): void;
    /** Triggers an immediate flush for one provider, or all if omitted. */
    flush(provider?: LogEventType): void;
    /** Signals the worker to stop, then terminates it after a drain window. */
    stop(): void;
}
//# sourceMappingURL=handler.d.ts.map