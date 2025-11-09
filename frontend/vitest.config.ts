import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['../tests/frontend/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/android/**'],
    testTimeout: 5000, // 5 second timeout per test
    hookTimeout: 5000, // 5 second timeout for hooks (beforeEach, afterEach, etc.)
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json'],
      reportsDirectory: '../tests/frontend/coverage',
      exclude: [
        'node_modules/',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
        'src/main.tsx',
        'vite.config.ts',
        'vitest.config.ts',
      ],
    },
  },
  server: {
    fs: {
      // Allow serving files from the tests directory (outside project root)
      allow: ['..'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});

