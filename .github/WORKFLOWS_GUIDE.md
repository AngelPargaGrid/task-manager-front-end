# GitHub Actions Workflows Guide

Guide to the CI/CD pipelines for this full-stack application (React frontend, Flask backend).

## Overview

| Item | Details |
|------|---------|
| **Workflow file** | `.github/workflows/ci.yml` |
| **Triggers** | Push / PR to `main` or `master`; manual `workflow_dispatch` |
| **Concurrency** | Cancels in-progress runs for the same branch |

## Pipeline Flow

```
                    ┌─────────────────┐
                    │ build-frontend  │
                    │ build-backend   │
                    └────────┬────────┘
                             │
     ┌───────────────────────┼───────────────────────┐
     │                       │                       │
     ▼                       ▼                       ▼
┌──────────┐          ┌──────────────┐         ┌─────────────┐
│ security │          │ test-frontend│         │test-backend │
│ -sast-*  │          │ -lint        │         │ -pytest     │
│ -deps    │          │ -playwright  │         │             │
└──────────┘          └──────┬───────┘         └──────┬──────┘
                             │                       │
                             └───────────┬───────────┘
                                         │
                                         ▼
                                 ┌───────────────┐
                                 │test-performance│
                                 └───────┬───────┘
                                         │
     (main/master only)                  ▼
                                 ┌───────────────┐
                                 │    deploy     │──► rollback (on failure)
                                 └───────────────┘
```

## Job Reference

| Job | Depends On | Purpose |
|-----|------------|---------|
| `build-frontend` | — | Build React app, upload `dist/` artifact |
| `build-backend` | — | Verify Flask app loads |
| `security-sast-js` | — | CodeQL SAST for JavaScript/TypeScript |
| `security-sast-python` | — | CodeQL SAST for Python |
| `security-dependencies` | — | npm audit + pip-audit |
| `test-frontend` | build-frontend | ESLint + Playwright E2E |
| `test-backend` | build-backend | Pytest (excludes performance) |
| `test-performance` | build-backend, test-backend | Pytest performance benchmarks |
| `deploy` | build-*, test-* | Blue-green deploy (main/master only) |
| `rollback` | deploy | Restore previous version on deploy failure |

## Prerequisites

- **`production` environment** — Create in **Settings → Environments** if using deployment protection.
- **`MONITORING_WEBHOOK`** (optional) — GitHub secret with webhook URL for deployment notifications.

---

## Bottleneck Analysis & Optimizations Applied

### 1. Dependency Installation (Previously: ~60–90s per job)

**Bottleneck:** Repeated `npm ci` and `pip install` across jobs with no cache.

**Optimizations:**
- **npm:** `actions/setup-node` with `cache: 'npm'` and `cache-dependency-path: package-lock.json` — cache invalidates only when lockfile changes.
- **pip:** `actions/setup-python` with `cache: 'pip'` and `cache-dependency-path: api/requirements.txt`.
- **Playwright:** Cache `~/.cache/ms-playwright` with key from `package-lock.json` hash — saves ~200MB download per run.

**Expected savings:** 40–70% reduction in install time on cache hits.

---

### 2. Test Execution (Previously: Sequential, Single Thread)

**Bottleneck:** Backend tests ran sequentially; frontend tests used one worker.

**Optimizations:**
- **Backend:** `pytest-xdist -n auto --dist loadscope` — parallelizes tests across CPU cores (loadscope keeps fixtures together).
- **Frontend:** `--workers=2` for Playwright — parallel test files.
- **Job-level parallelism:** `test-frontend` and `test-backend` run concurrently (no cross-dependency).
- **Security jobs:** SAST and dependency scan run alongside build (no blocking).

**Expected savings:** 50–70% faster test stage.

---

### 3. Build Artifacts (Previously: Rebuild in Deploy)

**Bottleneck:** Deploy job ran `npm ci && npm run build` again.

**Optimizations:**
- **Upload artifact:** Build job uploads `dist/` via `actions/upload-artifact@v4`.
- **Download in deploy:** Deploy downloads the artifact instead of rebuilding.
- **Retention:** 1 day for deploy-only artifacts.

**Expected savings:** ~2–3 minutes per deployment.

---

### 4. Concurrency & Cancellation

**Bottleneck:** Pushed commits triggered overlapping workflows.

**Optimizations:**
- `concurrency: group: ci-${{ github.ref }}` with `cancel-in-progress: true` — newest run cancels in-progress runs for the same branch.

**Expected savings:** Reduces wasted compute on rapid pushes.

---

## Customizing Deployment

The deploy job downloads the frontend build to `./frontend-dist/`. Replace the placeholder steps in `ci.yml` with your platform's deploy commands (Vercel, Railway, Render, etc.). Uncomment and set the health-check curl URL.

---

## Security Enhancements

| Tool | Job | Purpose |
|------|-----|---------|
| **CodeQL** | security-sast-js, security-sast-python | SAST for JS/TS and Python |
| **npm audit** | security-dependencies | Known vulnerabilities in npm deps |
| **pip-audit** | security-dependencies | Known vulnerabilities in Python packages |

**Note:** CodeQL requires GitHub Advanced Security for private repos; it’s free for public repos.

---

## Blue-Green Deployment Flow

1. **Deploy to Green** — Deploy new version to inactive slot.
2. **Health Check** — Validate green deployment (e.g., `GET /health`).
3. **Switch Traffic** — Point load balancer/DNS to green.
4. **Blue = Rollback** — Blue keeps previous version for quick rollback.

---

## Rollback Strategy

- **Trigger:** Runs when deploy job fails (`if: failure()`).
- **Action:** Checks out previous commit (`github.event.before`) and runs rollback logic.
- **Platform-specific:** Swap blue/green slots, redeploy previous image, or revert CloudFormation.

---

## Monitoring Integration

Set `MONITORING_WEBHOOK` in GitHub Secrets to send deployment events to:

- **Datadog:** Webhook or Events API.
- **Slack:** Incoming webhook.
- **PagerDuty:** Events API v2.
- **Custom:** Any HTTP endpoint.

Payload format:

```json
{
  "event": "deployment",
  "status": "success|failed",
  "version": "<sha>",
  "repo": "<owner/repo>",
  "rollback": "triggered"  // only on failure
}
```

---

## Performance Testing

- Runs `pytest -m performance` after unit tests.
- `continue-on-error: true` — performance failures don’t block the pipeline.
- Metrics: response time (<500ms in CI), concurrent requests.
- Use for regression detection; tighten thresholds in production.

---

## Suggested Next Optimizations

1. **Self-hosted runners** — For large orgs, reduces queue time and network latency.
2. **Faster Playwright** — Use `playwright install chromium` only; add Firefox/WebKit as optional.
3. **Smarter caching** — Use `cache` action with explicit keys for more control.
4. **Dependency updates** — Dependabot or Renovate for automated PRs.
5. **Test splitting** — For very large suites, use `pytest --splits N --group M` or Playwright sharding.
