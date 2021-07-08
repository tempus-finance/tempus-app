let confusingBrowserGlobals = require('confusing-browser-globals');

module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true,
    jest: true,
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      parserOptions: {
        project: ['./tsconfig.json'],
      },
    },
  ],
  parser: '@typescript-eslint/parser',
  extends: [
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:@typescript-eslint/recommended',
    'airbnb-typescript',
  ],
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
    plugins: ['react-hooks'],
    rules: {
      'arrow-parens': 0,
      'comma-spacing': 0,
      'comma-dangle': 0,
      'default-case': 0,
      'implicit-arrow-linebreak': 0,
      'lines-between-class-members': 0,
      'max-len': ['error', { code: 140 }],
      'no-confusing-arrow': 0,
      'no-spaced-func': 0,
      'no-nested-ternary': 0,
      'no-restricted-globals': [
        'error',
        {
          name: 'isFinite',
          message: 'Do not use isFinite. Use Number.isFinite',
        },
        {
          name: 'isNaN',
          message: 'Do not use isNaN. Use Number.isNaN',
        },
        {
          name: 'document',
          message: 'Do not use document. Use ownerDocument of the current element via Ref current.ownerDocument',
        },
      ].concat[confusingBrowserGlobals],
      'no-empty-patterns': 0,
      'no-plusplus': 0,
      'object-curly-newline': 0,
      'operator-linebreak': 0,
      'padded-blocks': 0,
      'react/button-has-type': 0,
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',
      'react/prop-types': 0,
      'react/destructuring-assignment': 0,
      'react/no-access-state-in-setstate': 0,
      'react/no-array-index-key': 0,
      'react/jsx-wrap-multilines': 0,
      'react/jsx-boolean-values': 0,
      'react/jsx-props-no-spreading': 0,
      'react/jsx-one-expression-per-line': 0,
      'react/require-default-props': 0,
      'react/static-property-placement': 0,
      'react/sort-comp': [
        'error',
        {
          order: [
            'static-variables',
            'static-methods',
            'constructor',
            'instance-variables',
            'lifecycle',
            'render',
            'everything-else',
          ],
        },
      ],
      '@typescript-eslint/no-explicit-any': 0,
      '@typescript-eslint/no-use-before-define': 0,
      '@typescript-eslint/explicit-function-return-type': 0,
      'import/no-extraneous-dependencies': 0,
      'import/no-useless-path-segments': 0,
      'import/prefer-default-exports': 0,
      'jsx-a11y/anchor-is-valid': 0,
      'jsx-a11y/click-events-have-key-events': 0,
      'jsz-a11y/no-static-element-interactions': 0,
      'jsx-a11y/no-noninteractive-tabindex': 0,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
};
