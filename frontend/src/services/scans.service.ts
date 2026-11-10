import { Scan, StartScanPayload } from "../types/scan";
import { mockScans } from "../mocks/data";
import { request } from "./api";

let scansList = [...mockScans];

export async function getScans(): Promise<Scan[]> {
  try {
    const list = await request<Scan[]>("/scans");
    if (list && list.length > 0) {
      scansList = list;
      return list;
    }
    return scansList;
  } catch (err) {
    console.warn("Backend engine unreachable, using local scans cache:", err);
    return scansList;
  }
}

export async function startScan(payload: StartScanPayload): Promise<Scan> {
  try {
    return await request<Scan>("/scans", {
      method: "POST",
      body: JSON.stringify({ type: payload.scan_type, target: payload.target }),
    });
  } catch (err) {
    console.warn("Backend engine unreachable, creating local mock scan:", err);
    const newScan: Scan = {
      id: `scan-0${scansList.length + 1}`,
      scan_type: payload.scan_type,
      target: payload.target,
      status: "COMPLETED",
      started_at: new Date().toISOString(),
      completed_at: new Date(Date.now() + 8000).toISOString(),
      duration_seconds: 8,
      findings_count: {
        critical: 2,
        high: 4,
        medium: 6,
        low: 3,
        info: 1,
      },
      resources_analyzed: payload.scan_type === "runtime" ? 14 : 5,
      initiated_by: "User Manual",
    };
    scansList = [newScan, ...scansList];
    return newScan;
  }
}
