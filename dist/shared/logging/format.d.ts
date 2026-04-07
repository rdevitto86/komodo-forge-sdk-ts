import type { BaseLogEvent } from './base.js';
/**
 * Formats a log event for console output.
 *
 * All environments:
 *   2026-04-06T14:23:01.000Z [ERROR] req-abc123 | Failed to fetch order | error="timeout" status=503
 *   2026-04-06T14:23:01.000Z [CLICKSTREAM] - | click on #buy-now | action=click target.id="buy-now"
 *
 * Non-verbose (production) suppresses debug/info runtime events and all analytics events
 * from the console, but uses the same full format for everything that does appear.
 *
 * Returns an empty string when the event should be suppressed from console.
 */
export declare function formatEvent(event: BaseLogEvent, verbose: boolean): string;
//# sourceMappingURL=format.d.ts.map