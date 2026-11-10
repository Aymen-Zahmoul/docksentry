import { Finding } from "../types/finding";
import { Container } from "../types/container";
import { Scan } from "../types/scan";
import { SecurityRule } from "../types/rule";
import { DashboardStats } from "../types/dashboard";

export const mockDashboardStats: DashboardStats = {
  docker_connected: true,
  docker_version: "27.3.1-ce",
  docker_endpoint: "unix:///var/run/docker.sock",
  containers_total: 14,
  containers_running: 11,
  scanned_resources: 28,
  scans_total: 42,
  security_score: 68,
  findings_summary: {
    critical: 3,
    high: 6,
    medium: 9,
    low: 4,
    info: 2,
  },
  last_scan_time: "2026-11-10T14:15:00Z",
  top_issues: [
    {
      rule_id: "DS002",
      title: "Privileged container execution",
      severity: "CRITICAL",
      count: 2,
      category: "PRIVILEGES",
    },
    {
      rule_id: "DS003",
      title: "Sensitive host socket mounted (/var/run/docker.sock)",
      severity: "CRITICAL",
      count: 2,
      category: "VOLUMES",
    },
    {
      rule_id: "DS001",
      title: "Container process runs as root (UID 0)",
      severity: "HIGH",
      count: 5,
      category: "IDENTITY",
    },
    {
      rule_id: "DS004",
      title: "Dangerous Linux capability granted (CAP_SYS_ADMIN)",
      severity: "HIGH",
      count: 3,
      category: "CAPABILITIES",
    },
    {
      rule_id: "DS005",
      title: "Database port exposed on 0.0.0.0 wildcard",
      severity: "MEDIUM",
      count: 4,
      category: "NETWORK",
    },
  ],
};

