import os
import yaml
from typing import List, Dict, Any, Optional
from datetime import datetime
from ..models import Finding, CodeDiff, ResourceType, Severity, FindingCategory
from .image_analyzer import ImageSecurityAnalyzer
from .secrets_analyzer import SecretsAnalyzer


class ComposeAnalyzer:
    """Audits Docker Compose configuration files."""

    SENSITIVE_MOUNTS = [
        "/var/run/docker.sock",
        "//./pipe/docker_engine",
        "/",
        "/etc",
        "/proc",
        "/sys",
        "/dev",
        "/boot",
        "/root",
    ]

    DANGEROUS_CAPS = [
        "ALL",
        "SYS_ADMIN",
        "NET_ADMIN",
        "SYS_PTRACE",
        "DAC_OVERRIDE",
        "SYS_RAWIO",
        "SYS_MODULE",
    ]

    DATABASE_PORTS = [5432, 3306, 6379, 27017, 9200, 11211]

    def __init__(self, filepath: str):
        self.filepath = filepath
        self.filename = os.path.basename(filepath)

    def analyze(self) -> List[Finding]:
        findings: List[Finding] = []

        if not os.path.exists(self.filepath):
            return findings

        try:
            with open(self.filepath, "r", encoding="utf-8") as f:
                content = yaml.safe_load(f)
        except Exception as e:
            # Syntax or parsing error
            findings.append(
                Finding(
                    id="f-compose-parse-error",
                    rule_id="DS000",
                    title="Malformed Compose YAML Syntax",
                    severity="HIGH",
                    category="RELIABILITY",
                    resource=self.filename,
                    resource_type=ResourceType.COMPOSE_SERVICE.value,
                    source=self.filepath,
                    line=1,
                    message=f"Failed to parse Compose file: {str(e)}",
                    evidence=str(e),
                    why_it_matters="Invalid YAML prevents automated security auditing and deployment.",
                    remediation="Validate YAML syntax with a linter.",
                    code_diff=None,
                    documentation_url="https://docs.docker.com/compose/compose-file/",
                    status="OPEN",
                    created_at=datetime.utcnow().isoformat() + "Z",
                    auto_fixable=False,
                )
            )
            return findings

        if not isinstance(content, dict) or "services" not in content:
            return findings

        services: Dict[str, Any] = content.get("services", {})

        for svc_name, svc in services.items():
            if not isinstance(svc, dict):
                continue

            # 0. Root User (DS001)
            user_val = str(svc.get("user", "")).strip().lower()
            if not user_val or user_val in ["root", "0", "0:0"]:
                findings.append(
                    Finding(
                        id=f"f-user-{svc_name}",
                        rule_id="DS001",
                        title=f"Service '{svc_name}' Runs Without Least-Privilege User",
                        severity="HIGH",
                        category="IDENTITY",
                        resource=f"service:{svc_name}",
                        resource_type=ResourceType.COMPOSE_SERVICE.value,
                        source=self.filepath,
                        line=None,
                        message=f"Service '{svc_name}' does not specify a non-root 'user:'. Container executes as root (UID 0).",
                        evidence=f"services.{svc_name}.user: {svc.get('user') or 'unset'}",
                        why_it_matters="Containers running with root UID inherit full root permissions inside their namespace.",
                        remediation="Define a non-root user (e.g. user: '10001:10001') in service specification.",
                        code_diff=CodeDiff(
                            language="yaml",
                            insecure=f"services:\n  {svc_name}:\n    image: app:latest",
                            recommended=f"services:\n  {svc_name}:\n    image: app:latest\n    user: '10001:10001'",
                            trade_offs="Service process must have write access to necessary directories."
                        ),
                        documentation_url="https://docs.docker.com/compose/compose-file/05-services/#user",
                        status="OPEN",
                        created_at=datetime.utcnow().isoformat() + "Z",
                        auto_fixable=True,
                        remediation_action="inject_user",
                    )
                )

            # 1. Privileged Mode (DS002)
            if svc.get("privileged") is True:
                findings.append(
                    Finding(
                        id=f"f-priv-{svc_name}",
                        rule_id="DS002",
                        title=f"Service '{svc_name}' Runs in Privileged Mode",
                        severity="CRITICAL",
                        category="PRIVILEGES",
                        resource=f"service:{svc_name}",
                        resource_type=ResourceType.COMPOSE_SERVICE.value,
                        source=self.filepath,
                        line=None,
                        message=f"Service '{svc_name}' specifies 'privileged: true'. This disables container isolation completely.",
                        evidence=f"services.{svc_name}.privileged: true",
                        why_it_matters="Privileged mode disables seccomp and AppArmor/SELinux protections. An attacker can escape to host root in seconds.",
                        remediation="Remove 'privileged: true'. Grant only minimal capabilities via 'cap_add'.",
                        code_diff=CodeDiff(
                            language="yaml",
                            insecure=f"services:\n  {svc_name}:\n    privileged: true",
                            recommended=f"services:\n  {svc_name}:\n    privileged: false\n    cap_drop:\n      - ALL\n    cap_add:\n      - NET_BIND_SERVICE",
                            trade_offs="Removing privileged mode prevents low-level raw host device access."
                        ),
                        documentation_url="https://docs.docker.com/engine/reference/run/#runtime-privilege-and-linux-capabilities",
                        status="OPEN",
                        created_at=datetime.utcnow().isoformat() + "Z",
                        auto_fixable=True,
                        remediation_action="disable_privileged",
                    )
                )

            # 2. Sensitive Volume Mounts (DS003)
            volumes = svc.get("volumes", [])
            for vol in volumes:
                vol_str = str(vol)
                host_path = vol_str.split(":")[0].strip() if ":" in vol_str else vol_str.strip()

                is_sensitive = False
                for sensitive in self.SENSITIVE_MOUNTS:
                    if host_path == sensitive or host_path.startswith(f"{sensitive}/"):
                        is_sensitive = True
                        break

                if is_sensitive:
                    findings.append(
                        Finding(
                            id=f"f-vol-{svc_name}-{len(findings)}",
                            rule_id="DS003",
                            title=f"Sensitive Host Mount in Service '{svc_name}'",
                            severity="CRITICAL",
                            category="VOLUMES",
                            resource=f"service:{svc_name}",
                            resource_type=ResourceType.COMPOSE_SERVICE.value,
                            source=self.filepath,
                            line=None,
                            message=f"Service '{svc_name}' mounts sensitive host path '{host_path}'.",
                            evidence=f"volumes: [ {vol_str} ]",
                            why_it_matters="Mounting /var/run/docker.sock gives the container administrative control over the host Docker daemon.",
                            remediation="Remove host Docker socket mount or use a read-only socket proxy.",
                            code_diff=CodeDiff(
                                language="yaml",
                                insecure=f"services:\n  {svc_name}:\n    volumes:\n      - /var/run/docker.sock:/var/run/docker.sock",
                                recommended=f"services:\n  {svc_name}:\n    # Connect to isolated socket proxy or remove mount",
                                trade_offs="Requires decoupling application from direct host daemon control."
                            ),
                            documentation_url="https://docs.docker.com/storage/volumes/",
                            status="OPEN",
                            created_at=datetime.utcnow().isoformat() + "Z",
                            auto_fixable=True,
                            remediation_action="remove_sensitive_mount",
                        )
                    )

            # 3. Dangerous Capabilities (DS004)
            cap_adds = svc.get("cap_add", [])
            for cap in cap_adds:
                cap_upper = str(cap).upper().replace("CAP_", "")
                if cap_upper in self.DANGEROUS_CAPS or "ALL" in cap_upper:
                    findings.append(
                        Finding(
                            id=f"f-cap-{svc_name}-{cap_upper}",
                            rule_id="DS004",
                            title=f"Dangerous Capability Added: CAP_{cap_upper}",
                            severity="HIGH",
                            category="CAPABILITIES",
                            resource=f"service:{svc_name}",
                            resource_type=ResourceType.COMPOSE_SERVICE.value,
                            source=self.filepath,
                            line=None,
                            message=f"Service '{svc_name}' grants high-risk Linux capability CAP_{cap_upper}.",
                            evidence=f"cap_add: [ {cap} ]",
                            why_it_matters=f"Capability CAP_{cap_upper} enables processes to alter kernel structures or escape sandbox boundaries.",
                            remediation="Drop ALL capabilities by default, then add only required minimal capabilities.",
                            code_diff=CodeDiff(
                                language="yaml",
                                insecure=f"services:\n  {svc_name}:\n    cap_add:\n      - {cap}",
                                recommended=f"services:\n  {svc_name}:\n    cap_drop:\n      - ALL\n    cap_add:\n      - NET_BIND_SERVICE",
                                trade_offs="Dropping capabilities may cause diagnostic tools like ping or strace to fail."
                            ),
                            documentation_url="https://docs.docker.com/engine/reference/run/#runtime-privilege-and-linux-capabilities",
                            status="OPEN",
                            created_at=datetime.utcnow().isoformat() + "Z",
                            auto_fixable=True,
                            remediation_action="remove_dangerous_caps",
                        )
                    )

            # 4. Insecure Port Bindings (DS005)
            ports = svc.get("ports", [])
            for p in ports:
                p_str = str(p)
                is_public = False
                host_port = None

                if "127.0.0.1" in p_str or "localhost" in p_str:
                    is_public = False
                elif "0.0.0.0" in p_str or ":" in p_str:
                    is_public = True
                    parts = p_str.split(":")
                    if len(parts) == 2:
                        try:
                            host_port = int(parts[0])
                        except ValueError:
                            pass
                    elif len(parts) == 3:
                        try:
                            host_port = int(parts[1])
                        except ValueError:
                            pass

                if is_public:
                    findings.append(
                        Finding(
                            id=f"f-port-{svc_name}-{host_port or 'all'}",
                            rule_id="DS005",
                            title=f"Port Binding Bound Publicly (0.0.0.0) in '{svc_name}'",
                            severity="MEDIUM",
                            category="NETWORK",
                            resource=f"service:{svc_name}",
                            resource_type=ResourceType.COMPOSE_SERVICE.value,
                            source=self.filepath,
                            line=None,
                            message=f"Service '{svc_name}' binds port {p_str} across all public network interfaces.",
                            evidence=f"ports: [ \"{p_str}\" ]",
                            why_it_matters="Publicly exposing services to 0.0.0.0 allows unauthenticated access from local network and internet scans.",
                            remediation="Bind service ports strictly to localhost (127.0.0.1).",
                            code_diff=CodeDiff(
                                language="yaml",
                                insecure=f"services:\n  {svc_name}:\n    ports:\n      - \"{p_str}\"",
                                recommended=f"services:\n  {svc_name}:\n    ports:\n      - \"127.0.0.1:{host_port}:{host_port}\"" if host_port else "    ports:\n      - \"127.0.0.1:8080:8080\"",
                                trade_offs="External devices cannot connect directly without reverse proxy or SSH tunneling."
                            ),
                            documentation_url="https://docs.docker.com/network/#published-ports",
                            status="OPEN",
                            created_at=datetime.utcnow().isoformat() + "Z",
                            auto_fixable=True,
                            remediation_action="bind_localhost",
                        )
                    )

            # 5. Read-Only Root Filesystem (DS006)
            if not svc.get("read_only"):
                findings.append(
                    Finding(
                        id=f"f-ro-{svc_name}",
                        rule_id="DS006",
                        title=f"Container Root Filesystem is Writable in '{svc_name}'",
                        severity="MEDIUM",
                        category="FILESYSTEM",
                        resource=f"service:{svc_name}",
                        resource_type=ResourceType.COMPOSE_SERVICE.value,
                        source=self.filepath,
                        line=None,
                        message=f"Service '{svc_name}' has a writable root filesystem. Compromised processes can download payloads or modify system binaries.",
                        evidence=f"services.{svc_name}.read_only: false (or unset)",
                        why_it_matters="An immutable root filesystem prevents attackers from overwriting libraries or persisting malware.",
                        remediation="Set 'read_only: true' and mount in-memory tmpfs volumes for /tmp.",
                        code_diff=CodeDiff(
                            language="yaml",
                            insecure=f"services:\n  {svc_name}:\n    image: app:latest",
                            recommended=f"services:\n  {svc_name}:\n    read_only: true\n    tmpfs:\n      - /tmp",
                            trade_offs="Applications that write cache or logs to disk require tmpfs or named volume mounts."
                        ),
                        documentation_url="https://docs.docker.com/engine/reference/run/#prevent-container-from-modifying-its-own-image",
                        status="OPEN",
                        created_at=datetime.utcnow().isoformat() + "Z",
                        auto_fixable=True,
                        remediation_action="set_readonly_rootfs",
                    )
                )

            # 6. Unbounded Resource Limits (DS008)
            has_limits = False
            deploy = svc.get("deploy", {})
            if isinstance(deploy, dict):
                resources = deploy.get("resources", {})
                if isinstance(resources, dict) and "limits" in resources:
                    has_limits = True
            if "mem_limit" in svc or "cpus" in svc:
                has_limits = True

            if not has_limits:
                findings.append(
                    Finding(
                        id=f"f-res-{svc_name}",
                        rule_id="DS008",
                        title=f"Service '{svc_name}' Lacks Resource Limits",
                        severity="LOW",
                        category="RELIABILITY",
                        resource=f"service:{svc_name}",
                        resource_type=ResourceType.COMPOSE_SERVICE.value,
                        source=self.filepath,
                        line=None,
                        message=f"Service '{svc_name}' does not specify CPU or memory resource limits.",
                        evidence=f"services.{svc_name}.deploy.resources.limits unset",
                        why_it_matters="Memory exhaustion or denial-of-service in a single container can crash the host kernel via OOM-killer.",
                        remediation="Define explicit CPU and memory constraints in Compose configuration.",
                        code_diff=CodeDiff(
                            language="yaml",
                            insecure=f"services:\n  {svc_name}:\n    image: app:latest",
                            recommended=f"services:\n  {svc_name}:\n    deploy:\n      resources:\n        limits:\n          cpus: '0.50'\n          memory: 512M",
                            trade_offs="Workloads that exceed configured memory limits will be terminated (OOMKilled)."
                        ),
                        documentation_url="https://docs.docker.com/compose/compose-file/deploy/#resources",
                        status="OPEN",
                        created_at=datetime.utcnow().isoformat() + "Z",
                        auto_fixable=True,
                        remediation_action="inject_resource_limits",
                    )
                )

        # 7. Image Bloat & CVE Analysis across Compose
        img_findings, _ = ImageSecurityAnalyzer.audit_compose_images(self.filepath, content)
        findings.extend(img_findings)

        # 8. Secret & Credential Analysis across Compose
        sec_findings = SecretsAnalyzer.audit_compose(self.filepath, content)
        findings.extend(sec_findings)

        return findings
