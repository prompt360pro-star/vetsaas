const eslintPluginPrettierRecommended = require("eslint-plugin-prettier/recommended");
const tsEslint = require("typescript-eslint");
const eslint = require("@eslint/js");

module.exports = tsEslint.config(
  eslint.configs.recommended,
  ...tsEslint.configs.recommended,
  eslintPluginPrettierRecommended,
  {
    ignores: ["eslint.config.js", "test/**/*.ts"],
    languageOptions: {
      parser: tsEslint.parser,
      parserOptions: {
        project: ["tsconfig.json"],
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      "@typescript-eslint/interface-name-prefix": "off",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-namespace": "off"
    },
  }
);
