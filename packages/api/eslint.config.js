module.exports = [
  {
    ignores: ['dist/*', 'node_modules/*'],
  },
  {
      files: ['**/*.ts'],
      languageOptions: {
          parser: require('@typescript-eslint/parser'),
      },
      plugins: {
          '@typescript-eslint': require('@typescript-eslint/eslint-plugin'),
      },
      rules: {
         '@typescript-eslint/interface-name-prefix': 'off',
         '@typescript-eslint/explicit-function-return-type': 'off',
         '@typescript-eslint/explicit-module-boundary-types': 'off',
         '@typescript-eslint/no-explicit-any': 'off',
         'no-unused-vars': 'off',
         '@typescript-eslint/no-unused-vars': 'off',
      }
  }
];
