# QA Suite Documentation

Complete guide for running and maintaining the QA automation system.

## Overview

The QA suite provides:

- **Test automation** with Page Object Model (POM) for E2E tests
- **Code quality** checks (ESLint, Pylint, complexity)
- **Security scanning** (OWASP ZAP, Snyk, npm audit, pip-audit)
- **Performance testing** (k6 load tests)
- **Quality dashboard** with metrics visualization
- **Automated report generation**

## Quality Metrics & Targets

| Metric | Target | Tool |
|--------|--------|------|
| **Test coverage** | 80%+ | pytest --cov, Vitest |
| **Code complexity** | <10 | radon, ESLint complexity rule |
| **Security vulnerabilities** | 0 critical | npm audit, pip-audit, Snyk |
| **Response time** | <500ms (p95) | k6 |
| **Error rate** | <1% | k6 |

---

## Master Execution Script

Run all checks with one command:

```bash
./qa-automation/scripts/run-all-qa.sh
```

Or from package.json:

```bash
npm run qa
```

### What It Runs

1. **ESLint** — Frontend linting
2. **ESLint QA** — Complexity rules (max 10)
3. **Pylint** — Backend linting (max-complexity=10)
4. **Radon** — Python cyclomatic complexity
5. **Pytest** — Backend tests + coverage
6. **Vitest** — Frontend unit tests
7. **Security scan** — npm audit, pip-audit, Snyk, ZAP (optional)
8. **k6** — Performance load test (optional, requires running app)
9. **Report generation** — Aggregates results → dashboard

---

## Page Object Model (POM)

E2E tests use the Page Object Model for maintainability.

### Structure

```
qa-automation/tests/e2e/pages/
├── BasePage.ts      # Base class with common methods
├── LoginPage.ts
├── RegisterPage.ts
├── DashboardPage.ts
├── SettingsPage.ts
└── index.ts         # Exports
```

### Usage

```typescript
import { DashboardPage, SettingsPage } from '../qa-automation/tests/e2e/pages';

test('navigate to settings', async ({ page }) => {
  const dashboard = new DashboardPage(page);
  await dashboard.goto();
  await dashboard.settingsLink.click();
  const settings = new SettingsPage(page);
  await expect(settings.heading).toBeVisible();
});
```

### Running POM Tests

```bash
npx playwright test dashboard-pom
npx playwright test --project=chromium
```

---

## Individual Check Commands

### Linting

```bash
# Frontend (ESLint)
npm run lint

# Frontend with complexity rules
npx eslint src --config qa-automation/quality/eslint-qa.config.js

# Backend (Pylint)
pylint --rcfile=qa-automation/quality/pylint.rc api/app
```

### Complexity

```bash
./qa-automation/quality/check-complexity.sh

# Or manually:
radon cc api/app -s -n C   # Show functions with complexity > C
radon cc api/app -s -j     # JSON output
```

### Tests

```bash
# Backend (pytest)
pytest api/tests/ -m "not performance" -v --cov=app --cov-report=html

# Frontend unit (Vitest)
npm run test:unit

# E2E (Playwright)
npm run test
npx playwright test dashboard-pom
```

### Security

```bash
./qa-automation/security/security-scan.sh

# With OWASP ZAP (app must be running):
ZAP_TARGET_URL=http://localhost:5173 ./qa-automation/security/security-scan.sh
```

### Performance

```bash
# k6 (start API + frontend first)
k6 run qa-automation/performance/k6-load-test.js

# Shorter run for CI
k6 run --duration=10s --vus=5 qa-automation/performance/k6-load-test.js
```

---

## Reports & Dashboard

### Generate Report

```bash
python3 qa-automation/reports/generate-report.py
```

### View Dashboard

Open `qa-automation/reports/dashboard.html` in a browser:

```bash
open qa-automation/reports/dashboard.html
# or
xdg-open qa-automation/reports/dashboard.html
```

### Output Location

All reports are written to `qa-automation/reports/output/`:

| File | Contents |
|------|----------|
| `qa-report.json` | Aggregated metrics for dashboard |
| `pytest.log` | Backend test output |
| `coverage.log` | Coverage output |
| `radon-complexity.json` | Python complexity |
| `npm-audit.json` | npm vulnerability data |
| `eslint.log` | ESLint output |

---

## Prerequisites

### Required

- Node.js 20+
- Python 3.12+
- npm dependencies: `npm install`

### Optional (for full suite)

- **pylint** — `pip install pylint`
- **radon** — `pip install radon`
- **pip-audit** — `pip install pip-audit`
- **k6** — [k6.io installation](https://k6.io/docs/getting-started/installation/)
- **Docker** — For OWASP ZAP
- **Snyk CLI** — `npm i -g snyk`

---

## CI Integration

Add to GitHub Actions or similar:

```yaml
- run: ./qa-automation/scripts/run-all-qa.sh
- uses: actions/upload-artifact@v4
  with:
    name: qa-reports
    path: qa-automation/reports/output/
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Pylint not found | `pip install pylint` |
| Radon not found | `pip install radon` |
| k6 not found | Install from k6.io |
| Dashboard shows "No report" | Run `./qa-automation/scripts/run-all-qa.sh` first |
| ESLint QA config error | Ensure project root has `eslint.config.js` |
| Playwright POM tests fail | Start dev server: `npm run dev` |
