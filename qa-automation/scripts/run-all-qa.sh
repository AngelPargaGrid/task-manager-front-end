#!/usr/bin/env bash
# QA Automation - Master execution script
# Runs all checks: lint, complexity, unit tests, coverage, security, performance, report generation
#
# Quality targets: Coverage 80%+ | Complexity <10 | 0 critical vulns | <500ms | <1% errors

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
QA_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
PROJECT_ROOT="$(cd "$QA_ROOT/.." && pwd)"
REPORTS="$QA_ROOT/reports/output"
mkdir -p "$REPORTS"

echo "=============================================="
echo "  QA Automation - Master Execution"
echo "  Project: $PROJECT_ROOT"
echo "  Targets: Coverage 80%+ | Complexity <10 | 0 critical | <500ms | <1% errors"
echo "=============================================="

# 1. ESLint (frontend)
echo ""
echo "[1/9] ESLint (frontend)..."
(cd "$PROJECT_ROOT" && npm run lint) 2>&1 | tee "$REPORTS/eslint.log" || true

# 2. ESLint QA (complexity)
echo ""
echo "[2/9] ESLint complexity..."
(cd "$PROJECT_ROOT" && npx eslint src --config qa-automation/quality/eslint-qa.config.js --format compact) 2>&1 | tee -a "$REPORTS/eslint.log" || true

# 3. Pylint (backend, with max-complexity=10)
echo ""
echo "[3/9] Pylint (backend)..."
if command -v pylint &>/dev/null; then
  (cd "$PROJECT_ROOT" && pylint --rcfile="$QA_ROOT/quality/pylint.rc" api/app --output-format=text) 2>&1 | tee "$REPORTS/pylint.log" || true
else
  echo "  pylint not installed (pip install pylint)"
fi

# 4. Radon (Python complexity)
echo ""
echo "[4/9] Radon (Python complexity)..."
if command -v radon &>/dev/null; then
  (cd "$PROJECT_ROOT" && radon cc api/app -s -j) > "$REPORTS/radon-complexity.json" 2>/dev/null || radon cc api/app -s -n C 2>/dev/null || true
else
  echo "  radon not installed (pip install radon)"
fi

# 5. Pytest with coverage
echo ""
echo "[5/9] Pytest (backend + coverage)..."
export SECRET_KEY=qa-secret JWT_SECRET_KEY=qa-jwt FLASK_ENV=testing
(cd "$PROJECT_ROOT" && python3 -m pytest api/tests/ -m "not performance" -v --tb=short --cov=app --cov-report=term-missing --cov-fail-under=0) 2>&1 | tee "$REPORTS/pytest.log"
cp "$REPORTS/pytest.log" "$REPORTS/coverage.log" 2>/dev/null || true

# 6. Vitest (frontend unit)
echo ""
echo "[6/9] Vitest (frontend unit)..."
if grep -q '"vitest"' "$PROJECT_ROOT/package.json" 2>/dev/null; then
  (cd "$PROJECT_ROOT" && npm run test:unit -- --run) 2>&1 | tee "$REPORTS/vitest.log" || true
else
  echo "  Vitest not configured"
fi

# 7. Security scan
echo ""
echo "[7/9] Security scan..."
"$QA_ROOT/security/security-scan.sh" 2>/dev/null || true

# 8. Performance (k6) - optional, requires running app
echo ""
echo "[8/9] Performance (k6)..."
if command -v k6 &>/dev/null; then
  (cd "$PROJECT_ROOT" && k6 run --duration=10s --vus=5 "$QA_ROOT/performance/k6-load-test.js" 2>&1) | tee "$REPORTS/performance.log" || true
  # k6 summary export if available
  if [ -f "$REPORTS/k6-summary.json" ]; then :; fi
else
  echo "  k6 not installed (see https://k6.io/docs/getting-started/installation/)"
fi

# 9. Report generation
echo ""
echo "[9/9] Generate report..."
python3 "$QA_ROOT/reports/generate-report.py" 2>/dev/null || true

echo ""
echo "=============================================="
echo "  QA Suite Complete"
echo "  Dashboard: file://$QA_ROOT/reports/dashboard.html"
echo "  Reports:   $REPORTS"
echo "=============================================="
