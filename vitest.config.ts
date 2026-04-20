import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include:     ['src/shared/logging/**/*.test.ts'],
    exclude:     ['src/shared/logging/logging.test.ts'],
    environment: 'node',
    coverage: {
      provider: 'v8',
      include:  ['src/shared/logging/**/*.ts'],
      exclude: [
        'src/shared/logging/**/*.test.ts',
        // Worker entry scripts are thin wires (createWorkerLogic + port wiring);
        // the logic itself is covered via createWorkerLogic unit tests.
        'src/shared/logging/common/worker/browser/browser.ts',
        'src/shared/logging/common/worker/node/node.ts',
      ],
      thresholds: {
        lines:      90,
        functions:  90,
        branches:   90,
        statements: 90,
      },
    },
  },
});