export const mockFindings: Finding[] = [
  {
    id: "finding-001",
    rule_id: "DS002",
    title: "Privileged container enabled",
    severity: "CRITICAL",
    status: "OPEN",
    resource_type: "compose_service",
    resource: "db-admin",
    source: "docker-compose.yml",
    line: 28,
    message: "Service 'db-admin' specifies 'privileged: true', effectively disabling container isolation boundaries.",
    why_it_matters: "Privileged containers give full root access to the host kernel, bypass AppArmor/SELinux profiles, and make all host devices (/dev) accessible within the container. An attacker who executes code inside this container can instantly escape to the host root.",
    evidence: "privileged: true",
    remediation: "Disable privileged mode and grant only the specific Linux capabilities and device mappings required by the workload.",
    category: "PRIVILEGES",
    cis_reference: "CIS Docker Benchmark 5.4",
    documentation_url: "https://docs.docker.com/engine/security/security/#privileged-containers",
    detected_at: "2026-11-10T14:15:00Z",
    code_diff: {
      language: "yaml",
      insecure: `services:
  db-admin:
    image: mysql/mysql-server:8.0
    privileged: true # ⚠️ Grants unrestricted host device & kernel access`,
      recommended: `services:
  db-admin:
    image: mysql/mysql-server:8.0
    privileged: false
    security_opt:
      - no-new-privileges:true
    cap_drop:
      - ALL
    cap_add:
      - CHOWN
      - SETUID
      - SETGID`,
      trade_offs: "If this container genuinely requires raw disk or network device manipulation (e.g. VPN or virtualization), map only specific devices with 'devices:' rather than blanket privileged mode.",
    },
  },
  {
    id: "finding-002",
    rule_id: "DS003",
    title: "Docker daemon socket mounted into container",
    severity: "CRITICAL",
    status: "OPEN",
    resource_type: "compose_service",
    resource: "ci-runner",
    source: "docker-compose.yml",
    line: 54,
    message: "Host Docker socket '/var/run/docker.sock' is mounted into container filesystem without read-only restrictions.",
    why_it_matters: "Access to the Docker socket allows any process inside the container to command the host Docker daemon. An attacker can instruct the daemon to launch a new privileged container mounting the host's root filesystem '/' and gain complete root control of the host machine.",
    evidence: "volumes: ['/var/run/docker.sock:/var/run/docker.sock']",
    remediation: "Avoid mounting the Docker socket. If building images is necessary, use rootless build tools like Kaniko, Buildah, or a dedicated remote builder with mTLS.",
    category: "VOLUMES",
    cis_reference: "CIS Docker Benchmark 5.30",
    documentation_url: "https://docs.docker.com/engine/security/protect-access/",
    detected_at: "2026-11-10T14:15:00Z",
    code_diff: {
      language: "yaml",
      insecure: `services:
  ci-runner:
    image: runner:latest
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock # ⚠️ Critical host takeover vector`,
      recommended: `services:
  ci-runner:
    image: gcr.io/kaniko-project/executor:latest
    # Or connect to a secure remote TCP socket with client certificates:
    environment:
      - DOCKER_HOST=tcp://docker-builder.internal:2376
      - DOCKER_TLS_VERIFY=1`,
      trade_offs: "Migrating from Docker-in-Docker socket mounting to Kaniko or rootless podman requires adapting build scripts, but closes the highest-risk breakout vector.",
    },
  },
  {
    id: "finding-003",
    rule_id: "DS001",
    title: "Container process runs as root (UID 0)",
    severity: "HIGH",
    status: "OPEN",
    resource_type: "dockerfile",
    resource: "api-backend",
    source: "Dockerfile.api",
    line: 14,
    message: "No non-root 'USER' instruction specified. Container entrypoint runs with root (UID 0) privileges.",
    why_it_matters: "Running as root violates the principle of least privilege. If the application has a command injection, remote code execution, or path traversal vulnerability, the attacker inherits root execution capabilities within the container namespace.",
    evidence: "Missing 'USER' instruction before CMD [\"python\", \"app.py\"]",
    remediation: "Create a dedicated non-root service account in the image and switch to it using the 'USER' directive before runtime instructions.",
    category: "IDENTITY",
    cis_reference: "CIS Docker Benchmark 4.1, 5.25",
    documentation_url: "https://docs.docker.com/engine/develop/develop-images/instructions/#user",
    detected_at: "2026-11-10T14:15:00Z",
    code_diff: {
      language: "dockerfile",
      insecure: `FROM python:3.12-slim
WORKDIR /app
COPY . .
# ⚠️ No USER instruction: defaults to root (UID 0)
CMD ["python", "app.py"]`,
      recommended: `FROM python:3.12-slim
# Create unprivileged system user and group
RUN groupadd -r appuser && useradd -r -g appuser -d /app -s /sbin/nologin appuser
WORKDIR /app
COPY --chown=appuser:appuser . .
USER appuser
CMD ["python", "app.py"]`,
      trade_offs: "Ensure all application directories that require write operations (such as logs or uploads) have permissions assigned to 'appuser' during build.",
    },
  },
  {
    id: "finding-004",
    rule_id: "DS004",
    title: "Dangerous Linux capability added (CAP_SYS_ADMIN)",
    severity: "HIGH",
    status: "OPEN",
    resource_type: "container",
    resource: "log-collector-prod",
    source: "live:container:7c92bfa4",
    message: "Container has been granted 'CAP_SYS_ADMIN', which provides broad administrative and namespace manipulation permissions.",
    why_it_matters: "CAP_SYS_ADMIN is often called 'the new root' because it enables filesystem mounting, cgroups modification, BPF tracing, and namespace cloning. It frequently allows privilege escalation to the host kernel.",
    evidence: "CapAdd: [\"SYS_ADMIN\"]",
    remediation: "Drop all default capabilities with '--cap-drop=ALL' and only whitelist the granular capabilities strictly necessary for the application.",
    category: "CAPABILITIES",
    cis_reference: "CIS Docker Benchmark 5.20",
    documentation_url: "https://man7.org/linux/man-pages/man7/capabilities.7.html",
    detected_at: "2026-11-10T14:15:00Z",
    code_diff: {
      language: "yaml",
      insecure: `services:
  log-collector:
    image: fluent/fluent-bit:latest
    cap_add:
      - SYS_ADMIN # ⚠️ Equivalent to partial host root`,
      recommended: `services:
  log-collector:
    image: fluent/fluent-bit:latest
    cap_drop:
      - ALL
    cap_add:
      - DAC_READ_SEARCH # Sufficient to read log files without administrative power`,
      trade_offs: "Investigate whether the application only needs to read logs (DAC_READ_SEARCH) rather than full kernel manipulation.",
    },
  },
  {
    id: "finding-005",
    rule_id: "DS005",
    title: "Database port bound to public interface (0.0.0.0)",
    severity: "MEDIUM",
    status: "OPEN",
    resource_type: "compose_service",
    resource: "postgres-primary",
    source: "docker-compose.yml",
    line: 18,
    message: "Port 5432 is published to '0.0.0.0:5432:5432', exposing the database across all host network adapters.",
    why_it_matters: "Binding ports to 0.0.0.0 bypasses normal internal Docker network isolation and can expose the service to the local LAN or the public internet if the host firewall is not strictly configured.",
    evidence: "ports: ['0.0.0.0:5432:5432']",
    remediation: "Bind sensitive services to localhost ('127.0.0.1') for local debugging, or omit host port publishing entirely and rely on internal Docker network bridges.",
    category: "NETWORK",
    cis_reference: "Docker Networking Security Best Practices",
    documentation_url: "https://docs.docker.com/engine/network/#published-ports",
    detected_at: "2026-11-10T14:15:00Z",
    code_diff: {
      language: "yaml",
      insecure: `services:
  postgres:
    image: postgres:16-alpine
    ports:
      - "0.0.0.0:5432:5432" # ⚠️ Exposed to all network interfaces`,
      recommended: `services:
  postgres:
    image: postgres:16-alpine
    ports:
      - "127.0.0.1:5432:5432" # Accessible only from host loopback
    # OR remove ports entirely if only accessed by other containers:
    # networks:
    #   - backend-mesh`,
      trade_offs: "Binding to 127.0.0.1 prevents team members on other computers on the LAN from connecting directly, but prevents inadvertent WAN exposure.",
    },
  },
  {
    id: "finding-006",
    rule_id: "DS006",
    title: "Container root filesystem is writable",
    severity: "MEDIUM",
    status: "OPEN",
    resource_type: "compose_service",
    resource: "web-frontend",
    source: "docker-compose.yml",
    line: 8,
    message: "Container filesystem does not enforce 'read_only: true'. Malicious processes can alter binary files or persist malware.",
    why_it_matters: "An attacker who achieves arbitrary code execution can download tools, modify configuration files, or inject trojans into the container filesystem. An immutable read-only rootfs prevents on-disk tampering.",
    evidence: "read_only: false (or omitted default)",
    remediation: "Enable 'read_only: true' on the container and use explicit temporary volumes (tmpfs) for directories that require transient writes like /tmp or /run.",
    category: "FILESYSTEM",
    cis_reference: "CIS Docker Benchmark 5.12",
    documentation_url: "https://docs.docker.com/engine/security/security/#read-only-containers",
    detected_at: "2026-11-10T14:15:00Z",
    code_diff: {
      language: "yaml",
      insecure: `services:
  web-frontend:
    image: nginx:alpine
    # ⚠️ Writable root filesystem by default`,
      recommended: `services:
  web-frontend:
    image: nginx:alpine
    read_only: true
    tmpfs:
      - /var/cache/nginx
      - /var/run
      - /tmp`,
      trade_offs: "Applications that write state to disk must have designated tmpfs mounts or persistent volumes configured for those specific paths.",
    },
  },
  {
    id: "finding-007",
    rule_id: "DS007",
    title: "Host root directory mounted (/host)",
    severity: "CRITICAL",
    status: "RESOLVED",
    resource_type: "compose_service",
    resource: "backup-agent",
    source: "docker-compose.yml",
    line: 82,
    message: "Root directory of host ('/') is mounted into '/host' inside the container with write access.",
    why_it_matters: "Full host mount bypasses all isolation. The container has direct access to /etc/shadow, SSH keys, cron jobs, and host system binaries.",
    evidence: "volumes: ['/:/host:rw']",
    remediation: "Mount only the specific directories required for backup, and mount them as read-only (':ro').",
    category: "VOLUMES",
    cis_reference: "CIS Docker Benchmark 5.30",
    documentation_url: "https://docs.docker.com/engine/storage/volumes/",
    detected_at: "2026-11-10T11:00:00Z",
  },
  {
    id: "finding-008",
    rule_id: "DS008",
    title: "Missing HEALTHCHECK instruction",
    severity: "LOW",
    status: "OPEN",
    resource_type: "dockerfile",
    resource: "cache-redis",
    source: "Dockerfile.redis",
    line: 9,
    message: "Image does not define a HEALTHCHECK instruction for proactive container health monitoring.",
    why_it_matters: "Without health checks, Docker cannot determine whether an unresponsive service inside the container has frozen, potentially routing traffic to a dead instance.",
    evidence: "HEALTHCHECK instruction not found",
    remediation: "Add a HEALTHCHECK instruction checking the responsive status of the service.",
    category: "RELIABILITY",
    cis_reference: "CIS Docker Benchmark 4.6",
    documentation_url: "https://docs.docker.com/engine/reference/builder/#healthcheck",
    detected_at: "2026-11-10T14:15:00Z",
    code_diff: {
      language: "dockerfile",
      insecure: `FROM redis:7-alpine
EXPOSE 6379
CMD ["redis-server"]`,
      recommended: `FROM redis:7-alpine
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \\
  CMD redis-cli ping || exit 1
EXPOSE 6379
CMD ["redis-server"]`,
    },
  },
];

