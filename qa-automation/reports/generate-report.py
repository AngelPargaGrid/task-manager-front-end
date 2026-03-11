#!/usr/bin/env python3
"""
Generate QA report from test results, lint output, and scan data.
Run: python qa-automation/reports/generate-report.py
"""
import json
import re
from datetime import datetime
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
OUTPUT_DIR = Path(__file__).parent / "output"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


def load_json(path: Path, default=None):
    """Load JSON file or return default."""
    if path.exists():
        try:
            with open(path) as f:
                return json.load(f)
        except (json.JSONDecodeError, OSError):
            pass
    return default or {}


def main():
    report = {
        "generated_at": datetime.utcnow().isoformat() + "Z",
        "project": "Customer Support Full-Stack",
        "summary": {"passed": 0, "failed": 0, "warnings": 0, "skipped": 0},
        "sections": {},
    }

    # Collect test results - pytest.json or pytest.log
    pytest_json = REPO_ROOT / "api" / "pytest-results.json"
    pytest_log = OUTPUT_DIR / "pytest.log"
    if pytest_json.exists():
        data = load_json(pytest_json)
        if data:
            report["sections"]["pytest"] = {
                "total": data.get("summary", {}).get("total", 0),
                "passed": data.get("summary", {}).get("passed", 0),
                "failed": data.get("summary", {}).get("failed", 0),
            }
            report["summary"]["passed"] += data.get("summary", {}).get("passed", 0)
            report["summary"]["failed"] += data.get("summary", {}).get("failed", 0)
    elif pytest_log.exists():
        content = pytest_log.read_text()
        m = re.search(r"(\d+) passed", content)
        passed = int(m.group(1)) if m else 0
        m = re.search(r"(\d+) failed", content)
        failed = int(m.group(1)) if m else 0
        report["sections"]["pytest"] = {"passed": passed, "failed": failed, "total": passed + failed}
        report["summary"]["passed"] += passed
        report["summary"]["failed"] += failed

    # Collect npm audit if present
    audit_path = OUTPUT_DIR / "npm-audit.json"
    if audit_path.exists():
        audit = load_json(audit_path)
        vulns = audit.get("metadata", {}).get("vulnerabilities", {})
        report["sections"]["npm_audit"] = {
            "high": vulns.get("high", 0),
            "critical": vulns.get("critical", 0),
        }

    # Performance thresholds
    thresholds_path = REPO_ROOT / "qa-automation" / "performance" / "performance-thresholds.json"
    if thresholds_path.exists():
        report["sections"]["thresholds"] = load_json(thresholds_path)

    # Write report
    output_path = OUTPUT_DIR / "qa-report.json"
    with open(output_path, "w") as f:
        json.dump(report, f, indent=2)

    print(f"Report written to {output_path}")
    return 0


if __name__ == "__main__":
    exit(main())
