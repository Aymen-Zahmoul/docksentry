import json
from typing import List, Dict, Any
from datetime import datetime
from ..models import Finding


class ReportExporter:
    """Exports audit findings to industry-standard formats."""

    @staticmethod
    def to_sarif(findings: List[Finding]) -> Dict[str, Any]:
        rules_map = {}
        results = []

        for f in findings:
            if f.rule_id not in rules_map:
                rules_map[f.rule_id] = {
                    "id": f.rule_id,
                    "name": f.title,
                    "shortDescription": {"text": f.title},
                    "fullDescription": {"text": f.message},
                    "helpUri": f.documentation_url,
                    "defaultConfiguration": {
                        "level": "error" if f.severity in ["CRITICAL", "HIGH"] else "warning"
                    },
                }

            result = {
                "ruleId": f.rule_id,
                "message": {"text": f"{f.message} (Evidence: {f.evidence})"},
                "level": "error" if f.severity in ["CRITICAL", "HIGH"] else "warning",
                "locations": [
                    {
                        "physicalLocation": {
                            "artifactLocation": {"uri": f.source},
                            "region": {
                                "startLine": f.line or 1,
                                "startColumn": 1,
                            },
                        }
                    }
                ],
            }
            results.append(result)

        return {
            "$schema": "https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json",
            "version": "2.1.0",
            "runs": [
                {
                    "tool": {
                        "driver": {
                            "name": "DOCKSENTRY",
                            "version": "1.0.0",
                            "informationUri": "https://github.com/docksentry/docksentry",
                            "rules": list(rules_map.values()),
                        }
                    },
                    "results": results,
                }
            ],
        }

    @staticmethod
    def to_markdown(findings: List[Finding], score: int = 78) -> str:
        lines = [
            "# DOCKSENTRY Docker Security Audit Report",
            f"**Audit Score:** {score} / 100",
            f"**Generated:** {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')}",
            f"**Total Findings:** {len(findings)}",
            "",
            "## Summary of Findings",
            "| Rule | Severity | Resource | Title |",
            "| :--- | :--- | :--- | :--- |",
        ]

        for f in findings:
            lines.append(f"| `{f.rule_id}` | **{f.severity}** | `{f.resource}` | {f.title} |")

        lines.extend(["", "## Detailed Technical Remediation", ""])

        for idx, f in enumerate(findings, 1):
            lines.extend([
                f"### {idx}. [{f.rule_id}] {f.title}",
                f"* **Severity:** {f.severity}",
                f"* **Category:** {f.category}",
                f"* **Resource:** `{f.resource}`",
                f"* **Source:** `{f.source}`" + (f":{f.line}" if f.line else ""),
                f"* **Message:** {f.message}",
                f"* **Evidence:** `{f.evidence}`",
                "",
                "#### Security Risk & Attack Vector",
                f.why_it_matters,
                "",
                "#### Recommended Hardening Fix",
                f.remediation,
                "",
            ])

            if f.code_diff:
                lines.extend([
                    f"```diff",
                    f"--- Insecure Configuration",
                    f"{f.code_diff.insecure}",
                    f"+++ Recommended Fix",
                    f"{f.code_diff.recommended}",
                    f"```",
                    "",
                ])
                if f.code_diff.trade_offs:
                    lines.extend([
                        f"> [!WARNING] **Engineering Trade-off:** {f.code_diff.trade_offs}",
                        "",
                    ])

        return "\n".join(lines)