export const mockContainers: Container[] = [
  {
    id: "c-01",
    name: "db-admin",
    image: "mysql/mysql-server:8.0",
    status: "running",
    created_at: "2026-11-09T08:00:00Z",
    user: "root",
    is_root: true,
    privileged: true,
    read_only_rootfs: false,
    network_mode: "bridge",
    ports: [
      { host_ip: "0.0.0.0", host_port: 3306, container_port: 3306, protocol: "tcp", is_public: true },
    ],
    mounts: [
      { source: "/var/lib/mysql", destination: "/var/lib/mysql", mode: "rw", is_sensitive: false },
    ],
    capabilities_added: ["SYS_ADMIN"],
    capabilities_dropped: [],
    findings_count: { critical: 1, high: 1, medium: 1, low: 0 },
    last_scan: "2026-11-10T14:15:00Z",
  },
  {
    id: "c-02",
    name: "ci-runner",
    image: "gitlab/gitlab-runner:latest",
    status: "running",
    created_at: "2026-11-08T12:30:00Z",
    user: "root",
    is_root: true,
    privileged: false,
    read_only_rootfs: false,
    network_mode: "bridge",
    ports: [],
    mounts: [
      { source: "/var/run/docker.sock", destination: "/var/run/docker.sock", mode: "rw", is_sensitive: true },
    ],
    capabilities_added: [],
    capabilities_dropped: [],
    findings_count: { critical: 1, high: 1, medium: 0, low: 0 },
    last_scan: "2026-11-10T14:15:00Z",
  },
  {
    id: "c-03",
    name: "api-backend",
    image: "docksentry/api:v1.2",
    status: "running",
    created_at: "2026-11-10T09:00:00Z",
    user: "root",
    is_root: true,
    privileged: false,
    read_only_rootfs: false,
    network_mode: "app-net",
    ports: [
      { host_ip: "127.0.0.1", host_port: 8080, container_port: 8000, protocol: "tcp", is_public: false },
    ],
    mounts: [
      { source: "/app/data", destination: "/data", mode: "rw", is_sensitive: false },
    ],
    capabilities_added: [],
    capabilities_dropped: [],
    findings_count: { critical: 0, high: 1, medium: 1, low: 1 },
    last_scan: "2026-11-10T14:15:00Z",
  },
  {
    id: "c-04",
    name: "log-collector-prod",
    image: "fluent/fluent-bit:latest",
    status: "running",
    created_at: "2026-11-07T14:20:00Z",
    user: "fluentbit",
    is_root: false,
    privileged: false,
    read_only_rootfs: true,
    network_mode: "bridge",
    ports: [
      { host_ip: "127.0.0.1", host_port: 2020, container_port: 2020, protocol: "tcp", is_public: false },
    ],
    mounts: [
      { source: "/var/log", destination: "/var/log", mode: "ro", is_sensitive: true },
    ],
    capabilities_added: ["SYS_ADMIN"],
    capabilities_dropped: ["ALL"],
    findings_count: { critical: 0, high: 1, medium: 0, low: 0 },
    last_scan: "2026-11-10T14:15:00Z",
  },
  {
    id: "c-05",
    name: "web-frontend",
    image: "nginx:1.27-alpine",
    status: "running",
    created_at: "2026-11-10T10:00:00Z",
    user: "nginx",
    is_root: false,
    privileged: false,
    read_only_rootfs: false,
    network_mode: "bridge",
    ports: [
      { host_ip: "0.0.0.0", host_port: 80, container_port: 80, protocol: "tcp", is_public: true },
      { host_ip: "0.0.0.0", host_port: 443, container_port: 443, protocol: "tcp", is_public: true },
    ],
    mounts: [],
    capabilities_added: [],
    capabilities_dropped: ["ALL"],
    findings_count: { critical: 0, high: 0, medium: 1, low: 0 },
    last_scan: "2026-11-10T14:15:00Z",
  },
  {
    id: "c-06",
    name: "redis-cache",
    image: "redis:7-alpine",
    status: "running",
    created_at: "2026-11-10T11:45:00Z",
    user: "redis",
    is_root: false,
    privileged: false,
    read_only_rootfs: true,
    network_mode: "app-net",
    ports: [
      { host_ip: "127.0.0.1", host_port: 6379, container_port: 6379, protocol: "tcp", is_public: false },
    ],
    mounts: [],
    capabilities_added: [],
    capabilities_dropped: ["ALL"],
    findings_count: { critical: 0, high: 0, medium: 0, low: 1 },
    last_scan: "2026-11-10T14:15:00Z",
  },
];

