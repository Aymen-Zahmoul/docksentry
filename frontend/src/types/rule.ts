import { Severity, FindingCategory } from "./finding";

export interface SecurityRule {
  id: string;
  code: string; // e.g. DS001
  title: string;
  category: FindingCategory;
  severity: Severity;
  cis_benchmark?: string;
  description: string;
  rationale: string;
  impact: string;
  remediation_summary: string;
  enabled: boolean;
  applicable_to: ("dockerfile" | "compose" | "runtime")[];
}
