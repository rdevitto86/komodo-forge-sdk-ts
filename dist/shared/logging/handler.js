function resolveTransport(t) {
    if (t !== 'auto')
        return t;
    if (typeof process !== 'undefined') {
        // Lambda: worker threads are unreliable — execution env can freeze before a thread flushes
        if (typeof process.env['AWS_LAMBDA_FUNCTION_NAME'] === 'string')
            return 'fetch';
        if (process.versions?.node !== undefined)
            return 'node-worker';
    }
    // Browser
    if (globalThis['Worker'] !== undefined)
        return 'web-worker';
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
    static #instance = null;
    #transport = 'fetch';
    #worker = null;
    #started = false;
    #ready = false;
    #pending = [];
    #providers = new Map();
    constructor() { }
    static getInstance() {
        LogHandler.#instance ??= new LogHandler();
        return LogHandler.#instance;
    }
    /** Stops the current instance and clears the singleton — call before re-configuring in tests. */
    static reset() {
        LogHandler.#instance?.stop();
        LogHandler.#instance = null;
    }
    /**
     * Sets the worker transport. Called by logger.init().
     * Safe to call before any addProvider() calls.
     */
    configure(transport) {
        this.#transport = resolveTransport(transport ?? 'auto');
        this.#ensureStarted();
    }
    /**
     * Registers a remote endpoint for one event type and configures its worker queue.
     * Lazily starts the worker if configure() hasn't been called yet.
     */
    addProvider(type, cfg) {
        this.#providers.set(type, cfg);
        if (!this.#started) {
            // configure() wasn't called — auto-detect transport now
            this.#transport = resolveTransport('auto');
            this.#ensureStarted();
        }
        this.#dispatch({
            directive: 'CONFIG',
            provider: type,
            payload: {
                endpoint: cfg.endpoint,
                headers: cfg.headers ?? {},
                batchSize: cfg.batchSize ?? 10,
                flushInterval: cfg.flushInterval ?? 10_000,
            },
        });
    }
    /** Returns true if a remote endpoint is configured for the given event type. */
    hasProvider(type) {
        return this.#providers.has(type);
    }
    /** Dispatches a log event to the worker. */
    send(event) {
        this.#dispatch({ directive: 'LOG', provider: event.type, payload: event });
    }
    /** Triggers an immediate flush for one provider, or all if omitted. */
    flush(provider) {
        this.#dispatch(provider !== undefined
            ? { directive: 'FLUSH', provider }
            : { directive: 'FLUSH' });
    }
    /** Signals the worker to stop, then terminates it after a drain window. */
    stop() {
        this.#dispatch({ directive: 'STOP' });
        setTimeout(() => {
            void this.#worker?.terminate?.();
            this.#worker = null;
            this.#ready = false;
            this.#pending = [];
        }, 500);
    }
    // --- private ---
    #ensureStarted() {
        if (this.#started)
            return;
        this.#started = true;
        if (this.#transport === 'web-worker') {
            this.#initBrowserWorker();
        }
        else if (this.#transport === 'node-worker') {
            void this.#initNodeWorker(); // async, non-blocking; events buffer until ready
        }
        else {
            this.#ready = true; // fetch is always ready
        }
    }
    #dispatch(msg) {
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
    async #sendFetch(provider, payload) {
        const cfg = this.#providers.get(provider);
        if (!cfg)
            return;
        try {
            await fetch(cfg.endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...(cfg.headers ?? {}) },
                body: JSON.stringify(payload),
                keepalive: true,
            });
        }
        catch {
            // Remote logging must never crash the application
        }
    }
    #initBrowserWorker() {
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const WorkerCtor = globalThis.Worker;
            const w = new WorkerCtor(new URL('./worker/browser.js', import.meta.url), { type: 'module' });
            w.onmessage = ({ data }) => this.#handleAck(data);
            w.onerror = ({ message }) => {
                console.error('[komodo-logger] browser worker error:', message);
                this.#degradeToFetch();
            };
            this.#worker = w;
            this.#markReady();
        }
        catch (err) {
            console.error('[komodo-logger] could not start browser worker:', err);
            this.#degradeToFetch();
        }
    }
    async #initNodeWorker() {
        try {
            // Dynamic import keeps worker_threads out of browser bundles
            const { Worker } = await import('worker_threads');
            const w = new Worker(new URL('./worker/node.js', import.meta.url));
            w.on('message', (data) => this.#handleAck(data));
            w.on('error', (err) => {
                console.error('[komodo-logger] node worker error:', err.message);
                this.#degradeToFetch();
            });
            this.#worker = {
                postMessage: (data) => { w.postMessage(data); },
                terminate: () => w.terminate(),
            };
            this.#markReady();
        }
        catch (err) {
            console.error('[komodo-logger] could not start node worker:', err);
            this.#degradeToFetch();
        }
    }
    #markReady() {
        this.#ready = true;
        const pending = this.#pending.splice(0);
        for (const msg of pending)
            this.#dispatch(msg);
    }
    #degradeToFetch() {
        this.#worker = null;
        this.#transport = 'fetch';
        this.#markReady(); // flush pending via fetch path
    }
    #handleAck(data) {
        switch (data.directive) {
            case 'ERROR':
                console.error('[komodo-logger] worker error:', data.payload);
                break;
            case 'STOP': {
                if (data.payload && typeof data.payload === 'object') {
                    const lost = data.payload.lost ?? {};
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
//# sourceMappingURL=handler.js.map