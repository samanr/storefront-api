const tsPlugin = require('@typescript-eslint/eslint-plugin');
  const tsParser = require('@typescript-eslint/parser');
  
  module.exports = [
    {
      ignores: ['migrations/**', 'node_modules/**'],
    },
    {
      files: ['src/**/*.ts'],
      languageOptions: {
        parser: tsParser,
      },
      plugins: {
        '@typescript-eslint': tsPlugin,
      },
      rules: {
        ...tsPlugin.configs.recommended.rules,
        '@typescript-eslint/no-explicit-any': 'warn',
      },
    },
  ];