// --- logfmt serialiser ---
// Produces key=value pairs; quotes values that contain spaces, quotes, or equals signs.
// e.g. { error: 'not found', status: 404 } → 'error="not found" status=404'
function toLogfmt(obj) {
    return Object.entries(obj)
        .filter(([, v]) => v !== undefined && v !== null)
        .map(([k, v]) => {
        const s = typeof v === 'string' ? v : JSON.stringify(v);
        return /[\s"=]/.test(s) ? `${k}="${s.replace(/"/g, '\\"')}"` : `${k}=${s}`;
    })
        .join(' ');
}
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
export function formatEvent(event, verbose) {
    const isRuntime = event.type === 'runtime';
    if (!verbose) {
        // Production: only runtime warn/error make it to the console; analytics are remote-only
        if (!isRuntime || event.level === 'debug' || event.level === 'info')
            return '';
    }
    const label = isRuntime ? event.level.toUpperCase() : event.type.toUpperCase();
    const reqId = event.requestId ?? '-';
    const details = event.details
        ? ' | ' + toLogfmt(event.details) : '';
    return `${event.timestamp} [${label}] ${reqId} | ${event.message}${details}`;
}
//# sourceMappingURL=format.js.map