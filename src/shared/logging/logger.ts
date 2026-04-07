import type { LogLevel, LogEventType, BaseLogEvent } from './base.js';
import type { RuntimeLogEvent }     from './schema.js';
import type { ClickstreamLogEvent } from './schema.js';
import type { InteractionLogEvent } from './schema.js';
import type { TelemetryLogEvent }   from './schema.js';
import type { LoggerConfig, ProviderConfig } from './config.js';
import { formatEvent }      from './format.js';
import { LogHandler }        from './handler.js';
import { redact }            from '../redaction/index.js';
import { getCorrelationId }  from '../http/utils/index.js';

export { getCorrelationId };

// --- Level gate ---

const LEVEL_WEIGHT: Record<LogLevel, number> = {
  debug: 1, info: 2, warn: 3, error: 4,
};

// Module-level state — mutated by logger.init()
let _service  = 'unknown';
let _version  = 'unknown';
let _env      = 'development';
let _verbose  = true;
let _minLevel = LEVEL_WEIGHT.warn;

// --- Helpers ---

function handler(): LogHandler { return LogHandler.getInstance(); }

function isBrowser(): boolean { return 'window' in globalThis; }

/**
 * Redacts the event in place (fast-redact mutates), then ships it.
 * Console formatting must happen BEFORE this call so devs see unredacted output.
 */
function ship(event: BaseLogEvent): void {
  handler().send(redact(event as unknown as Record<string, unknown>) as unknown as BaseLogEvent);
}

function consoleOut(level: LogLevel, formatted: string): void {
  if (!formatted) return;
  switch (level) {
    case 'debug': console.debug(formatted); break;
    case 'info':  console.info(formatted);  break;
    case 'warn':  console.warn(formatted);  break;
    case 'error': console.error(formatted); break;
  }
}

// --- Runtime event builder ---

function buildRuntime(
  level:      LogLevel,
  message:    string,
  details?:   RuntimeLogEvent['details'],
  requestId?: string,
): RuntimeLogEvent {
  const event: RuntimeLogEvent = {
    timestamp: new Date().toISOString(),
    level,
    type:    'runtime',
    service: _service,
    env:     _env,
    version: _version,
    message,
  };
  if (requestId !== undefined) event.requestId = requestId;
  if (details   !== undefined) event.details   = details;
  return event;
}

// ============================================================
// Logger interface — self-referential for builder chaining
// ============================================================

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
    runtime(cfg: ProviderConfig):     Logger;
    clickstream(cfg: ProviderConfig): Logger;
    interaction(cfg: ProviderConfig): Logger;
    telemetry(cfg: ProviderConfig):   Logger;
  };

  // ---- Runtime -----------------------------------------------
  // Console format (verbose):  2026-04-06T14:23:01Z [ERROR] req-abc | msg | key=val
  // Console format (prod):     suppresses debug/info; warn/error use the same full format
  // debug is local-only; info/warn/error are also shipped remotely if runtime listener added.
  // ------------------------------------------------------------

  debug(message: string, details?: RuntimeLogEvent['details'], requestId?: string): void;
  info(message:  string, details?: RuntimeLogEvent['details'], requestId?: string): void;
  warn(message:  string, details?: RuntimeLogEvent['details'], requestId?: string): void;
  error(message: string, details?: RuntimeLogEvent['details'], requestId?: string): void;

  // ---- Clickstream -------------------------------------------
  // Browser only. No-op until addListener.clickstream() is called.
  // ------------------------------------------------------------

  clickstream: {
    /**
     * @example
     * logger.clickstream.track('click', { id: 'buy-now', label: 'Buy Now' });
     */
    track(
      action:     ClickstreamLogEvent['details']['action'],
      target:     ClickstreamLogEvent['details']['target'],
      requestId?: string,
    ): void;
  };

  // ---- Interaction -------------------------------------------
  // Browser only. No-op until addListener.interaction() is called.
  // ------------------------------------------------------------

  interaction: {
    /**
     * @example
     * logger.interaction.track('add_to_cart', { itemId: 'sku-123', quantity: 2 });
     */
    track(
      action:     string,
      data?:      Record<string, unknown>,
      requestId?: string,
    ): void;
  };

  // ---- Telemetry ---------------------------------------------
  // Universal. No-op until addListener.telemetry() is called.
  // ------------------------------------------------------------

  telemetry: {
    /**
     * @example
     * logger.telemetry.trace('checkout.load', { duration: 245, component: 'CheckoutPage' });
     */
    trace(
      name:        string,
      attributes?: Partial<TelemetryLogEvent['details']>,
      requestId?:  string,
    ): void;
  };

  // ---- Lifecycle ---------------------------------------------

  /** Triggers an immediate flush for one provider type, or all if omitted. */
  flush(type?: LogEventType): void;

  /** Signals the worker to stop and waits for a drain window before terminating. */
  stop(): void;
}

// ============================================================
// Implementation
// ============================================================

