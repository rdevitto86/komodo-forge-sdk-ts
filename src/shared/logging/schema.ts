import type { BaseLogEvent } from './base.js';

// RuntimeLogEvent — service errors, unhandled exceptions, lifecycle events.
// The workhorse of the logging system; works in browser and server contexts.
export interface RuntimeLogEvent extends BaseLogEvent {
  type: 'runtime';
  details?: {
    correlationId?: string;   // sessionStorage UUID (browser) or X-Correlation-ID (server)
    error?:         string;
    stack?:         string;
    component?:     string;
    request?:       { method: string; path: string; status?: number };
    [key: string]:  unknown;
  };
}

// ClickstreamLogEvent — raw DOM events (browser only).
// High-frequency; batched aggressively before shipping.
export interface ClickstreamLogEvent extends BaseLogEvent {
  type:    'clickstream';
  level:   'info';
  details: {
    correlationId?: string;
    action:  'click' | 'hover' | 'scroll' | 'submit' | 'input' | 'focus' | 'blur';
    target: {
      id?:    string;
      label?: string;
      text?:  string;
      path?:  string;       // DOM selector path
      aria?:  string;
    };
    url:      string;
    viewport?: string;      // e.g. '1440x900'
    [key: string]: unknown;
  };
}

// InteractionLogEvent — semantic business events (browser only).
// Lower-frequency than clickstream; captures user intent, not raw DOM events.
// Examples: 'add_to_cart', 'checkout_start', 'search_submitted'
export interface InteractionLogEvent extends BaseLogEvent {
  type:    'interaction';
  level:   'info';
  details: {
    correlationId?: string;
    action:         string;
    url:            string;
    data?:          Record<string, unknown>;
    [key: string]:  unknown;
  };
}

// TelemetryLogEvent — performance metrics, Core Web Vitals, span timing.
// Universal — works in browser (Web Vitals) and server (service spans) contexts.
export interface TelemetryLogEvent extends BaseLogEvent {
  type:    'telemetry';
  level:   'info';
  details: {
    correlationId?: string;
    name:           string;
    duration?:      number;   // ms
    component?:     string;
    traceId?:       string;
    spanId?:        string;
    [key: string]:  unknown;
  };
}
