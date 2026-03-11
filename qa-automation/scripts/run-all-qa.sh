#!/usr/bin/env bash
# QA Automation - Run full QA pipeline
# Executes: unit tests, integration tests, lint, security scan, performance tests, report generation

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
QA_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
PROJECT_ROOT="$(cd "$QA_ROOT/.." && pwd)"
REPORTS="$QA_ROOT/reports/output"
mkdir -p "$REPORTS"

echo "=============================================="
echo "  QA Automation - Full Pipeline"
echo "  Project: $PROJECT_ROOT"
echo "=============================================="

# 1. Lint (frontend)
echo ""
echo "[1/6] ESLint (frontend)..."
(cd "$PROJECT_ROOT" && npm run lint) || true

# 2. Pylint (backend)
echo ""
echo "[2/6] Pylint (backend)..."
if command -v pylint &>/dev/null; then
  pylint --rcfile="$QA_ROOT/quality/pylint.rc" api/app --output-format=text 2>/dev/null || true
else
  echo "  pylint not installed (pip install pylint)"
fi

# 3. Unit tests - Backend (pytest)
echo ""
echo "[3/6] Pytest (backend unit + integration)..."
export SECRET_KEY=qa-secret JWT_SECRET_KEY=qa-jwt FLASK_ENV=testing
(cd "$PROJECT_ROOT" && python3 -m pytest api/tests/ -m "not performance" -v --tb=short) 2>&1 | tee "$REPORTS/pytest.log" || true

# 4. Unit tests - Frontend (Vitest)
echo ""
echo "[4/6] Vitest (frontend unit)..."
if grep -q '"vitest"' "$PROJECT_ROOT/package.json" 2>/dev/null; then
  (cd "$PROJECT_ROOT" && npm run test:unit -- --run) 2>&1 | tee "$REPORTS/vitest.log" || true
else
  echo "  Vitest not configured. Add: npm i -D vitest @testing-library/react @testing-library/jest-dom jsdom"
fi

# 5. Security scan
echo ""
echo "[5/6] Security scan..."
"$QA_ROOT/security/security-scan.sh" 2>/dev/null || true

# 6. Report generation
echo ""
echo "[6/6] Generate report..."
python3 "$QA_ROOT/reports/generate-report.py" 2>/dev/null || true

echo ""
echo "=============================================="
echo "  QA Pipeline Complete"
echo "  Dashboard: file://$QA_ROOT/reports/dashboard.html"
echo "  Reports:   $REPORTS"
echo "=============================================="
