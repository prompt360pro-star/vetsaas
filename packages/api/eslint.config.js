const eslintPlugin = require('@typescript-eslint/eslint-plugin');
const eslintParser = require('@typescript-eslint/parser');
const eslintConfigPrettier = require('eslint-config-prettier');

module.exports = [
  {
    ignores: ['eslint.config.js'],
  },
  {
    files: ['src/**/*.ts', 'test/**/*.ts'],
    languageOptions: {
      parser: eslintParser,
      parserOptions: {
        project: 'tsconfig.json',
        tsconfigRootDir: __dirname,
        sourceType: 'module',
      },
      globals: {
        node: true,
        jest: true,
      },
    },
    plugins: {
      '@typescript-eslint': eslintPlugin,
    },
    rules: {
      ...eslintPlugin.configs.recommended.rules,
      ...eslintConfigPrettier.rules,
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-namespace': 'off',
    },
  },
  // Special configuration for test files which might not be in the main tsconfig
  {
      files: ['test/**/*.ts'],
      languageOptions: {
        parserOptions: {
            project: null, // Disable project-based linting for e2e tests to avoid tsconfig mismatch
        }
      }
  }
];