export const mockScans: Scan[] = [
  {
    id: "scan-042",
    scan_type: "compose",
    target: "./docker-compose.yml",
    status: "COMPLETED",
    started_at: "2026-11-10T14:14:48Z",
    completed_at: "2026-11-10T14:15:00Z",
    duration_seconds: 12,
    findings_count: { critical: 2, high: 3, medium: 4, low: 1, info: 0 },
    resources_analyzed: 6,
    initiated_by: "Manual CLI",
  },
  {
    id: "scan-041",
    scan_type: "runtime",
    target: "Docker Engine (14 containers)",
    status: "COMPLETED",
    started_at: "2026-11-10T13:00:10Z",
    completed_at: "2026-11-10T13:00:32Z",
    duration_seconds: 22,
    findings_count: { critical: 1, high: 2, medium: 3, low: 2, info: 1 },
    resources_analyzed: 14,
    initiated_by: "Scheduled Audit",
  },
  {
    id: "scan-040",
    scan_type: "dockerfile",
    target: "./Dockerfile.api",
    status: "COMPLETED",
    started_at: "2026-11-10T11:20:00Z",
    completed_at: "2026-11-10T11:20:03Z",
    duration_seconds: 3,
    findings_count: { critical: 0, high: 1, medium: 1, low: 1, info: 1 },
    resources_analyzed: 1,
    initiated_by: "GitHub Action CI",
  },
  {
    id: "scan-039",
    scan_type: "all",
    target: "Full Workspace Audit",
    status: "COMPLETED",
    started_at: "2026-11-09T18:00:00Z",
    completed_at: "2026-11-09T18:01:15Z",
    duration_seconds: 75,
    findings_count: { critical: 3, high: 6, medium: 9, low: 4, info: 2 },
    resources_analyzed: 28,
    initiated_by: "Security Admin",
  },
];

