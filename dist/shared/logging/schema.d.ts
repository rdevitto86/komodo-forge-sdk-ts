import type { BaseLogEvent } from './base.js';
export interface RuntimeLogEvent extends BaseLogEvent {
    type: 'runtime';
    details?: {
        correlationId?: string;
        error?: string;
        stack?: string;
        component?: string;
        request?: {
            method: string;
            path: string;
            status?: number;
        };
        [key: string]: unknown;
    };
}
export interface ClickstreamLogEvent extends BaseLogEvent {
    type: 'clickstream';
    level: 'info';
    details: {
        correlationId?: string;
        action: 'click' | 'hover' | 'scroll' | 'submit' | 'input' | 'focus' | 'blur';
        target: {
            id?: string;
            label?: string;
            text?: string;
            path?: string;
            aria?: string;
        };
        url: string;
        viewport?: string;
        [key: string]: unknown;
    };
}
export interface InteractionLogEvent extends BaseLogEvent {
    type: 'interaction';
    level: 'info';
    details: {
        correlationId?: string;
        action: string;
        url: string;
        data?: Record<string, unknown>;
        [key: string]: unknown;
    };
}
export interface TelemetryLogEvent extends BaseLogEvent {
    type: 'telemetry';
    level: 'info';
    details: {
        correlationId?: string;
        name: string;
        duration?: number;
        component?: string;
        traceId?: string;
        spanId?: string;
        [key: string]: unknown;
    };
}
//# sourceMappingURL=schema.d.ts.map