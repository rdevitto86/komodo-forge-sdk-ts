import type { LogEventType, BaseLogEvent } from './base.js';
import type { ProviderConfig, Transport } from './config.js';
import type { WorkerMessage, WorkerAckMessage } from './worker/shared.js';

// Per-provider default batch and flush settings (mirror the ecom adapter configs).
// Callers can override via ProviderConfig.batchSize / flushInterval.
const PROVIDER_DEFAULTS: Record<string, { batchSize: number; flushInterval: number }> = {
  runtime:     { batchSize: 10, flushInterval: 10_000 },
  clickstream: { batchSize: 20, flushInterval:  5_000 },  // high-volume: batch more, flush fast
  interaction: { batchSize: 10, flushInterval: 10_000 },
  telemetry:   { batchSize: 10, flushInterval: 30_000 },  // low-urgency: batch aggressively
};

// Duck-typed worker interface — covers both browser Worker and Node worker_threads.Worker
// without requiring DOM or conflicting global type declarations.
type WorkerLike = {
  postMessage(data: unknown): void;
  terminate?(): void | Promise<number>;
};

function resolveTransport(t: Transport): Exclude<Transport, 'auto'> {
  if (t !== 'auto') return t;
  if (typeof process !== 'undefined') {
    // Lambda: worker threads are unreliable — execution env can freeze before a thread flushes
    if (typeof process.env['AWS_LAMBDA_FUNCTION_NAME'] === 'string') return 'fetch';
    if (process.versions?.node !== undefined) return 'node-worker';
  }
  // Browser
  if ((globalThis as Record<string, unknown>)['Worker'] !== undefined) return 'web-worker';
  return 'fetch';
}

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
export class LogHandler {
  static #instance: LogHandler | null = null;

  #transport: Exclude<Transport, 'auto'> = 'fetch';
  #worker:    WorkerLike | null = null;
  #started  = false;
  #ready    = false;
  #pending: WorkerMessage[] = [];
  #providers = new Map<LogEventType, ProviderConfig>();

  private constructor() {}

  static getInstance(): LogHandler {
    LogHandler.#instance ??= new LogHandler();
    return LogHandler.#instance;
  }

  /** Stops the current instance and clears the singleton — call before re-configuring in tests. */
  static reset(): void {
    LogHandler.#instance?.stop();
    LogHandler.#instance = null;
  }

  /**
   * Sets the worker transport. Called by logger.init().
   * Safe to call before any addProvider() calls.
   */
  configure(transport?: Transport): void {
    this.#transport = resolveTransport(transport ?? 'auto');
    this.#ensureStarted();
  }

