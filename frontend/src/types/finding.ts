export type Severity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO";

export type FindingStatus = "OPEN" | "RESOLVED" | "IGNORED";

export type ResourceType = "dockerfile" | "compose_service" | "container";

export type FindingCategory =
  | "IDENTITY"
  | "PRIVILEGES"
  | "VOLUMES"
  | "CAPABILITIES"
  | "NETWORK"
  | "FILESYSTEM"
  | "RELIABILITY";

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
}
