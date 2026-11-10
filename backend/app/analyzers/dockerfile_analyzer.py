import os
import re
from typing import List, Dict, Any, Optional
from datetime import datetime
from ..models import Finding, CodeDiff, ResourceType, Severity, FindingCategory


class DockerfileAnalyzer:
    """Audits Dockerfiles for hardening misconfigurations."""

    def __init__(self, filepath: str):
        self.filepath = filepath
        self.filename = os.path.basename(filepath)

    def analyze(self) -> List[Finding]:
        findings: List[Finding] = []

        if not os.path.exists(self.filepath):
            return findings

        with open(self.filepath, "r", encoding="utf-8", errors="ignore") as f:
            lines = f.readlines()

        has_user = False
        user_line = None
        user_value = None

        has_healthcheck = False
        healthcheck_line = None

        stages = []
        current_stage = None

        for idx, raw_line in enumerate(lines, 1):
            line = raw_line.strip()
            if not line or line.startswith("#"):
                continue

            # FROM stage
            if re.match(r"^FROM\s+", line, re.IGNORECASE):
                current_stage = line
                stages.append({"line": idx, "spec": line})
                has_user = False  # Reset per stage in multi-stage builds

            # USER check
            if re.match(r"^USER\s+", line, re.IGNORECASE):
                has_user = True
                user_line = idx
                parts = line.split(None, 1)
                user_value = parts[1].strip() if len(parts) > 1 else ""

            # HEALTHCHECK check
            if re.match(r"^HEALTHCHECK\s+", line, re.IGNORECASE):
                has_healthcheck = True
                healthcheck_line = idx

            # Dangerous SSH expose
            if re.match(r"^EXPOSE\s+.*22(\s|$)", line, re.IGNORECASE):
                findings.append(
                    Finding(
                        id=f"f-df-ssh-{idx}",
                        rule_id="DS005",
                        title="SSH Daemon Port 22 Exposed in Dockerfile",
                        severity="HIGH",
                        category="NETWORK",
                        resource=self.filename,
                        resource_type=ResourceType.DOCKERFILE.value,
                        source=self.filepath,
                        line=idx,
                        message="Dockerfile exposes port 22 (SSH). Containers should not run SSH daemons; use 'docker exec' or Kubernetes exec instead.",
                        evidence=line,
                        why_it_matters="Running an SSH daemon inside a container introduces credential management overhead, unmonitored lateral access, and increases the attack surface.",
                        remediation="Remove the SSH server and EXPOSE 22 instruction. Use standard orchestration CLI access rather than embedded SSH.",
                        code_diff=CodeDiff(
                            language="dockerfile",
                            insecure="EXPOSE 22\nCMD [\"/usr/sbin/sshd\", \"-D\"]",
                            recommended="# Use orchestration tooling for debugging\n# Do not expose SSH\nEXPOSE 8080\nCMD [\"python\", \"app.py\"]",
                            trade_offs="Operators must have Docker socket or Kubernetes API access to shell into the container instead of direct SSH credentials."
                        ),
                        documentation_url="https://docs.docker.com/develop/develop-images/instructions/#expose",
                        status="OPEN",
                        created_at=datetime.utcnow().isoformat() + "Z",
                    )
                )

        # Check A: Missing USER directive
        if not has_user or (user_value and user_value.lower() in ["root", "0"]):
            findings.append(
                Finding(
                    id=f"f-df-root-{len(findings) + 1}",
                    rule_id="DS001",
                    title="Missing Non-Root USER Directive",
                    severity="HIGH",
                    category="IDENTITY",
                    resource=self.filename,
                    resource_type=ResourceType.DOCKERFILE.value,
                    source=self.filepath,
                    line=user_line or (stages[-1]["line"] if stages else 1),
                    message="Dockerfile does not declare a non-root USER instruction. Container processes will default to running as root (UID 0).",
                    evidence=f"USER {user_value}" if has_user else "No USER instruction found in final build stage",
                    why_it_matters="Running as root inside the container grants the process root capabilities within its namespace. In the event of an application exploit, the attacker has elevated privileges to probe host sockets and escape sandbox boundaries.",
                    remediation="Create a dedicated least-privileged user (e.g. appuser UID 10001) and switch to it using the USER instruction before the CMD/ENTRYPOINT.",
                    code_diff=CodeDiff(
                        language="dockerfile",
                        insecure="FROM python:3.12-slim\nWORKDIR /app\nCOPY . .\nCMD [\"python\", \"app.py\"]",
                        recommended="FROM python:3.12-slim\nRUN groupadd -g 10001 appgroup && \\\n    useradd -u 10001 -g appgroup -s /sbin/nologin --no-create-home appuser\nWORKDIR /app\nCOPY --chown=appuser:appgroup . .\nUSER appuser\nCMD [\"python\", \"app.py\"]",
                        trade_offs="Non-root users cannot bind to privileged system ports (<1024) or write to directories outside /app without explicit ownership permissions."
                    ),
                    documentation_url="https://docs.docker.com/develop/develop-images/instructions/#user",
                    status="OPEN",
                    created_at=datetime.utcnow().isoformat() + "Z",
                )
            )

        # Check G: Missing HEALTHCHECK
        if not has_healthcheck:
            findings.append(
                Finding(
                    id=f"f-df-hc-{len(findings) + 1}",
                    rule_id="DS007",
                    title="Missing HEALTHCHECK Instruction",
                    severity="LOW",
                    category="RELIABILITY",
                    resource=self.filename,
                    resource_type=ResourceType.DOCKERFILE.value,
                    source=self.filepath,
                    line=1,
                    message="Dockerfile does not define a HEALTHCHECK instruction for container liveness monitoring.",
                    evidence="No HEALTHCHECK directive defined in Dockerfile",
                    why_it_matters="Without health checks, unresponsive or deadlocked containers remain marked as healthy by the Docker engine, routing live traffic to broken workloads.",
                    remediation="Add a HEALTHCHECK instruction that queries the application health endpoint.",
                    code_diff=CodeDiff(
                        language="dockerfile",
                        insecure="# No HEALTHCHECK declared\nCMD [\"python\", \"app.py\"]",
                        recommended="HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \\\n  CMD curl -f http://localhost:8000/health || exit 1\nCMD [\"python\", \"app.py\"]",
                        trade_offs="Adds minimal CPU overhead every interval and requires a lightweight probe tool (curl/wget or Python script) in the image."
                    ),
                    documentation_url="https://docs.docker.com/reference/dockerfile/#healthcheck",
                    status="OPEN",
                    created_at=datetime.utcnow().isoformat() + "Z",
                )
            )

        return findings
