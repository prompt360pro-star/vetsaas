const parser = require('@typescript-eslint/parser');
const plugin = require('@typescript-eslint/eslint-plugin');

module.exports = [
  {
    files: ['src/**/*.ts', 'test/**/*.ts'],
    languageOptions: {
      parser,
      parserOptions: {
        project: ['./tsconfig.json', './test/tsconfig.e2e.json'],
        tsconfigRootDir: __dirname,
      },
    },
    plugins: {
      '@typescript-eslint': plugin,
    },
    rules: {
      ...plugin.configs.recommended.rules,
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-namespace': 'off',
    },
  },
];
