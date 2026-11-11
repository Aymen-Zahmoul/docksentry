import { ScanFindingsCount } from "./scan";

export type FindingsSummary = ScanFindingsCount;

export interface CategoryPosture {
  name: string;
  pass_rate: number;
  violations: number;
  color: string;
}

export interface TopIssue {
  rule_id: string;
  title: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  count: number;
  category: string;
}

export interface DashboardStats {
  docker_connected: boolean;
  docker_version?: string;
  docker_endpoint: string;
  containers_total: number;
  containers_running: number;
  scanned_resources: number;
  scans_total: number;
  security_score: number; // 0 - 100 calculated hardening grade
  findings_summary: FindingsSummary;
  category_posture?: CategoryPosture[];
  last_scan_time: string;
  top_issues: TopIssue[];
}
