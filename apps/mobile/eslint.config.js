const {defineConfig} = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const prettierConfig = require('eslint-config-prettier');
const typescriptPlugin = require('@typescript-eslint/eslint-plugin');
const typescriptParser = require('@typescript-eslint/parser');

module.exports = defineConfig([
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'web-build/**',
      'ios/**',
      'android/**',
      '.expo/**',
      '_expo/**',
      '**/*.js',
      '**/*.jsx',
      'docs/**',
      'modules/sykamore-ui/**',
    ],
  },
  ...expoConfig.map((config) => ({
    ...config,
    files: ['**/*.{ts,tsx}'],
  })),
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        project: './tsconfig.json',
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': typescriptPlugin,
    },
    rules: {
      curly: ['error', 'all'],
      eqeqeq: ['error', 'smart'],
      'no-var': 'error',
      'prefer-const': 'error',
      'prefer-arrow-callback': 'error',
      'object-shorthand': ['error', 'always'],
      'no-duplicate-imports': 'off',

      'no-console': ['warn', {allow: ['warn', 'error']}],

      'react/jsx-boolean-value': ['warn', 'never'],
      'react/jsx-curly-brace-presence': [
        'error',
        {props: 'never', children: 'never'},
      ],
      'react/self-closing-comp': ['error', {component: true, html: true}],
      'react-hooks/exhaustive-deps': 'warn',

      '@typescript-eslint/consistent-type-imports': [
        'error',
        {prefer: 'type-imports', disallowTypeAnnotations: false},
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',
      '@typescript-eslint/array-type': ['error', {default: 'array-simple'}],

      'import/no-duplicates': 'error',
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
            'object',
            'type',
          ],
          pathGroups: [
            {
              pattern: '{react,react-native}',
              group: 'external',
              position: 'before',
            },
            {
              pattern: '@/**',
              group: 'internal',
            },
          ],
          pathGroupsExcludedImportTypes: ['react'],
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
      'import/no-unresolved': 'off',
      'import/named': 'off',
    },
    settings: {
      'import/parsers': {
        '@typescript-eslint/parser': ['.ts', '.tsx'],
      },
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json',
        },
      },
    },
  },
  prettierConfig,
]);
