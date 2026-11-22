import os
import re
from typing import List, Dict, Any, Optional
from datetime import datetime

from ..models import Finding, CodeDiff, ResourceType


SECRET_PATTERNS = [
    (r"(?:api[_-]?key|apikey)\s*[:=]\s*['\"]?([a-zA-Z0-9_\-]{16,})['\"]?", "Hardcoded API Key"),
    (r"(?:password|passwd|pwd)\s*[:=]\s*['\"]?([^'\"\s$]{6,})['\"]?", "Plaintext Password"),
    (r"(?:secret[_-]?key|secret)\s*[:=]\s*['\"]?([^'\"\s$]{8,})['\"]?", "Hardcoded Secret Token"),
    (r"ghp_[a-zA-Z0-9]{36}", "GitHub Personal Access Token"),
    (r"AKIA[0-9A-Z]{16}", "AWS Access Key ID"),
    (r"-----BEGIN (?:RSA )?PRIVATE KEY-----", "Embedded Private Key Header"),
]


class SecretsAnalyzer:
    """Detects embedded secrets, tokens, and plaintext passwords in container configurations."""

    @classmethod
    def audit_dockerfile(cls, filepath: str, lines: List[str]) -> List[Finding]:
        findings: List[Finding] = []
        filename = os.path.basename(filepath)

        for idx, line in enumerate(lines, 1):
            stripped = line.strip()
            # Only check ENV, ARG, or RUN statements with secrets
            if not re.match(r"^(?:ENV|ARG|RUN)\s+", stripped, re.IGNORECASE):
                continue

            for pattern, label in SECRET_PATTERNS:
                match = re.search(pattern, stripped, re.IGNORECASE)
                if match:
                    # Ignore template or variable references like ${VAR} or empty
                    matched_val = match.group(0)
                    if "${" in matched_val or "$(" in matched_val:
                        continue

                    # Mask secret for evidence display
                    masked = re.sub(r"([:=]\s*['\"]?)(.{3}).*(.{3}['\"]?)", r"\1\2****\3", matched_val)

                    findings.append(
                        Finding(
                            id=f"f-df-sec-{idx}",
                            rule_id="DS010",
                            title=f"{label} in Dockerfile (Line {idx})",
                            severity="CRITICAL",
                            category="SECRETS",
                            resource=filename,
                            resource_type=ResourceType.DOCKERFILE.value,
                            source=filepath,
                            line=idx,
                            message=(
                                f"Detected {label.lower()} declared in Dockerfile '{filename}'. "
                                "Environment variables and build arguments are baked into the image history and can be inspected by anyone pulling the image."
                            ),
                            evidence=masked,
                            why_it_matters=(
                                "Image layers are immutable and publicly auditable via 'docker history'. "
                                "Hardcoded credentials allow anyone with image pull permissions to compromise backend infrastructure."
                            ),
                            remediation=(
                                "Remove plaintext credentials. Use BuildKit secret mounts (--mount=type=secret) "
                                "or pass secrets dynamically at runtime through an orchestrator vault."
                            ),
                            code_diff=CodeDiff(
                                language="dockerfile",
                                insecure=stripped,
                                recommended="# Use BuildKit secret mount or runtime injection\nRUN --mount=type=secret,id=token cat /run/secrets/token",
                                trade_offs="Requires enabling DOCKER_BUILDKIT=1 during build invocation.",
                            ),
                            documentation_url="https://docs.docker.com/build/building/secrets/",
                            status="OPEN",
                            created_at=datetime.utcnow().isoformat() + "Z",
                            auto_fixable=True,
                            remediation_action="sanitize_secret",
                        )
                    )
        return findings

    @classmethod
    def audit_compose(cls, filepath: str, compose_dict: Dict[str, Any]) -> List[Finding]:
        findings: List[Finding] = []
        filename = os.path.basename(filepath)
        services = compose_dict.get("services") or {}

        for svc_name, svc_conf in services.items():
            if not isinstance(svc_conf, dict):
                continue

            env = svc_conf.get("environment")
            if not env:
                continue

            env_pairs = []
            if isinstance(env, dict):
                env_pairs = [(k, str(v)) for k, v in env.items()]
            elif isinstance(env, list):
                for item in env:
                    if "=" in str(item):
                        k, v = str(item).split("=", 1)
                        env_pairs.append((k.strip(), v.strip()))

            for key, val in env_pairs:
                # Check for plaintext passwords
                for pattern, label in SECRET_PATTERNS:
                    combined = f"{key}={val}"
                    if re.search(pattern, combined, re.IGNORECASE) and not val.startswith("${") and len(val) >= 4:
                        masked = f"{key}={val[:2]}****{val[-2:] if len(val) > 4 else ''}"
                        findings.append(
                            Finding(
                                id=f"f-cmp-sec-{svc_name}-{key.lower()}",
                                rule_id="DS010",
                                title=f"{label} Exposed in Service '{svc_name}'",
                                severity="CRITICAL",
                                category="SECRETS",
                                resource=f"service:{svc_name}",
                                resource_type=ResourceType.COMPOSE_SERVICE.value,
                                source=filepath,
                                line=None,
                                message=(
                                    f"Service '{svc_name}' embeds plaintext {label.lower()} '{key}'. "
                                    "Committing compose files with secrets risks leaking production database or API credentials."
                                ),
                                evidence=masked,
                                why_it_matters=(
                                    "Source code repositories and CI logs frequently leak versioned compose files. "
                                    "Embedded credentials provide zero defense against unauthorized repository viewers."
                                ),
                                remediation=f"Reference secret using environment variable interpolation: '{key}: ${{'{key}'}}'.",
                                code_diff=CodeDiff(
                                    language="yaml",
                                    insecure=f"  {svc_name}:\n    environment:\n      {key}: {val}",
                                    recommended=f"  {svc_name}:\n    environment:\n      {key}: ${{{key}}}",
                                    trade_offs="Requires providing a local .env file (added to .gitignore) or export in host shell.",
                                ),
                                documentation_url="https://docs.docker.com/compose/environment-variables/set-environment-variables/",
                                status="OPEN",
                                created_at=datetime.utcnow().isoformat() + "Z",
                                auto_fixable=True,
                                remediation_action="sanitize_secret",
                            )
                        )
        return findings