export const mockRules: SecurityRule[] = [
  {
    id: "rule-01",
    code: "DS001",
    title: "Ensure container process does not run as root",
    category: "IDENTITY",
    severity: "HIGH",
    cis_benchmark: "CIS Docker 4.1, 5.25",
    description: "Verifies whether a non-root USER instruction or runtime user ID is declared.",
    rationale: "Processes running as root within a container have UID 0, which corresponds to UID 0 on the host unless user namespaces are remapped. Code execution vulnerabilities in the container give immediate root privileges.",
    impact: "High risk of host compromise if container breakout occurs.",
    remediation_summary: "Specify 'USER <user>' in the Dockerfile or 'user: uid:gid' in docker-compose.yml.",
    enabled: true,
    applicable_to: ["dockerfile", "compose", "runtime"],
  },
  {
    id: "rule-02",
    code: "DS002",
    title: "Ensure privileged containers are not used",
    category: "PRIVILEGES",
    severity: "CRITICAL",
    cis_benchmark: "CIS Docker 5.4",
    description: "Checks if the container is run with the '--privileged' flag or 'privileged: true'.",
    rationale: "Privileged mode gives the container all Linux capabilities and disables AppArmor/seccomp filters, allowing unrestricted device access and trivial host breakout.",
    impact: "Direct access to host kernel and storage devices; immediate privilege escalation.",
    remediation_summary: "Remove 'privileged: true'. Grant granular capabilities via 'cap_add' or specific device mappings.",
    enabled: true,
    applicable_to: ["compose", "runtime"],
  },
  {
    id: "rule-03",
    code: "DS003",
    title: "Ensure Docker socket is not mounted into container",
    category: "VOLUMES",
    severity: "CRITICAL",
    cis_benchmark: "CIS Docker 5.30",
    description: "Detects volume mounts exposing /var/run/docker.sock to the container filesystem.",
    rationale: "Access to the Docker daemon socket permits unauthenticated execution of Docker CLI commands, enabling creation of privileged containers with host root mounts.",
    impact: "Complete root takeover of the Docker host.",
    remediation_summary: "Do not mount docker.sock. Use rootless builders like Kaniko or isolated CI agents.",
    enabled: true,
    applicable_to: ["compose", "runtime"],
  },
  {
    id: "rule-04",
    code: "DS004",
    title: "Ensure dangerous Linux capabilities are not added",
    category: "CAPABILITIES",
    severity: "HIGH",
    cis_benchmark: "CIS Docker 5.20",
    description: "Flags addition of CAP_SYS_ADMIN, CAP_NET_ADMIN, CAP_SYS_PTRACE, or CAP_ALL.",
    rationale: "These capabilities permit low-level kernel tracing, raw network interception, and arbitrary filesystem mounting that weaken process isolation.",
    impact: "Attackers can manipulate kernel state or inspect process memory of other tenants.",
    remediation_summary: "Drop all capabilities ('cap_drop: [ALL]') and add only strictly necessary capabilities.",
    enabled: true,
    applicable_to: ["compose", "runtime"],
  },
  {
    id: "rule-05",
    code: "DS005",
    title: "Ensure sensitive services do not bind to 0.0.0.0",
    category: "NETWORK",
    severity: "MEDIUM",
    cis_benchmark: "Docker Security Best Practices",
    description: "Audits port mappings for wildcard host bindings on databases and management interfaces.",
    rationale: "Binding database ports to 0.0.0.0 exposes the service to external network interfaces, potentially exposing it to the WAN or untrusted LAN.",
    impact: "Exposure of sensitive database engines to network brute-forcing and unauthorized queries.",
    remediation_summary: "Bind to '127.0.0.1:<port>:<port>' or use private overlay/bridge networks.",
    enabled: true,
    applicable_to: ["compose", "runtime"],
  },
  {
    id: "rule-06",
    code: "DS006",
    title: "Ensure container root filesystem is mounted as read-only",
    category: "FILESYSTEM",
    severity: "MEDIUM",
    cis_benchmark: "CIS Docker 5.12",
    description: "Checks if the container root filesystem is configured with '--read-only' or 'read_only: true'.",
    rationale: "An immutable container filesystem prevents attackers from writing malicious payload scripts, modifying binaries, or altering configuration files.",
    impact: "Enables persistent compromise and file system tampering within the container.",
    remediation_summary: "Enable 'read_only: true' and use 'tmpfs' for directories requiring ephemeral writes.",
    enabled: true,
    applicable_to: ["compose", "runtime"],
  },
  {
    id: "rule-07",
    code: "DS007",
    title: "Ensure sensitive host directories are not mounted",
    category: "VOLUMES",
    severity: "CRITICAL",
    cis_benchmark: "CIS Docker 5.30",
    description: "Detects mounts of /, /boot, /etc, /proc, /sys, or /root.",
    rationale: "Mounting core host directories grants container workloads direct access to sensitive host secrets, credentials, and kernel parameters.",
    impact: "Host file tampering, credential theft, and system disruption.",
    remediation_summary: "Mount only non-system application data directories, preferably with ':ro'.",
    enabled: true,
    applicable_to: ["compose", "runtime"],
  },
  {
    id: "rule-08",
    code: "DS008",
    title: "Ensure HEALTHCHECK instructions are defined",
    category: "RELIABILITY",
    severity: "LOW",
    cis_benchmark: "CIS Docker 4.6",
    description: "Verifies the presence of a HEALTHCHECK directive to test container availability.",
    rationale: "Without health checks, unresponsive containers may continue to appear operational, causing traffic routing issues.",
    impact: "Service degradation and silent downtime.",
    remediation_summary: "Add 'HEALTHCHECK' to test basic responsiveness.",
    enabled: true,
    applicable_to: ["dockerfile", "compose"],
  },
];
