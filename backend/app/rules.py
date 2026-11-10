from typing import List, Dict
from .models import SecurityRule

DEFAULT_RULES: List[SecurityRule] = [
    SecurityRule(
        id="DS001",
        title="Container process running with root privileges (UID 0)",
        description="A container process executing as root (UID 0) inside the container dramatically expands the blast radius if compromised.",
        severity="HIGH",
        category="IDENTITY",
        benchmark_id="CIS-Docker-4.1",
        enabled=True,
    ),
    SecurityRule(
        id="DS002",
        title="Privileged mode enabled on container runtime",
        description="Privileged containers inherit full device access and host capabilities, virtually bypassing all container isolation.",
        severity="CRITICAL",
        category="PRIVILEGES",
        benchmark_id="CIS-Docker-5.4",
        enabled=True,
    ),
    SecurityRule(
        id="DS003",
        title="Host Docker socket or sensitive directory mounted into container",
        description="Mounting /var/run/docker.sock or host root directories exposes the entire host daemon and filesystem to container takeover.",
        severity="CRITICAL",
        category="VOLUMES",
        benchmark_id="CIS-Docker-5.31",
        enabled=True,
    ),
    SecurityRule(
        id="DS004",
        title="Dangerous Linux capability granted (e.g. CAP_SYS_ADMIN)",
        description="Granting broad Linux capabilities allows the container process to alter kernel structures, trace other processes, or escape.",
        severity="HIGH",
        category="CAPABILITIES",
        benchmark_id="CIS-Docker-5.3",
        enabled=True,
    ),
    SecurityRule(
        id="DS005",
        title="Service bound to public 0.0.0.0 without localhost restriction",
        description="Exposing internal databases or admin ports to 0.0.0.0 opens access to any machine on the network without firewall isolation.",
        severity="MEDIUM",
        category="NETWORK",
        benchmark_id="CIS-Docker-5.13",
        enabled=True,
    ),
    SecurityRule(
        id="DS006",
        title="Container root filesystem is writable instead of read-only",
        description="Writable root filesystems enable attackers to download payloads, tamper with system binaries, or persist malware.",
        severity="MEDIUM",
        category="FILESYSTEM",
        benchmark_id="CIS-Docker-5.12",
        enabled=True,
    ),
    SecurityRule(
        id="DS007",
        title="Missing container HEALTHCHECK instruction",
        description="Without health checks, unresponsive, hanging, or subverted containers remain in the load-balancer rotation undetected.",
        severity="LOW",
        category="RELIABILITY",
        benchmark_id="CIS-Docker-4.6",
        enabled=True,
    ),
    SecurityRule(
        id="DS008",
        title="Unbounded memory and CPU resource limits",
        description="Omitting resource constraints allows runaway processes or denial-of-service exploits to exhaust host system resources.",
        severity="LOW",
        category="RELIABILITY",
        benchmark_id="CIS-Docker-5.10",
        enabled=True,
    ),
]

RULES_MAP: Dict[str, SecurityRule] = {r.id: r for r in DEFAULT_RULES}
