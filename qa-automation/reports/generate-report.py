#!/usr/bin/env python3
"""
Generate QA report from test results, coverage, complexity, security, and performance.
Quality metrics and targets:
  - Test coverage: 80%+
  - Code complexity: <10
  - Security vulnerabilities: 0 critical
  - Response time: <500ms
  - Error rate: <1%
"""
import json
import re
from datetime import datetime
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
OUTPUT_DIR = Path(__file__).parent / "output"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

TARGETS = {
    "coverage": 80,
    "complexity": 10,
    "security_critical": 0,
    "response_time_ms": 500,
    "error_rate_pct": 1,
}


def load_json(path: Path, default=None):
    if path.exists():
        try:
            with open(path) as f:
                return json.load(f)
        except (json.JSONDecodeError, OSError):
            pass
    return default or {}


def parse_pytest_log(content: str) -> dict:
    m = re.search(r"(\d+) passed", content)
    passed = int(m.group(1)) if m else 0
    m = re.search(r"(\d+) failed", content)
    failed = int(m.group(1)) if m else 0
    return {"passed": passed, "failed": failed, "total": passed + failed}


def parse_coverage(content: str) -> tuple[float, bool]:
    """Return (percent, found). found=False if no TOTAL line."""
    m = re.search(r"TOTAL\s+\d+\s+\d+\s+(\d+)%", content)
    if m:
        return (int(m.group(1)), True)
    return (0.0, False)


def parse_radon_complexity(data: dict) -> dict:
    """Parse radon -j output; return max complexity and count over threshold."""
    max_cc = 0
    over_threshold = 0
    if isinstance(data, dict):
        for file_data in data.values():
            items = file_data if isinstance(file_data, list) else []
            for item in items:
                cc = item.get("complexity", 0) if isinstance(item, dict) else 0
                max_cc = max(max_cc, cc)
                if cc > TARGETS["complexity"]:
                    over_threshold += 1
    return {"max": max_cc, "over_threshold": over_threshold}


def main():
    report = {
        "generated_at": datetime.utcnow().isoformat() + "Z",
        "project": "Customer Support Full-Stack",
        "targets": TARGETS,
        "metrics": {
            "coverage": {"value": 0, "target": TARGETS["coverage"], "unit": "%", "status": "unknown"},
            "complexity": {"value": 0, "target": TARGETS["complexity"], "unit": "", "status": "unknown"},
            "security_critical": {"value": 0, "target": TARGETS["security_critical"], "unit": "", "status": "unknown"},
            "response_time_ms": {"value": 0, "target": TARGETS["response_time_ms"], "unit": "ms", "status": "unknown"},
            "error_rate_pct": {"value": 0, "target": TARGETS["error_rate_pct"], "unit": "%", "status": "unknown"},
        },
        "sections": {},
    }

    # 1. Test coverage (from pytest --cov output in pytest.log)
    cov_term = OUTPUT_DIR / "coverage.log"
    pytest_log = OUTPUT_DIR / "pytest.log"
    cov_content = cov_term.read_text() if cov_term.exists() else (pytest_log.read_text() if pytest_log.exists() else "")
    if cov_content:
        pct, found = parse_coverage(cov_content)
        if found:
            report["metrics"]["coverage"]["value"] = pct
            report["metrics"]["coverage"]["status"] = "pass" if pct >= TARGETS["coverage"] else "fail"
            report["sections"]["coverage"] = {"percent": pct}
    if not report["sections"].get("coverage") and (REPO_ROOT / "api" / ".coverage").exists():
        report["sections"]["coverage"] = {"note": "Run: pytest --cov=app --cov-report=term-missing api/tests/"}
    if "coverage" not in report["sections"]:
        report["sections"]["coverage"] = {"note": "Run pytest with --cov to collect coverage"}

    # 2. Code complexity
    radon_path = OUTPUT_DIR / "radon-complexity.json"
    if radon_path.exists():
        data = load_json(radon_path)
        rc = parse_radon_complexity(data) if isinstance(data, dict) else {}
        if rc:
            report["metrics"]["complexity"]["value"] = rc.get("max", 0)
            report["metrics"]["complexity"]["status"] = (
                "pass" if rc.get("max", 0) < TARGETS["complexity"] else "fail"
            )
            report["sections"]["complexity"] = rc

    # 3. Security (critical vulnerabilities)
    audit_path = OUTPUT_DIR / "npm-audit.json"
    critical, high = 0, 0
    if audit_path.exists():
        audit = load_json(audit_path)
        vulns = audit.get("metadata", {}).get("vulnerabilities", {})
        critical = vulns.get("critical", 0)
        high = vulns.get("high", 0)
    report["metrics"]["security_critical"]["value"] = critical
    report["metrics"]["security_critical"]["status"] = "pass" if critical == 0 else "fail"
    report["sections"]["npm_audit"] = {"critical": critical, "high": high}

    # 4. Response time & 5. Error rate (from k6 or pytest perf)
    k6_summary = OUTPUT_DIR / "k6-summary.json"
    perf_log = OUTPUT_DIR / "performance.log"
    if k6_summary.exists():
        k6 = load_json(k6_summary)
        metrics = k6.get("metrics", {})
        if "http_req_duration" in metrics:
            p95 = metrics["http_req_duration"].get("values", {}).get("p(95)", 0)
            report["metrics"]["response_time_ms"]["value"] = int(p95)
            report["metrics"]["response_time_ms"]["status"] = (
                "pass" if p95 < TARGETS["response_time_ms"] else "fail"
            )
        if "http_req_failed" in metrics:
            rate = metrics["http_req_failed"].get("values", {}).get("rate", 0) * 100
            report["metrics"]["error_rate_pct"]["value"] = round(rate, 2)
            report["metrics"]["error_rate_pct"]["status"] = (
                "pass" if rate < TARGETS["error_rate_pct"] else "fail"
            )
    elif perf_log.exists():
        c = perf_log.read_text()
        m = re.search(r"p95[:\s]+(\d+)", c, re.I)
        if m:
            report["metrics"]["response_time_ms"]["value"] = int(m.group(1))
            report["metrics"]["response_time_ms"]["status"] = (
                "pass" if int(m.group(1)) < TARGETS["response_time_ms"] else "fail"
            )
    else:
        report["sections"]["performance"] = {"note": "Run k6 for response time and error rate"}

    # Pytest results
    pytest_log = OUTPUT_DIR / "pytest.log"
    if pytest_log.exists():
        content = pytest_log.read_text()
        report["sections"]["pytest"] = parse_pytest_log(content)

    output_path = OUTPUT_DIR / "qa-report.json"
    with open(output_path, "w") as f:
        json.dump(report, f, indent=2)

    print(f"Report written to {output_path}")
    return 0


if __name__ == "__main__":
    exit(main())
