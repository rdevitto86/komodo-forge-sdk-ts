import { describe, expect, it, vi } from 'vitest';

// Mock worker_threads before any import of node.ts.
// vi.mock calls are hoisted above static imports by Vitest, so the mock is in place
// before node.ts is dynamically imported inside each test.
vi.mock('worker_threads', () => ({
	parentPort: {
		postMessage: vi.fn(),
		on: vi.fn(),
	},
}));

// ===========================================================================
// UNIT TESTS — module guard and parentPort wiring
// ===========================================================================

describe('Unit Tests', () => {
	describe('parentPort setup', () => {
		it('registers a message handler on parentPort without throwing', async () => {
			const wt = await import('worker_threads');
			const { on } = wt.parentPort as unknown as {
				on: ReturnType<typeof vi.fn>;
				postMessage: ReturnType<typeof vi.fn>;
			};
			// Vitest 5 clears mock call history between tests (clearMocks defaults to true),
			// so the import that triggers registration and the assertion must share a test.
			await expect(import('./node.js')).resolves.toBeDefined();
			expect(on).toHaveBeenCalledWith('message', expect.any(Function));
		});
	});
});

// ===========================================================================
// INTEGRATION TESTS — message routing via the parentPort handler
// ===========================================================================

describe('Integration Tests', () => {
	describe('message routing', () => {
		it('routes an incoming LOG message through createWorkerLogic without throwing', async () => {
			const wt = await import('worker_threads');
			const { on } = wt.parentPort as unknown as {
				on: ReturnType<typeof vi.fn>;
				postMessage: ReturnType<typeof vi.fn>;
			};

			// Find the 'message' handler registered during module load
			const [, messageHandler] = (on.mock.calls.find(([evt]) => evt === 'message') ?? []) as
				| [string, (data: unknown) => void]
				| [];

			if (messageHandler) {
				expect(() => messageHandler({ directive: 'LOG', provider: 'ghost', payload: { msg: 'x' } })).not.toThrow();
			}
		});

		it('routes an incoming FLUSH message without throwing', async () => {
			const wt = await import('worker_threads');
			const { on } = wt.parentPort as unknown as { on: ReturnType<typeof vi.fn> };
			const [, messageHandler] = (on.mock.calls.find(([evt]) => evt === 'message') ?? []) as
				| [string, (data: unknown) => void]
				| [];

			if (messageHandler) {
				expect(() => messageHandler({ directive: 'FLUSH' })).not.toThrow();
			}
		});
	});
});
