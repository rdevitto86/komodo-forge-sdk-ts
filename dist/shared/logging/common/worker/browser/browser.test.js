import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
// Both describe blocks share this module cache slot.
// `import('./browser.js')` is a no-op on the second call — the side effects
// (setting globalThis.onmessage) happened on the first.
async function loadBrowser() {
    vi.stubGlobal('postMessage', vi.fn());
    await import('./browser.js');
    // postMessage is intentionally left stubbed until afterAll cleans up
}
// ===========================================================================
// UNIT TESTS — module side-effects on load
// ===========================================================================
describe('Unit Tests', () => {
    describe('browser worker setup', () => {
        beforeAll(loadBrowser);
        afterAll(() => vi.unstubAllGlobals());
        it('sets globalThis.onmessage to a function after loading', () => {
            expect(typeof globalThis.onmessage).toBe('function');
        });
    });
});
// ===========================================================================
// INTEGRATION TESTS — message routing through onmessage
// ===========================================================================
describe('Integration Tests', () => {
    describe('message routing', () => {
        beforeAll(loadBrowser); // idempotent — module is already cached
        afterAll(() => vi.unstubAllGlobals());
        it('dispatches an incoming CONFIG message without throwing', () => {
            const onmessage = globalThis.onmessage;
            expect(onmessage).toBeDefined();
            if (onmessage) {
                expect(() => onmessage({
                    data: {
                        directive: 'CONFIG',
                        provider: 'runtime',
                        payload: { endpoint: 'https://logs.test/rt', headers: {}, batchSize: 10, flushInterval: 0 },
                    },
                })).not.toThrow();
            }
        });
        it('dispatches an incoming LOG message without throwing', () => {
            const onmessage = globalThis.onmessage;
            if (onmessage) {
                expect(() => onmessage({ data: { directive: 'LOG', provider: 'ghost', payload: { msg: 'x' } } })).not.toThrow();
            }
        });
    });
});
//# sourceMappingURL=browser.test.js.map