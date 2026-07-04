import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { resetRegistry } from '../common/worker/registry.js';
import ClickstreamLogger from './clickstream.js';
const BASE_CFG = {
    service: 'test-svc',
    version: '1.0.0',
    env: 'development',
    transport: 'fetch',
};
function resetAll() {
    resetRegistry();
    ClickstreamLogger._reset();
}
function stubBrowserEnv() {
    globalThis.window = {};
    globalThis.location = { href: 'https://app.example.com/shop' };
    globalThis.innerWidth = 1440;
    globalThis.innerHeight = 900;
}
function cleanBrowserEnv() {
    delete globalThis.window;
    delete globalThis.location;
    delete globalThis.innerWidth;
    delete globalThis.innerHeight;
}
// ===========================================================================
// UNIT TESTS — track() message construction logic
// ===========================================================================
describe('Unit Tests', () => {
    let spyDebug;
    beforeEach(() => {
        resetAll();
        stubBrowserEnv();
        spyDebug = vi.spyOn(console, 'debug').mockImplementation(() => { });
        vi.spyOn(console, 'warn').mockImplementation(() => { });
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }));
    });
    afterEach(() => {
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
        cleanBrowserEnv();
        resetAll();
    });
    describe('track()', () => {
        it('uses target.label as the event message when present', () => {
            const logger = new ClickstreamLogger(BASE_CFG);
            logger.track('click', { label: 'Add to Cart' });
            expect(spyDebug.mock.calls[0][0]).toContain('Add to Cart');
        });
        it('falls back to target.id when label is absent', () => {
            const logger = new ClickstreamLogger(BASE_CFG);
            logger.track('hover', { id: 'hero-banner' });
            expect(spyDebug.mock.calls[0][0]).toContain('hero-banner');
        });
        it('falls back to target.path when label and id are absent', () => {
            const logger = new ClickstreamLogger(BASE_CFG);
            logger.track('scroll', { path: 'div > ul > li' });
            expect(spyDebug.mock.calls[0][0]).toContain('div > ul > li');
        });
        it('uses "element" when target has no identifying field', () => {
            const logger = new ClickstreamLogger(BASE_CFG);
            logger.track('focus', {});
            expect(spyDebug.mock.calls[0][0]).toContain('element');
        });
        it('includes viewport when innerWidth and innerHeight are present', () => {
            const logger = new ClickstreamLogger(BASE_CFG);
            logger.track('click', { id: 'x' });
            expect(spyDebug.mock.calls[0][0]).toContain('1440x900');
        });
        it('omits viewport when window dimensions are absent', () => {
            delete globalThis.innerWidth;
            delete globalThis.innerHeight;
            const logger = new ClickstreamLogger(BASE_CFG);
            logger.track('click', { id: 'btn' });
            expect(spyDebug.mock.calls[0][0]).not.toContain('viewport');
        });
        it('accepts requestId without throwing', () => {
            const logger = new ClickstreamLogger(BASE_CFG);
            expect(() => logger.track('submit', { id: 'form' }, 'req-456')).not.toThrow();
        });
        it('url falls back to empty string when location has no href property', () => {
            // Override location to have no href — exercises the `?? ''` fallback
            globalThis.location = {};
            const logger = new ClickstreamLogger(BASE_CFG);
            expect(() => logger.track('click', { id: 'btn' })).not.toThrow();
            expect(spyDebug.mock.calls[0][0]).toBeDefined(); // still logs
        });
        it('accepts all supported action types', () => {
            const logger = new ClickstreamLogger(BASE_CFG);
            const actions = ['click', 'hover', 'scroll', 'submit', 'input', 'focus', 'blur'];
            for (const action of actions) {
                expect(() => logger.track(action, {})).not.toThrow();
            }
        });
    });
});
// ===========================================================================
// COMPONENT TESTS — class-level concerns (singleton, enabled/disabled, modes)
// ===========================================================================
describe('Component Tests', () => {
    afterEach(() => {
        vi.restoreAllMocks();
        cleanBrowserEnv();
        resetAll();
    });
    describe('ClickstreamLogger (Node — disabled)', () => {
        beforeEach(() => {
            resetAll();
            vi.spyOn(console, 'debug').mockImplementation(() => { });
            vi.spyOn(console, 'warn').mockImplementation(() => { });
        });
        it('constructs without throwing in a non-browser environment', () => {
            expect(() => new ClickstreamLogger(BASE_CFG)).not.toThrow();
        });
        it('track() is a no-op when window is absent', () => {
            const logger = new ClickstreamLogger(BASE_CFG);
            logger.track('click', { id: 'btn' });
            expect(vi.mocked(console.debug)).not.toHaveBeenCalled();
        });
        it('flush() and stop() do not throw', () => {
            const logger = new ClickstreamLogger(BASE_CFG);
            expect(() => {
                logger.flush();
                logger.stop();
            }).not.toThrow();
        });
        it('returns the same instance on repeated construction (singleton)', () => {
            const a = new ClickstreamLogger(BASE_CFG);
            const b = new ClickstreamLogger({ ...BASE_CFG, service: 'other' });
            expect(a).toBe(b);
        });
    });
    describe('ClickstreamLogger (browser — enabled)', () => {
        let spyDebug;
        beforeEach(() => {
            resetAll();
            stubBrowserEnv();
            spyDebug = vi.spyOn(console, 'debug').mockImplementation(() => { });
            vi.spyOn(console, 'warn').mockImplementation(() => { });
            vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }));
        });
        afterEach(() => {
            vi.unstubAllGlobals();
        });
        it('track() outputs [CLICKSTREAM] to console.debug in verbose (dev) env', () => {
            const logger = new ClickstreamLogger(BASE_CFG);
            logger.track('click', { id: 'buy-now' });
            expect(spyDebug).toHaveBeenCalledOnce();
            expect(spyDebug.mock.calls[0][0]).toContain('[CLICKSTREAM]');
        });
        it('production env: no console.debug output', () => {
            const logger = new ClickstreamLogger({ ...BASE_CFG, env: 'production' });
            logger.track('click', { id: 'x' });
            expect(spyDebug).not.toHaveBeenCalled();
        });
        it('_reset() causes the next constructor call to return a new instance', () => {
            const a = new ClickstreamLogger(BASE_CFG);
            ClickstreamLogger._reset();
            resetRegistry();
            const b = new ClickstreamLogger({ ...BASE_CFG, service: 'svc-b' });
            expect(a).not.toBe(b);
        });
    });
});
// ===========================================================================
// INTEGRATION TESTS — fetch transport pipeline (browser env)
// ===========================================================================
describe('Integration Tests', () => {
    let fetchMock;
    beforeEach(() => {
        fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200, statusText: 'OK' });
        vi.stubGlobal('fetch', fetchMock);
        vi.spyOn(console, 'debug').mockImplementation(() => { });
        vi.spyOn(console, 'warn').mockImplementation(() => { });
        vi.spyOn(console, 'error').mockImplementation(() => { });
        stubBrowserEnv();
        resetAll();
    });
    afterEach(() => {
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
        cleanBrowserEnv();
        resetAll();
    });
    describe('ClickstreamLogger', () => {
        it('uses default batchSize (20) when not specified', async () => {
            const logger = new ClickstreamLogger({
                ...BASE_CFG,
                endpoint: 'https://logs.example.com/clickstream',
                // no batchSize — exercises the `?? 20` default branch
            });
            logger.track('click', { id: 'btn' });
            await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
        });
        it('custom headers are forwarded on every request', async () => {
            const logger = new ClickstreamLogger({
                ...BASE_CFG,
                endpoint: 'https://logs.example.com/clickstream',
                batchSize: 1,
                headers: { 'X-Tenant': 'acme' },
            });
            logger.track('click', { id: 'buy-now' });
            await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
            const headers = fetchMock.mock.calls[0][1].headers;
            expect(headers['X-Tenant']).toBe('acme');
        });
        it('ships a clickstream event to the configured endpoint', async () => {
            const logger = new ClickstreamLogger({
                ...BASE_CFG,
                endpoint: 'https://logs.example.com/clickstream',
                batchSize: 1,
            });
            logger.track('click', { id: 'buy-now' });
            await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
            const [url, init] = fetchMock.mock.calls[0];
            expect(url).toBe('https://logs.example.com/clickstream');
            expect(init.method).toBe('POST');
            const payload = JSON.parse(init.body);
            expect(payload.type).toBe('clickstream');
        });
        it('does not ship events when no endpoint is configured', async () => {
            const logger = new ClickstreamLogger(BASE_CFG);
            logger.track('click', { id: 'btn' });
            await new Promise((r) => setTimeout(r, 30));
            expect(fetchMock).not.toHaveBeenCalled();
        });
        it('does not ship events in Node env (window absent)', async () => {
            cleanBrowserEnv(); // remove window
            ClickstreamLogger._reset();
            resetRegistry();
            const logger = new ClickstreamLogger({
                ...BASE_CFG,
                endpoint: 'https://logs.example.com/clickstream',
                batchSize: 1,
            });
            logger.track('click', { id: 'btn' });
            await new Promise((r) => setTimeout(r, 30));
            expect(fetchMock).not.toHaveBeenCalled();
        });
        describe('worker degradation', () => {
            afterEach(() => {
                delete globalThis.Worker;
            });
            it('internal onError handler calls console.warn when the browser worker degrades', () => {
                let capturedWorker = { onerror: null };
                class MockWorker {
                    onmessage = null;
                    onerror = null;
                    postMessage = vi.fn();
                    terminate = vi.fn();
                    constructor(_url, _opts) {
                        capturedWorker = this;
                    }
                }
                globalThis.Worker = MockWorker;
                stubBrowserEnv();
                new ClickstreamLogger({ service: 'test-svc', version: '1.0.0', env: 'development', transport: 'web-worker' });
                capturedWorker.onerror({ message: 'worker crashed' });
                expect(vi.mocked(console.warn)).toHaveBeenCalledWith('[ClickstreamLogger] worker degraded, falling back to fetch:', 'worker crashed');
            });
        });
    });
});
//# sourceMappingURL=clickstream.test.js.map