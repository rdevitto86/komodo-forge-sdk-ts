import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: [
      'src/logging/**/*.test.ts',
      'src/aws/cdk/**/*.test.ts',
    ],
    exclude: [
      'src/logging/logging.test.ts',
    ],
    environment: 'node',
    coverage: {
      provider: 'v8',
      include: [
        'src/logging/**/*.ts',
        'src/aws/cdk/**/*.ts',
      ],
      exclude: [
        'src/**/*.test.ts',
        'src/logging/common/worker/browser/browser.ts',
        'src/logging/common/worker/node/node.ts',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
});
