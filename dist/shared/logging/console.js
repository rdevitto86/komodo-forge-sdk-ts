import { formatEvent } from './format.js';
// --- Level gate ---
const LEVEL_WEIGHT = {
    debug: 1, info: 2, warn: 3, error: 4,
};
// Module-level state — optionally set via consoleLogger.init()
let _service = 'app';
let _version = 'unknown';
let _env = 'development';
let _minLevel = LEVEL_WEIGHT.debug;
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
function buildEvent(level, message, details) {
    const event = {
        timestamp: new Date().toISOString(),
        level,
        type: 'runtime',
        service: _service,
        env: _env,
        version: _version,
        message,
    };
    if (details !== undefined)
        event.details = details;
    return event;
}
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
export const consoleLogger = {
    init(config = {}) {
        if (config.service !== undefined)
            _service = config.service;
        if (config.version !== undefined)
            _version = config.version;
        if (config.env !== undefined)
            _env = config.env;
        _minLevel = LEVEL_WEIGHT[config.level ?? 'debug'] ?? LEVEL_WEIGHT.debug;
    },
    debug(message, details) {
        if (LEVEL_WEIGHT.debug < _minLevel)
            return;
        consoleOut('debug', formatEvent(buildEvent('debug', message, details), true));
    },
    info(message, details) {
        if (LEVEL_WEIGHT.info < _minLevel)
            return;
        consoleOut('info', formatEvent(buildEvent('info', message, details), true));
    },
    warn(message, details) {
        if (LEVEL_WEIGHT.warn < _minLevel)
            return;
        consoleOut('warn', formatEvent(buildEvent('warn', message, details), true));
    },
    error(message, details) {
        if (LEVEL_WEIGHT.error < _minLevel)
            return;
        consoleOut('error', formatEvent(buildEvent('error', message, details), true));
    },
};
export default consoleLogger;
//# sourceMappingURL=console.js.map