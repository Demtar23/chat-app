module.exports = {
  root: true,

  env: {
    es2021: true,
    node: true,
  },

  parser: '@typescript-eslint/parser',

  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },

  plugins: ['@typescript-eslint'],

  extends: [
    '@mate-academy/eslint-config',
    'prettier',
  ],

  rules: {
    'no-proto': 0,
  },

  overrides: [
    {
      files: ['client/**/*'],
      env: {
        browser: true,
      },
    },
  ],
};