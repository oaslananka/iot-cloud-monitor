const js = require('@eslint/js');
const globals = require('globals');

module.exports = [
  {
    ignores: ['node_modules/**', 'coverage/**', 'dist/**', 'build/**', '.cache/**']
  },
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
        ...globals.mocha
      }
    },
    rules: {
      'no-console': ['error', { allow: ['warn', 'error'] }]
    }
  }
];
