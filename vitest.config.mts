import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import TreeSpacingReporter from './src/tests/reporter';
import path from 'path';

import dotenv from 'dotenv';

dotenv.config({ path: '.env.development', quiet: true });

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    testTimeout: 30000,
    reporters: [new TreeSpacingReporter()],
    environment: 'jsdom',
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    alias: {
      '@': path.join(process.cwd(), 'src'),
    },
  },
});
