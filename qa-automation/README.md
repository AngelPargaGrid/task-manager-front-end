# QA Automation Framework

Complete QA automation system for the full-stack application (React + Flask).

## Structure

```
qa-automation/
├── tests/
│   ├── unit/           # Unit tests (Vitest + pytest)
│   ├── integration/    # Integration test references
│   ├── e2e/            # E2E references (Playwright in tests/)
│   └── performance/    # k6, Lighthouse
├── quality/
│   ├── eslint.config.js
│   ├── pylint.rc
│   └── sonar-project.properties
├── security/
│   ├── zap-config.yaml
│   ├── .snyk
│   └── security-scan.sh
├── performance/
│   ├── lighthouse.config.js
│   ├── k6-load-test.js
│   └── performance-thresholds.json
├── reports/
│   ├── generate-report.py
│   ├── dashboard.html
│   └── output/
└── scripts/
    ├── run-all-qa.sh
    └── analyze-results.py
```

## Quick Start

```bash
# Run full QA pipeline
npm run qa
# or
./qa-automation/scripts/run-all-qa.sh

# Unit tests only
npm run test:unit          # Frontend (Vitest)
pytest api/tests/ -v       # Backend (pytest)

# E2E (requires dev server)
npm run test               # Playwright

# Quality
npm run lint               # ESLint
pylint --rcfile=qa-automation/quality/pylint.rc api/app

# Security
./qa-automation/security/security-scan.sh
ZAP_TARGET_URL=http://localhost:5173 ./qa-automation/security/security-scan.sh  # with ZAP

# Performance (start app first)
npx lighthouse http://localhost:5173 --config-path=qa-automation/performance/lighthouse.config.js
k6 run qa-automation/performance/k6-load-test.js

# Reports
npm run qa:report          # Generate JSON report
npm run qa:analyze         # AI improvement recommendations
open qa-automation/reports/dashboard.html  # Dashboard
```

## Tools

| Tool | Purpose |
|------|---------|
| **Vitest** | Frontend unit tests |
| **pytest** | Backend unit/integration tests |
| **Playwright** | E2E tests |
| **ESLint** | JavaScript/TypeScript linting |
| **Pylint** | Python linting |
| **OWASP ZAP** | Security scanning (requires Docker) |
| **Snyk** | Dependency vulnerabilities |
| **Lighthouse** | Performance, accessibility, SEO |
| **k6** | Load testing |

## Prerequisites

- Node.js 20+
- Python 3.12+
- (Optional) Docker for OWASP ZAP
- (Optional) `snyk` CLI for Snyk scans
- (Optional) `k6` for load tests
