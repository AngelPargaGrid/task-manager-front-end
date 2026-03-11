/**
 * Lighthouse configuration for performance, accessibility, best practices, SEO
 * Run: npx lighthouse http://localhost:5173 --config-path=qa-automation/performance/lighthouse.config.js --output=html --output-path=qa-automation/reports/output/lighthouse.html
 */
export default {
  ci: {
    collect: {
      url: ['http://localhost:5173'],
      numberOfRuns: 3,
      settings: {
        preset: 'desktop',
        throttling: {
          rttMs: 40,
          throughputKbps: 10240,
          cpuSlowdownMultiplier: 1,
        },
      },
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.7 }],
        'categories:accessibility': ['warn', { minScore: 0.8 }],
        'categories:best-practices': ['warn', { minScore: 0.8 }],
        'categories:seo': ['warn', { minScore: 0.8 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
