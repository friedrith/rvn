module.exports = {
  extends: [
    'prettier',
    'eslint:recommended',
    'plugin:node/recommended',
    'plugin:jest/recommended',
  ],
  plugins: ['jest'],
  parserOptions: {
    ecmaVersion: 8,
    sourceType: 'module',
    allowImportExportEverywhere: true,
  },
  rules: {
    'node/no-unsupported-features/es-syntax': 'off',
    'node/no-unpublished-require': 'off',
    'no-extra-parens': [2, 'all'],
  },
}
