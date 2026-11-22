export type Severity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO";

export type FindingStatus = "OPEN" | "RESOLVED" | "IGNORED" | "REMEDIATED";

export type ResourceType = "dockerfile" | "compose_service" | "container";

export type FindingCategory =
  | "IDENTITY"
  | "PRIVILEGES"
  | "VOLUMES"
  | "CAPABILITIES"
  | "NETWORK"
  | "FILESYSTEM"
  | "RELIABILITY"
  | "SUPPLY_CHAIN"
  | "SECRETS";

export interface CodeDiff {
  language: "dockerfile" | "yaml" | "bash";
  insecure: string;
  recommended: string;
  trade_offs?: string;
}

export interface Finding {
  id: string;
  rule_id: string;
  title: string;
  severity: Severity;
  status: FindingStatus;
  resource_type: ResourceType;
  resource: string;
  source: string;
  line?: number;
  message: string;
  why_it_matters: string;
  evidence: string;
  remediation: string;
  code_diff?: CodeDiff;
  category: FindingCategory;
  cis_reference?: string;
  documentation_url: string;
  detected_at: string;
  auto_fixable?: boolean;
  remediation_action?: string;
  backup_path?: string;
}

export interface ImageAdvisorItem {
  id: string;
  current_image: string;
  target_resource: string;
  source_file: string;
  current_size_mb: number;
  current_cve_estimate: number;
  recommended_image: string;
  recommended_size_mb: number;
  recommended_cve_estimate: number;
  size_reduction_pct: number;
  cve_reduction_pct: number;
  risk_level: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  remediation_status: "PENDING" | "REMEDIATED";
  finding_id?: string;
}
