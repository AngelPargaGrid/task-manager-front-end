#!/usr/bin/env python3
"""
Analyze QA results and produce AI-generated improvement recommendations.
Run: python qa-automation/scripts/analyze-results.py
"""
import json
import re
from pathlib import Path

QA_ROOT = Path(__file__).resolve().parent.parent
OUTPUT = QA_ROOT / "reports" / "output"


def load_json(path: Path):
    try:
        with open(path) as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return None


def analyze():
    recommendations = []

    # Pytest results
    pytest_log = OUTPUT / "pytest.log"
    if pytest_log.exists():
        content = pytest_log.read_text()
        m = re.search(r"(\d+) failed", content)
        failed_count = int(m.group(1)) if m else 0
        if failed_count > 0:
            recommendations.append({
                "priority": "high",
                "category": "tests",
                "message": "Backend tests have failures. Review pytest output and fix before merge.",
                "action": "Run: cd api && pytest tests/ -v",
            })

    # npm audit
    audit = load_json(OUTPUT / "npm-audit.json")
    if audit:
        meta = audit.get("metadata", {}).get("vulnerabilities", {})
        crit, high = meta.get("critical", 0), meta.get("high", 0)
        if crit > 0:
            recommendations.append({
                "priority": "critical",
                "category": "security",
                "message": f"{crit} critical npm vulnerabilities detected.",
                "action": "Run: npm audit fix",
            })
        if high > 0:
            recommendations.append({
                "priority": "high",
                "category": "security",
                "message": f"{high} high-severity npm vulnerabilities.",
                "action": "Run: npm audit for details",
            })

    # ESLint / Pylint
    if not (OUTPUT / "eslint.log").exists():
        recommendations.append({
            "priority": "low",
            "category": "quality",
            "message": "Run ESLint in CI to catch code quality issues.",
            "action": "npm run lint",
        })

    # Performance
    recommendations.append({
        "priority": "medium",
        "category": "performance",
        "message": "Add Lighthouse CI to track Core Web Vitals.",
        "action": "npx @lhci/cli@0.13.x autorun",
    })

    # Coverage
    recommendations.append({
        "priority": "low",
        "category": "coverage",
        "message": "Ensure pytest coverage reports are generated (--cov).",
        "action": "pytest --cov=app --cov-report=html api/tests/",
    })

    return recommendations


def main():
    recs = analyze()
    output_path = OUTPUT / "ai-recommendations.json"
    OUTPUT.mkdir(parents=True, exist_ok=True)

    report = {"recommendations": recs}
    with open(output_path, "w") as f:
        json.dump(report, f, indent=2)

    print("AI Improvement Recommendations:\n")
    for r in recs:
        print(f"  [{r['priority'].upper()}] {r['message']}")
        print(f"       Action: {r['action']}\n")
    print(f"Full report: {output_path}")


if __name__ == "__main__":
    main()
