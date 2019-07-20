module.exports = {
  root: true,

  env: {
    node: true,
  },

  extends: [
    'plugin:@typescript-eslint/recommended',
    'prettier/@typescript-eslint',
    'plugin:prettier/recommended',
  ],

  rules: {
    'no-console': [
      'warn',
      {
        allow: ['warn', 'error'],
      },
    ],
    'no-debugger': 'off',
    'no-var': 'error',
    'prettier/prettier': 'warn',
    'prefer-const': [
      'error',
      {
        destructuring: 'any',
        ignoreReadBeforeAssign: false,
      },
    ],
    'linebreak-style': ['error', 'windows'],
    '@typescript-eslint/explicit-function-return-type': [0],
    '@typescript-eslint/explicit-member-accessibility': [
      2,
      { accessibility: 'no-public' },
    ],
    '@typescript-eslint/no-explicit-any': 0,
  },

  parser: '@typescript-eslint/parser',

  parserOptions: {
    ecmaVersion: 2018, // Allows for the parsing of modern ECMAScript features
    sourceType: 'module', // Allows for the use of imports
  },
}
