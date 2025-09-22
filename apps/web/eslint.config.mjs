import {dirname} from 'path';
import {fileURLToPath} from 'url';
import {FlatCompat} from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    ignores: ['node_modules/**', '.next/**', 'out/**', 'build/**', 'next-env.d.ts', '**/*.js', '**/*.jsx'],
    rules: {
      curly: ['error', 'all'],
      eqeqeq: ['error', 'smart'],
      'no-console': ['warn', {allow: ['warn', 'error']}],
      'no-multiple-empty-lines': ['warn', {max: 1, maxEOF: 0, maxBOF: 0}],
      'no-trailing-spaces': 'error',
      'no-var': 'error',
      'prefer-const': 'error',
      'prefer-arrow-callback': 'error',
      'object-shorthand': ['error', 'always'],
      'no-duplicate-imports': 'error',

      'react/jsx-boolean-value': ['warn', 'never'],
      'react/jsx-curly-brace-presence': ['error', {props: 'never', children: 'never'}],
      'react/self-closing-comp': ['error', {component: true, html: true}],
      'react-hooks/exhaustive-deps': 'warn',

      '@typescript-eslint/consistent-type-imports': ['error', {prefer: 'type-imports', disallowTypeAnnotations: false}],
      '@typescript-eslint/no-unused-vars': ['error', {argsIgnorePattern: '^_', varsIgnorePattern: '^_'}],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',
      '@typescript-eslint/array-type': ['error', {default: 'array-simple'}],
    },
  },
];

export default eslintConfig;