  /**
   * Registers a remote endpoint for one event type and configures its worker queue.
   * Lazily starts the worker if configure() hasn't been called yet.
   */
  addProvider(type: LogEventType, cfg: ProviderConfig): void {
    this.#providers.set(type, cfg);

    if (!this.#started) {
      // configure() wasn't called — auto-detect transport now
      this.#transport = resolveTransport('auto');
      this.#ensureStarted();
    }

    this.#dispatch({
      directive: 'CONFIG',
      provider:  type,
      payload: {
        endpoint:      cfg.endpoint,
        headers:       cfg.headers ?? {},
        batchSize:     cfg.batchSize     ?? (PROVIDER_DEFAULTS[type]?.batchSize     ?? 10),
        flushInterval: cfg.flushInterval ?? (PROVIDER_DEFAULTS[type]?.flushInterval ?? 10_000),
      },
    });
  }

  /** Returns true if a remote endpoint is configured for the given event type. */
  hasProvider(type: LogEventType): boolean {
    return this.#providers.has(type);
  }

  /** Dispatches a log event to the worker. */
  send(event: BaseLogEvent): void {
    this.#dispatch({ directive: 'LOG', provider: event.type, payload: event });
  }

  /** Triggers an immediate flush for one provider, or all if omitted. */
  flush(provider?: LogEventType): void {
    this.#dispatch(
      provider !== undefined
        ? { directive: 'FLUSH', provider }
        : { directive: 'FLUSH' },
    );
  }

  /** Signals the worker to stop, then terminates it after a drain window. */
  stop(): void {
    this.#dispatch({ directive: 'STOP' });
    setTimeout(() => {
      void this.#worker?.terminate?.();
      this.#worker  = null;
      this.#ready   = false;
      this.#pending = [];
    }, 500);
  }

  // --- private ---

  #ensureStarted(): void {
    if (this.#started) return;
    this.#started = true;
    if (this.#transport === 'web-worker') {
      this.#initBrowserWorker();
    } else if (this.#transport === 'node-worker') {
      void this.#initNodeWorker(); // async, non-blocking; events buffer until ready
    } else {
      this.#ready = true; // fetch is always ready
    }
  }

  #dispatch(msg: WorkerMessage): void {
    if (this.#transport === 'fetch') {
      if (msg.directive === 'LOG' && msg.provider && msg.payload !== undefined) {
        void this.#sendFetch(msg.provider, msg.payload);
      }
      return;
    }

    if (!this.#ready) {
      this.#pending.push(msg);
      return;
    }

    this.#worker?.postMessage(msg);
  }

  async #sendFetch(provider: string, payload: unknown): Promise<void> {
    const cfg = this.#providers.get(provider as LogEventType);
    if (!cfg) return;
    try {
      await fetch(cfg.endpoint, {
        method:    'POST',
        headers:   { 'Content-Type': 'application/json', ...(cfg.headers ?? {}) },
        body:      JSON.stringify(payload),
        keepalive: true,
      });
    } catch {
      // Remote logging must never crash the application
    }
  }

  #initBrowserWorker(): void {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const WorkerCtor = (globalThis as any).Worker as new (url: URL, opts?: { type?: string }) => WorkerLike & {
        onmessage: ((e: { data: WorkerAckMessage }) => void) | null;
        onerror:   ((e: { message: string }) => void) | null;
      };

      const w = new WorkerCtor(new URL('./worker/browser.js', import.meta.url), { type: 'module' });

      w.onmessage = ({ data }) => this.#handleAck(data);
      w.onerror   = ({ message }) => {
        console.error('[komodo-logger] browser worker error:', message);
        this.#degradeToFetch();
      };

      this.#worker = w;
      this.#markReady();
    } catch (err) {
      console.error('[komodo-logger] could not start browser worker:', err);
      this.#degradeToFetch();
    }
  }

  async #initNodeWorker(): Promise<void> {
    try {
      // Dynamic import keeps worker_threads out of browser bundles
      const { Worker } = await import('worker_threads');
      const w = new Worker(new URL('./worker/node.js', import.meta.url));

      w.on('message', (data: WorkerAckMessage) => this.#handleAck(data));
      w.on('error',   (err: Error) => {
        console.error('[komodo-logger] node worker error:', err.message);
        this.#degradeToFetch();
      });

      this.#worker = {
        postMessage: (data) => { w.postMessage(data); },
        terminate:   ()     => w.terminate(),
      };
      this.#markReady();
    } catch (err) {
      console.error('[komodo-logger] could not start node worker:', err);
      this.#degradeToFetch();
    }
  }

  #markReady(): void {
    this.#ready = true;
    const pending = this.#pending.splice(0);
    for (const msg of pending) this.#dispatch(msg);
  }

  #degradeToFetch(): void {
    this.#worker    = null;
    this.#transport = 'fetch';
    this.#markReady(); // flush pending via fetch path
  }

  #handleAck(data: WorkerAckMessage): void {
    switch (data.directive) {
      case 'ERROR':
        console.error('[komodo-logger] worker error:', data.payload);
        break;
      case 'STOP': {
        if (data.payload && typeof data.payload === 'object') {
          const lost = (data.payload as { lost?: Record<string, number> }).lost ?? {};
          const lines = Object.entries(lost).filter(([, n]) => n > 0);
          if (lines.length > 0) {
            console.warn('[komodo-logger] stopped with unsent logs:', lines.map(([p, n]) => `${p}: ${n}`).join(', '));
          }
        }
        break;
      }
    }
  }
}
