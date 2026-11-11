from dataclasses import dataclass, field, asdict
from typing import List, Optional, Dict, Any
from enum import Enum


class Severity(str, Enum):
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"
    INFO = "INFO"


class FindingStatus(str, Enum):
    OPEN = "OPEN"
    RESOLVED = "RESOLVED"
    IGNORED = "IGNORED"


class FindingCategory(str, Enum):
    IDENTITY = "IDENTITY"
    PRIVILEGES = "PRIVILEGES"
    VOLUMES = "VOLUMES"
    CAPABILITIES = "CAPABILITIES"
    NETWORK = "NETWORK"
    FILESYSTEM = "FILESYSTEM"
    RELIABILITY = "RELIABILITY"


class ResourceType(str, Enum):
    DOCKERFILE = "dockerfile"
    COMPOSE_SERVICE = "compose_service"
    CONTAINER = "container"


class ScanType(str, Enum):
    COMPOSE = "compose"
    DOCKERFILE = "dockerfile"
    RUNTIME = "runtime"


@dataclass
class CodeDiff:
    language: str
    insecure: str
    recommended: str
    trade_offs: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class Finding:
    id: str
    rule_id: str
    title: str
    severity: str
    category: str
    resource: str
    resource_type: str
    source: str
    line: Optional[int]
    message: str
    evidence: str
    why_it_matters: str
    remediation: str
    code_diff: Optional[CodeDiff]
    documentation_url: str
    status: str = "OPEN"
    created_at: str = ""

    def to_dict(self) -> Dict[str, Any]:
        data = asdict(self)
        return data


@dataclass
class ContainerPort:
    container_port: int
    host_port: int
    protocol: str = "tcp"
    host_ip: str = "0.0.0.0"
    is_public: bool = True


@dataclass
class ContainerMount:
    source: str
    destination: str
    mode: str
    rw: bool = True
    propagation: str = "rprivate"
    is_sensitive: bool = False


@dataclass
class Container:
    id: str
    name: str
    image: str
    status: str
    created: str
    is_root: bool
    user: str
    privileged: bool
    read_only_rootfs: bool
    cap_add: List[str] = field(default_factory=list)
    cap_drop: List[str] = field(default_factory=list)
    mounts: List[ContainerMount] = field(default_factory=list)
    ports: List[ContainerPort] = field(default_factory=list)
    findings_count: int = 0

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class Scan:
    id: str
    target: str
    scan_type: str
    status: str
    started_at: str
    completed_at: str
    duration_seconds: float
    resources_count: int
    findings_count: Dict[str, int]
    initiated_by: str = "manual"

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class SecurityRule:
    id: str
    title: str
    description: str
    severity: str
    category: str
    benchmark_id: str
    enabled: bool = True
    code: Optional[str] = None
    cis_benchmark: Optional[str] = None
    rationale: Optional[str] = None
    impact: Optional[str] = None
    remediation_summary: Optional[str] = None
    applicable_to: List[str] = field(default_factory=lambda: ["dockerfile", "compose", "runtime"])

    def __post_init__(self):
        if not self.code:
            self.code = self.id
        if not self.cis_benchmark:
            self.cis_benchmark = self.benchmark_id
        if not self.rationale:
            self.rationale = self.description
        if not self.remediation_summary:
            self.remediation_summary = self.description

    def to_dict(self) -> Dict[str, Any]:
        data = asdict(self)
        if not data.get("code"):
            data["code"] = self.id
        if not data.get("cis_benchmark"):
            data["cis_benchmark"] = self.benchmark_id
        if not data.get("applicable_to"):
            data["applicable_to"] = ["dockerfile", "compose", "runtime"]
        return data


@dataclass
class FindingsSummary:
    critical: int
    high: int
    medium: int
    low: int
    info: int


@dataclass
class CategoryPosture:
    name: str
    pass_rate: int
    violations: int
    color: str


@dataclass
class TopIssue:
    rule_id: str
    title: str
    category: str
    severity: str
    count: int


@dataclass
class DashboardStats:
    security_score: int
    containers_total: int
    containers_running: int
    scanned_resources: int
    findings_summary: FindingsSummary
    category_posture: List[CategoryPosture]
    top_issues: List[TopIssue]
    recent_scans: List[Scan]

