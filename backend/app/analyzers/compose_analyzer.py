import os
import yaml
from typing import List, Dict, Any, Optional
from datetime import datetime
from ..models import Finding, CodeDiff, ResourceType, Severity, FindingCategory


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
                )
            )
            return findings

        if not isinstance(content, dict) or "services" not in content:
            return findings

        services: Dict[str, Any] = content.get("services", {})

        for svc_name, svc in services.items():
            if not isinstance(svc, dict):
                continue

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
                        why_it_matters="Privileged mode disables the Linux seccomp profile, AppArmor/SELinux protections, and passes all host devices directly into the container. An attacker can escape to host root in seconds.",
                        remediation="Remove 'privileged: true'. If specific kernel features are needed, grant only the granular Linux capabilities required via 'cap_add'.",
                        code_diff=CodeDiff(
                            language="yaml",
                            insecure=f"services:\n  {svc_name}:\n    image: nginx:alpine\n    privileged: true",
                            recommended=f"services:\n  {svc_name}:\n    image: nginx:alpine\n    privileged: false\n    cap_drop:\n      - ALL\n    cap_add:\n      - NET_BIND_SERVICE",
                            trade_offs="Removing privileged mode prevents low-level device access. Test whether application actually needs raw hardware or socket access."
                        ),
                        documentation_url="https://docs.docker.com/engine/reference/run/#runtime-privilege-and-linux-capabilities",
                        status="OPEN",
                        created_at=datetime.utcnow().isoformat() + "Z",
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
                            why_it_matters="Mounting /var/run/docker.sock or host root directories gives the container full administrative control over the host Docker daemon or raw filesystem.",
                            remediation="Do not mount the Docker socket or host root. For Docker management, use an isolated proxy (e.g. docker-socket-proxy) with strict read-only filter rules.",
                            code_diff=CodeDiff(
                                language="yaml",
                                insecure=f"services:\n  {svc_name}:\n    volumes:\n      - /var/run/docker.sock:/var/run/docker.sock",
                                recommended=f"services:\n  {svc_name}:\n    # Connect to authenticated TCP socket or socket-proxy\n    environment:\n      - DOCKER_HOST=tcp://socket-proxy:2375\n    networks:\n      - internal_mgmt",
                                trade_offs="Requires deploying a socket proxy container to filter API endpoints or re-architecting to avoid host daemon access."
                            ),
                            documentation_url="https://docs.docker.com/storage/volumes/",
                            status="OPEN",
                            created_at=datetime.utcnow().isoformat() + "Z",
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
                            why_it_matters=f"Capability CAP_{cap_upper} enables processes to bypass DAC checks, trace host processes, or mount filesystems, significantly elevating breakout potential.",
                            remediation="Drop ALL capabilities by default, then selectively add only the minimum required capabilities.",
                            code_diff=CodeDiff(
                                language="yaml",
                                insecure=f"services:\n  {svc_name}:\n    cap_add:\n      - {cap}",
                                recommended=f"services:\n  {svc_name}:\n    cap_drop:\n      - ALL\n    cap_add:\n      - NET_BIND_SERVICE",
                                trade_offs="Dropping capabilities may cause legacy binaries or diagnostic tools (ping, strace) to fail if they rely on elevated kernel hooks."
                            ),
                            documentation_url="https://docs.docker.com/engine/reference/run/#runtime-privilege-and-linux-capabilities",
                            status="OPEN",
                            created_at=datetime.utcnow().isoformat() + "Z",
                        )
                    )

            # 4. Insecure Port Bindings (DS005)
            ports = svc.get("ports", [])
            for p in ports:
                p_str = str(p)
                is_public = False
                host_port = None

                # Formats: "8080:80", "0.0.0.0:8080:80", "127.0.0.1:8080:80"
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

                if is_public and host_port in self.DATABASE_PORTS:
                    findings.append(
                        Finding(
                            id=f"f-port-{svc_name}-{host_port}",
                            rule_id="DS005",
                            title=f"Internal Database Port {host_port} Bound Publicly (0.0.0.0)",
                            severity="HIGH",
                            category="NETWORK",
                            resource=f"service:{svc_name}",
                            resource_type=ResourceType.COMPOSE_SERVICE.value,
                            source=self.filepath,
                            line=None,
                            message=f"Service '{svc_name}' binds database port {host_port} to 0.0.0.0 across all host network interfaces.",
                            evidence=f"ports: [ \"{p_str}\" ]",
                            why_it_matters="Publicly exposing database services bypasses network boundary controls, inviting brute-force and remote exploitation from external networks.",
                            remediation="Bind database ports to localhost (127.0.0.1) for local debugging, or omit host port binding completely and rely on Compose private networks.",
                            code_diff=CodeDiff(
                                language="yaml",
                                insecure=f"services:\n  {svc_name}:\n    ports:\n      - \"{p_str}\"",
                                recommended=f"services:\n  {svc_name}:\n    # Bind to loopback only\n    ports:\n      - \"127.0.0.1:{host_port}:{host_port}\"",
                                trade_offs="External workstations or host tools cannot connect directly without SSH tunneling or port forwarding."
                            ),
                            documentation_url="https://docs.docker.com/network/#published-ports",
                            status="OPEN",
                            created_at=datetime.utcnow().isoformat() + "Z",
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
                        why_it_matters="An immutable root filesystem prevents attackers from overwriting libraries, injecting webshells, or persisting malware across restarts.",
                        remediation="Set 'read_only: true' and mount in-memory tmpfs volumes for ephemeral paths like /tmp and /run.",
                        code_diff=CodeDiff(
                            language="yaml",
                            insecure=f"services:\n  {svc_name}:\n    image: nginx:alpine",
                            recommended=f"services:\n  {svc_name}:\n    image: nginx:alpine\n    read_only: true\n    tmpfs:\n      - /tmp:rw,noexec,nosuid,size=64m\n      - /var/run:rw,noexec,nosuid,size=16m",
                            trade_offs="Applications that write cache, temporary files, or logs to disk will fail unless corresponding directories are mounted as tmpfs or named volumes."
                        ),
                        documentation_url="https://docs.docker.com/engine/reference/run/#prevent-container-from-modifying-its-own-image",
                        status="OPEN",
                        created_at=datetime.utcnow().isoformat() + "Z",
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
                        why_it_matters="A memory leak or denial-of-service attack inside the container can consume all available host memory, causing the host Linux kernel OOM-killer to terminate critical processes.",
                        remediation="Define explicit CPU and memory constraints in Compose configuration.",
                        code_diff=CodeDiff(
                            language="yaml",
                            insecure=f"services:\n  {svc_name}:\n    image: node:20-alpine",
                            recommended=f"services:\n  {svc_name}:\n    image: node:20-alpine\n    deploy:\n      resources:\n        limits:\n          cpus: '1.0'\n          memory: 512M\n        reservations:\n          memory: 128M",
                            trade_offs="Workloads that exceed configured memory limits will be terminated with exit code 137 (OOMKilled)."
                        ),
                        documentation_url="https://docs.docker.com/compose/compose-file/deploy/#resources",
                        status="OPEN",
                        created_at=datetime.utcnow().isoformat() + "Z",
                    )
                )

        return findings
