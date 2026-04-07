// Base types (no SDK deps — safe to import anywhere without circular risk)
export type { LogLevel, LogEventType, BaseLogEvent } from './base.js';

// Per-type event schemas
export type { RuntimeLogEvent, ClickstreamLogEvent, InteractionLogEvent, TelemetryLogEvent } from './schema.js';

// Config types
export type { Transport, ProviderConfig, LoggerConfig } from './config.js';

// Logger interface (useful for typing parameters that accept the logger)
export type { Logger } from './logger.js';

// The unified logger — zero-config console printer by default,
// extended with remote shipping via logger.addListener.X()
export { logger, logger as default, getCorrelationId } from './logger.js';
