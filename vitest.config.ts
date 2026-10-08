import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node', // We'll test core purely in node. UI tests in browser via playwright
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        lines: 90,
        branches: 70,
        functions: 90,
        statements: 90,
      },
      exclude: [
        'src/ui/**',
        'tests/e2e/**',
        'src/worker/**',
        'src/main.ts',
        '*.config.ts',
        'eslint.config.js',
      ], // Core logic only
    },
    exclude: ['tests/e2e/**', 'node_modules/**'],
  },
});
