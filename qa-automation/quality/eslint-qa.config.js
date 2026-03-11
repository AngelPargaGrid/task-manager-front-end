/**
 * QA-specific ESLint config with complexity rules.
 * Run: npx eslint . --config qa-automation/quality/eslint-qa.config.js
 */
import baseConfig from '../../eslint.config.js';

export default [
  ...baseConfig,
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      complexity: ['warn', { max: 10 }],
      'max-depth': ['warn', 4],
      'max-lines-per-function': ['warn', { max: 100, skipBlankLines: true, skipComments: true }],
    },
  },
];
