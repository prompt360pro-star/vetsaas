const eslintPlugin = require('@typescript-eslint/eslint-plugin');
const eslintParser = require('@typescript-eslint/parser');

module.exports = [
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: eslintParser,
      parserOptions: {
        project: 'tsconfig.json',
        tsconfigRootDir: __dirname,
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': eslintPlugin,
    },
    rules: {
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  {
    files: ['test/**/*.ts'],
    languageOptions: {
      parser: eslintParser,
      parserOptions: {
        project: null, // Disable project-based linting for test files if they aren't in tsconfig
        tsconfigRootDir: __dirname,
        sourceType: 'module',
      },
    },
  }
];
