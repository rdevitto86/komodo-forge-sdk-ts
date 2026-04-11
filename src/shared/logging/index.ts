// Base types — no SDK deps, safe to import anywhere
export type { LogLevel, LogEventType, BaseLogEvent } from './common/base.js';

// Per-type event schemas
export type { RuntimeLogEvent, ClickstreamLogEvent, InteractionLogEvent, TelemetryLogEvent } from './common/schema.js';

// Per-logger config types + transport enum
export type { Transport, RuntimeLoggerConfig, ClickstreamLoggerConfig, InteractionLoggerConfig, TelemetryLoggerConfig } from './common/config.js';

// Individual loggers — import only what your context needs
export { RuntimeLogger }     from './loggers/runtime.js';
export { ClickstreamLogger } from './loggers/clickstream.js';
export { InteractionLogger } from './loggers/interaction.js';
export { TelemetryLogger }   from './loggers/telemetry.js';
