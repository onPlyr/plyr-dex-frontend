const nextPlugin = require('@next/eslint-plugin-next');
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');
const reactHooksPlugin = require('eslint-plugin-react-hooks');

module.exports = [
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'public/**',
      '*.config.js',
      '*.config.ts'
    ],
    plugins: {
      '@typescript-eslint': tsPlugin,
      'next': nextPlugin,
      'react-hooks': reactHooksPlugin,
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.json',
      },
    },
    rules: {
      // TypeScript specific rules
      '@typescript-eslint/no-unused-vars': ['warn', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }],
      '@typescript-eslint/no-explicit-any': 'warn',
      
      // React and Next.js rules
      'react-hooks/exhaustive-deps': ['warn', {
        enableDangerousAutofixThisMayCauseInfiniteLoops: false,
      }],
      'next/no-html-link-for-pages': 'error',
      
      // General rules
      'no-console': 'off',
      'no-unused-vars': 'off', // Using TypeScript's version instead
    },
  },
]; 