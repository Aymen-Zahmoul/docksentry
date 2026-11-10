import os
from flask import Flask, jsonify, request, Response
from flask_cors import CORS
from dataclasses import asdict

from .engine import SecurityAuditEngine
from .exporters.reports import ReportExporter

app = Flask(__name__)
# Enable CORS for frontend Vite dev server and desktop client
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Initialize the Security Audit Engine rooted at the workspace
WORKSPACE_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
engine = SecurityAuditEngine(WORKSPACE_ROOT)


@app.route("/health", methods=["GET"])
def health_check():
    return jsonify({
        "status": "healthy",
        "service": "docksentry-audit-engine",
        "version": "1.0.0",
        "workspace": WORKSPACE_ROOT,
    })


@app.route("/api/v1/dashboard", methods=["GET"])
def get_dashboard():
    stats = engine.get_dashboard_stats()
    return jsonify(asdict(stats))


@app.route("/api/v1/findings", methods=["GET"])
def get_findings():
    findings = list(engine.findings_db.values())

    # Optional query parameters
    severity = request.args.get("severity")
    status = request.args.get("status")
    category = request.args.get("category")
    search = request.args.get("search")

    results = []
    for f in findings:
        if severity and severity.upper() != "ALL" and f.severity != severity.upper():
            continue
        if status and status.upper() != "ALL" and f.status != status.upper():
            continue
        if category and category.upper() != "ALL" and f.category != category.upper():
            continue
        if search:
            q = search.lower()
            if not (
                q in f.title.lower()
                or q in f.rule_id.lower()
                or q in f.resource.lower()
                or q in f.evidence.lower()
            ):
                continue
        results.append(f.to_dict())

    return jsonify(results)


@app.route("/api/v1/findings/<finding_id>", methods=["PATCH"])
def update_finding(finding_id):
    finding = engine.findings_db.get(finding_id)
    if not finding:
        return jsonify({"error": "Finding not found"}), 404

    data = request.get_json() or {}
    if "status" in data:
        new_status = data["status"].upper()
        if new_status in ["OPEN", "RESOLVED", "IGNORED"]:
            finding.status = new_status

    return jsonify(finding.to_dict())


@app.route("/api/v1/containers", methods=["GET"])
def get_containers():
    return jsonify([c.to_dict() for c in engine.containers_cache])


@app.route("/api/v1/scans", methods=["GET"])
def get_scans():
    return jsonify([s.to_dict() for s in engine.scans_history])


@app.route("/api/v1/scans", methods=["POST"])
def trigger_scan():
    data = request.get_json() or {}
    scan_type = data.get("type", "compose")
    target = data.get("target", "docker-compose.yml")

    scan = engine.run_scan(scan_type, target)
    return jsonify(scan.to_dict()), 201


@app.route("/api/v1/rules", methods=["GET"])
def get_rules():
    return jsonify([r.to_dict() for r in engine.rules.values()])


@app.route("/api/v1/rules/<rule_id>/toggle", methods=["POST"])
def toggle_rule(rule_id):
    rule = engine.rules.get(rule_id)
    if not rule:
        return jsonify({"error": "Rule not found"}), 404

    rule.enabled = not rule.enabled
    return jsonify(rule.to_dict())


@app.route("/api/v1/reports/export", methods=["GET"])
def export_report():
    format_type = request.args.get("format", "json").lower()
    findings = list(engine.findings_db.values())

    if format_type == "sarif":
        sarif_data = ReportExporter.to_sarif(findings)
        return jsonify(sarif_data)

    if format_type == "markdown":
        stats = engine.get_dashboard_stats()
        md_text = ReportExporter.to_markdown(findings, score=stats.security_score)
        return Response(md_text, mimetype="text/markdown")

    # Default: JSON
    stats = engine.get_dashboard_stats()
    return jsonify({
        "product": "DOCKSENTRY",
        "version": "1.0.0",
        "score": stats.security_score,
        "summary": asdict(stats.findings_summary),
        "findings": [f.to_dict() for f in findings],
    })


if __name__ == "__main__":
    # Run standalone on port 8000
    app.run(host="0.0.0.0", port=8000, debug=False)
