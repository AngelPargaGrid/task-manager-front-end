#!/usr/bin/env bash
# Run complexity checks (radon for Python, ESLint for JS)
set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
REPORTS="$SCRIPT_DIR/../reports/output"
mkdir -p "$REPORTS"

echo "=== Complexity Checks ==="

# Python (radon)
if command -v radon &>/dev/null; then
  echo "--- Python (radon) ---"
  radon cc api/app -s -j > "$REPORTS/radon-complexity.json" 2>/dev/null || radon cc api/app -s -n C 2>/dev/null || true
else
  echo "radon not installed: pip install radon"
fi

# ESLint complexity (from project root)
echo "--- JavaScript/TypeScript (ESLint complexity) ---"
cd "$PROJECT_ROOT"
if [ -f "qa-automation/quality/eslint-qa.config.js" ]; then
  npx eslint src --config qa-automation/quality/eslint-qa.config.js --format json --output-file "$REPORTS/eslint-qa.json" 2>/dev/null || true
fi

echo "Done. Reports in $REPORTS"
