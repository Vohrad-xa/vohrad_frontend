const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['node_modules/**', 'dist/**', 'web-build/**', 'ios/**', 'android/**', '.expo/**'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    rules: {
      // General code-quality
      curly: ['error', 'all'],
      eqeqeq: ['error', 'smart'],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-multiple-empty-lines': ['warn', { max: 1, maxEOF: 0, maxBOF: 0 }],

      // React & Hooks
      'react/jsx-boolean-value': ['warn', 'never'],
      'react-hooks/exhaustive-deps': 'warn',

      // TypeScript
      '@typescript-eslint/consistent-type-imports': [
        'warn',
        { prefer: 'type-imports', disallowTypeAnnotations: false },
      ],
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },
]);
