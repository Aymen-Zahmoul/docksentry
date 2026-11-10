export type ScanType = "compose" | "dockerfile" | "runtime" | "all";
export type ScanStatus = "QUEUED" | "RUNNING" | "COMPLETED" | "FAILED";

export interface ScanFindingsCount {
  critical: number;
  high: number;
  medium: number;
  low: number;
  info: number;
}

export interface Scan {
  id: string;
  scan_type: ScanType;
  target: string;
  status: ScanStatus;
  started_at: string;
  completed_at?: string;
  duration_seconds?: number;
  findings_count: ScanFindingsCount;
  resources_analyzed: number;
  initiated_by: string;
}

export interface StartScanPayload {
  scan_type: ScanType;
  target: string;
}
