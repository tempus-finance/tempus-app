module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true,
    jest: true,
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx', '**/*.stories.*'],
      parserOptions: {
        project: ['./tsconfig.json'],
      },
    },
  ],
  parser: '@typescript-eslint/parser',
  extends: [
    'plugin:react/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
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
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  plugins: ['react-hooks'],
  rules: {
    // Verified rules
    'arrow-parens': ['error', 'as-needed'], // Set to match with prettier config
    'max-len': ['error', { code: 120, ignoreStrings: true }], // Set to match with prettier config
    'object-curly-newline': ['error', { consistent: true }], // Set to match with prettier config
    'implicit-arrow-linebreak': 0, // This rule is disabled because it does not work well with prettier
    'no-confusing-arrow': 0, // This rule is disabled because it does not work well with prettier
    'function-paren-newline': 0, // This rule is disabled because it does not work well with prettier
    'operator-linebreak': 0, // This rule is disabled because it does not work well with prettier
    'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
    'no-console': 0, // We are using console to log current app version and client errors
    ////

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
    'react/react-in-jsx-scope': 0,
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
    '@typescript-eslint/indent': 0,
    '@typescript-eslint/no-var-requires': 0,
    'import/no-anonymous-default-export': 0,
    'import/no-extraneous-dependencies': 0,
    'import/no-useless-path-segments': 0,
    'import/prefer-default-export': 0,
    'jsx-a11y/anchor-is-valid': 0,
    'jsx-a11y/click-events-have-key-events': 0,
    'jsx-a11y/no-static-element-interactions': 0,
    'jsx-a11y/no-noninteractive-tabindex': 0,
    'no-restricted-properties': [
      'error',
      {
        property: 'parseEther',
        message: 'Please use parseUnits instead.',
      },
      {
        property: 'formatEther',
        message: 'Please use formatUnits instead.',
      },
    ],
  },
};