export const logger: Logger = {

  init(config: LoggerConfig): Logger {
    _service  = config.service;
    _version  = config.version;
    _env      = config.env;
    _verbose  = config.env !== 'production';
    _minLevel = LEVEL_WEIGHT[config.level ?? 'warn'] ?? LEVEL_WEIGHT.warn;
    handler().configure(config.transport);
    return logger;
  },

  addListener: {
    runtime(cfg: ProviderConfig):     Logger { handler().addProvider('runtime',     cfg); return logger; },
    clickstream(cfg: ProviderConfig): Logger { handler().addProvider('clickstream', cfg); return logger; },
    interaction(cfg: ProviderConfig): Logger { handler().addProvider('interaction', cfg); return logger; },
    telemetry(cfg: ProviderConfig):   Logger { handler().addProvider('telemetry',   cfg); return logger; },
  },

  // ---- Runtime -----------------------------------------------

  debug(message: string, details?: RuntimeLogEvent['details'], requestId?: string): void {
    if (LEVEL_WEIGHT.debug < _minLevel) return;
    const event = buildRuntime('debug', message, details, requestId);
    consoleOut('debug', formatEvent(event, _verbose));
  },

  info(message: string, details?: RuntimeLogEvent['details'], requestId?: string): void {
    if (LEVEL_WEIGHT.info < _minLevel) return;
    const event = buildRuntime('info', message, details, requestId);
    consoleOut('info', formatEvent(event, _verbose));
    ship(event);
  },

  warn(message: string, details?: RuntimeLogEvent['details'], requestId?: string): void {
    if (LEVEL_WEIGHT.warn < _minLevel) return;
    const event = buildRuntime('warn', message, details, requestId);
    consoleOut('warn', formatEvent(event, _verbose));
    ship(event);
  },

  error(message: string, details?: RuntimeLogEvent['details'], requestId?: string): void {
    if (LEVEL_WEIGHT.error < _minLevel) return;
    const event = buildRuntime('error', message, details, requestId);
    consoleOut('error', formatEvent(event, _verbose));
    ship(event);
  },

  // ---- Clickstream -------------------------------------------

  clickstream: {
    track(
      action:     ClickstreamLogEvent['details']['action'],
      target:     ClickstreamLogEvent['details']['target'],
      requestId?: string,
    ): void {
      if (!handler().hasProvider('clickstream')) return;
      if (!isBrowser()) return;

      const details: ClickstreamLogEvent['details'] = {
        action,
        target,
        url:           (globalThis as { location?: { href: string } }).location?.href ?? '',
        correlationId: getCorrelationId(),
      };

      const w = (globalThis as { innerWidth?: number }).innerWidth;
      const h = (globalThis as { innerHeight?: number }).innerHeight;
      if (w !== undefined && h !== undefined) details.viewport = `${w}x${h}`;

      const event: ClickstreamLogEvent = {
        timestamp: new Date().toISOString(),
        level:     'info',
        type:      'clickstream',
        service:   _service,
        env:       _env,
        version:   _version,
        message:   `${action} on ${target.label ?? target.id ?? target.path ?? 'element'}`,
        details,
      };
      if (requestId !== undefined) event.requestId = requestId;

      if (_verbose) consoleOut('debug', formatEvent(event, _verbose));
      ship(event);
    },
  },

  // ---- Interaction -------------------------------------------

  interaction: {
    track(
      action:     string,
      data?:      Record<string, unknown>,
      requestId?: string,
    ): void {
      if (!handler().hasProvider('interaction')) return;
      if (!isBrowser()) return;

      const details: InteractionLogEvent['details'] = {
        action,
        url:           (globalThis as { location?: { href: string } }).location?.href ?? '',
        correlationId: getCorrelationId(),
      };
      if (data !== undefined) details.data = data;

      const event: InteractionLogEvent = {
        timestamp: new Date().toISOString(),
        level:     'info',
        type:      'interaction',
        service:   _service,
        env:       _env,
        version:   _version,
        message:   action,
        details,
      };
      if (requestId !== undefined) event.requestId = requestId;

      if (_verbose) consoleOut('debug', formatEvent(event, _verbose));
      ship(event);
    },
  },

  // ---- Telemetry ---------------------------------------------

  telemetry: {
    trace(
      name:        string,
      attributes?: Partial<TelemetryLogEvent['details']>,
      requestId?:  string,
    ): void {
      if (!handler().hasProvider('telemetry')) return;

      const event: TelemetryLogEvent = {
        timestamp: new Date().toISOString(),
        level:     'info',
        type:      'telemetry',
        service:   _service,
        env:       _env,
        version:   _version,
        message:   name,
        details:   { name, ...attributes } as TelemetryLogEvent['details'],
      };
      if (requestId !== undefined) event.requestId = requestId;

      if (_verbose) consoleOut('debug', formatEvent(event, _verbose));
      ship(event);
    },
  },

  // ---- Lifecycle ---------------------------------------------

  flush(type?: LogEventType): void {
    handler().flush(type);
  },

  stop(): void {
    handler().stop();
    LogHandler.reset();
  },
};

export default logger;
