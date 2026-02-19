import { defineConfig, globalIgnores } from 'eslint/config';
import js from '@eslint/js';
import jest from 'eslint-plugin-jest';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import prettier from 'eslint-config-prettier/flat';

const eslintConfig = defineConfig([
  {
    files: ['src/tests/**/*.{ts,tsx, js, jsx}'],
    ...jest.configs['flat/recommended'],
  },
  {
    files: ['**/*.js'],
    ignores: ['src/tests/**/*.js'],
    plugins: {
      js,
    },
    extends: ['js/recommended'],
    rules: {
      'no-unused-vars': 'warn',
    },
  },
  ...nextVitals,
  ...nextTs,
  prettier,
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),
]);

export default eslintConfig;
