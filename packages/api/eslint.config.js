const eslintPluginTypeScript = require('@typescript-eslint/eslint-plugin');
const eslintParserTypeScript = require('@typescript-eslint/parser');

module.exports = [
  {
    files: ['src/**/*.ts', 'test/**/*.ts'],
    languageOptions: {
      parser: eslintParserTypeScript,
      parserOptions: {
        project: false,
        tsconfigRootDir: __dirname,
      },
    },
    plugins: {
      '@typescript-eslint': eslintPluginTypeScript,
    },
    rules: {
      // Add custom rules if needed
    },
  }
];
