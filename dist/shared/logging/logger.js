import { formatEvent } from './format.js';
import { LogHandler } from './handler.js';
import { redact } from '../redaction/index.js';
// --- Level gate ---
const LEVEL_WEIGHT = {
    debug: 1, info: 2, warn: 3, error: 4,
};
// Module-level state — mutated by logger.init()
let _service = 'unknown';
let _version = 'unknown';
let _env = 'development';
let _verbose = true;
let _minLevel = LEVEL_WEIGHT.warn;
// --- Helpers ---
function handler() { return LogHandler.getInstance(); }
function isBrowser() { return 'window' in globalThis; }
/**
 * Redacts the event in place (fast-redact mutates), then ships it.
 * Console formatting must happen BEFORE this call so devs see unredacted output.
 */
function ship(event) {
    handler().send(redact(event));
}
function consoleOut(level, formatted) {
    if (!formatted)
        return;
    switch (level) {
        case 'debug':
            console.debug(formatted);
            break;
        case 'info':
            console.info(formatted);
            break;
        case 'warn':
            console.warn(formatted);
            break;
        case 'error':
            console.error(formatted);
            break;
    }
}
// --- Runtime event builder ---
function buildRuntime(level, message, details, requestId) {
    const event = {
        timestamp: new Date().toISOString(),
        level,
        type: 'runtime',
        service: _service,
        env: _env,
        version: _version,
        message,
    };
    if (requestId !== undefined)
        event.requestId = requestId;
    if (details !== undefined)
        event.details = details;
    return event;
}
// ============================================================
// Implementation
// ============================================================
export const logger = {
    init(config) {
        _service = config.service;
        _version = config.version;
        _env = config.env;
        _verbose = config.env !== 'production';
        _minLevel = LEVEL_WEIGHT[config.level ?? 'warn'] ?? LEVEL_WEIGHT.warn;
        handler().configure(config.transport);
        return logger;
    },
    addListener: {
        runtime(cfg) { handler().addProvider('runtime', cfg); return logger; },
        clickstream(cfg) { handler().addProvider('clickstream', cfg); return logger; },
        interaction(cfg) { handler().addProvider('interaction', cfg); return logger; },
        telemetry(cfg) { handler().addProvider('telemetry', cfg); return logger; },
    },
    // ---- Runtime -----------------------------------------------
    debug(message, details, requestId) {
        if (LEVEL_WEIGHT.debug < _minLevel)
            return;
        const event = buildRuntime('debug', message, details, requestId);
        consoleOut('debug', formatEvent(event, _verbose));
    },
    info(message, details, requestId) {
        if (LEVEL_WEIGHT.info < _minLevel)
            return;
        const event = buildRuntime('info', message, details, requestId);
        consoleOut('info', formatEvent(event, _verbose));
        ship(event);
    },
    warn(message, details, requestId) {
        if (LEVEL_WEIGHT.warn < _minLevel)
            return;
        const event = buildRuntime('warn', message, details, requestId);
        consoleOut('warn', formatEvent(event, _verbose));
        ship(event);
    },
    error(message, details, requestId) {
        if (LEVEL_WEIGHT.error < _minLevel)
            return;
        const event = buildRuntime('error', message, details, requestId);
        consoleOut('error', formatEvent(event, _verbose));
        ship(event);
    },
    // ---- Clickstream -------------------------------------------
    clickstream: {
        track(action, target, requestId) {
            if (!handler().hasProvider('clickstream'))
                return;
            if (!isBrowser())
                return;
            const details = {
                action,
                target,
                url: globalThis.location?.href ?? '',
            };
            const w = globalThis.innerWidth;
            const h = globalThis.innerHeight;
            if (w !== undefined && h !== undefined)
                details.viewport = `${w}x${h}`;
            const event = {
                timestamp: new Date().toISOString(),
                level: 'info',
                type: 'clickstream',
                service: _service,
                env: _env,
                version: _version,
                message: `${action} on ${target.label ?? target.id ?? target.path ?? 'element'}`,
                details,
            };
            if (requestId !== undefined)
                event.requestId = requestId;
            if (_verbose)
                consoleOut('debug', formatEvent(event, _verbose));
            ship(event);
        },
    },
    // ---- Interaction -------------------------------------------
    interaction: {
        track(action, data, requestId) {
            if (!handler().hasProvider('interaction'))
                return;
            if (!isBrowser())
                return;
            const details = {
                action,
                url: globalThis.location?.href ?? '',
            };
            if (data !== undefined)
                details.data = data;
            const event = {
                timestamp: new Date().toISOString(),
                level: 'info',
                type: 'interaction',
                service: _service,
                env: _env,
                version: _version,
                message: action,
                details,
            };
            if (requestId !== undefined)
                event.requestId = requestId;
            if (_verbose)
                consoleOut('debug', formatEvent(event, _verbose));
            ship(event);
        },
    },
    // ---- Telemetry ---------------------------------------------
    telemetry: {
        trace(name, attributes, requestId) {
            if (!handler().hasProvider('telemetry'))
                return;
            const event = {
                timestamp: new Date().toISOString(),
                level: 'info',
                type: 'telemetry',
                service: _service,
                env: _env,
                version: _version,
                message: name,
                details: { name, ...attributes },
            };
            if (requestId !== undefined)
                event.requestId = requestId;
            if (_verbose)
                consoleOut('debug', formatEvent(event, _verbose));
            ship(event);
        },
    },
    // ---- Lifecycle ---------------------------------------------
    flush(type) {
        handler().flush(type);
    },
    stop() {
        handler().stop();
        LogHandler.reset();
    },
};
export default logger;
//# sourceMappingURL=logger.js.map