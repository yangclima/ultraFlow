import type { Config } from 'jest';
import nextJest from 'next/jest.js';

import dotenv from 'dotenv';

dotenv.config({ path: '.env.development', quiet: true });

const createJestConfig = nextJest({
  dir: './',
});

const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'node',
  testTimeout: 60000,
  testMatch: ['<rootDir>/src/tests/**/*.(test|spec).{js,jsx,ts,tsx}'],
};

export default createJestConfig(config);
