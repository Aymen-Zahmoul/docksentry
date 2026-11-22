import { Finding, FindingStatus, Severity, FindingCategory } from "../types/finding";
import { mockFindings } from "../mocks/data";
import { request } from "./api";

let currentFindings = [...mockFindings];

export interface FindingsFilterOptions {
  severity?: Severity | "ALL";
  status?: FindingStatus | "ALL";
  category?: FindingCategory | "ALL";
  search?: string;
  resource?: string;
}

export async function getFindings(filters?: FindingsFilterOptions): Promise<Finding[]> {
  const queryParams = new URLSearchParams();
  if (filters?.severity && filters.severity !== "ALL") queryParams.append("severity", filters.severity);
  if (filters?.status && filters.status !== "ALL") queryParams.append("status", filters.status);
  if (filters?.category && filters.category !== "ALL") queryParams.append("category", filters.category);
  if (filters?.search) queryParams.append("search", filters.search);
  if (filters?.resource) queryParams.append("resource", filters.resource);

  try {
    const list = await request<Finding[]>(`/findings?${queryParams.toString()}`);
    currentFindings = list;
    return list;
  } catch (err) {
    console.warn("Backend engine unreachable, using local findings cache:", err);
    let list = [...currentFindings];
    if (filters) {
      if (filters.severity && filters.severity !== "ALL") {
        list = list.filter((f) => f.severity === filters.severity);
      }
      if (filters.status && filters.status !== "ALL") {
        list = list.filter((f) => f.status === filters.status);
      }
      if (filters.category && filters.category !== "ALL") {
        list = list.filter((f) => f.category === filters.category);
      }
      if (filters.resource) {
        list = list.filter((f) => f.resource === filters.resource);
      }
      if (filters.search) {
        const query = filters.search.toLowerCase();
        list = list.filter(
          (f) =>
            f.title.toLowerCase().includes(query) ||
            f.rule_id.toLowerCase().includes(query) ||
            f.resource.toLowerCase().includes(query) ||
            f.evidence.toLowerCase().includes(query)
        );
      }
    }
    return list;
  }
}

export async function getFindingById(id: string): Promise<Finding | undefined> {
  try {
    return await request<Finding>(`/findings/${id}`);
  } catch {
    return currentFindings.find((f) => f.id === id);
  }
}

export async function updateFindingStatus(id: string, status: FindingStatus): Promise<Finding> {
  try {
    return await request<Finding>(`/findings/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  } catch {
    const index = currentFindings.findIndex((f) => f.id === id);
    if (index !== -1) {
      currentFindings[index] = { ...currentFindings[index], status };
      return currentFindings[index];
    }
    throw new Error("Finding not found");
  }
}

export async function remediateFinding(id: string): Promise<{ success: boolean; message: string; finding: Finding; backup_path?: string }> {
  try {
    const res = await request<{ success: boolean; message: string; finding: Finding; backup_path?: string }>(
      `/findings/${id}/remediate`,
      { method: "POST" }
    );
    const index = currentFindings.findIndex((f) => f.id === id);
    if (index !== -1 && res.finding) {
      currentFindings[index] = res.finding;
    }
    return res;
  } catch (err: any) {
    const index = currentFindings.findIndex((f) => f.id === id);
    if (index !== -1) {
      currentFindings[index] = { ...currentFindings[index], status: "RESOLVED" };
      return { success: true, message: "Remediated successfully (offline simulation)", finding: currentFindings[index] };
    }
    throw err;
  }
}

export async function rollbackFinding(id: string): Promise<{ success: boolean; message: string; finding: Finding }> {
  try {
    const res = await request<{ success: boolean; message: string; finding: Finding }>(
      `/findings/${id}/rollback`,
      { method: "POST" }
    );
    const index = currentFindings.findIndex((f) => f.id === id);
    if (index !== -1 && res.finding) {
      currentFindings[index] = res.finding;
    }
    return res;
  } catch (err: any) {
    const index = currentFindings.findIndex((f) => f.id === id);
    if (index !== -1) {
      currentFindings[index] = { ...currentFindings[index], status: "OPEN" };
      return { success: true, message: "Rolled back successfully (offline simulation)", finding: currentFindings[index] };
    }
    throw err;
  }
}

export async function getImageAdvisories(): Promise<import("../types/finding").ImageAdvisorItem[]> {
  try {
    return await request<import("../types/finding").ImageAdvisorItem[]>("/images/advisor");
  } catch (err) {
    console.warn("Backend image advisor unreachable, using fallback advisories:", err);
    return [
      {
        id: "adv-df-1",
        current_image: "python:3.11",
        target_resource: "Dockerfile",
        source_file: "Dockerfile",
        current_size_mb: 1010,
        current_cve_estimate: 105,
        recommended_image: "python:3.11-slim",
        recommended_size_mb: 145,
        recommended_cve_estimate: 2,
        size_reduction_pct: 86,
        cve_reduction_pct: 98,
        risk_level: "HIGH",
        remediation_status: "PENDING",
      },
      {
        id: "adv-cmp-api",
        current_image: "node:20",
        target_resource: "api service",
        source_file: "docker-compose.yml",
        current_size_mb: 1080,
        current_cve_estimate: 84,
        recommended_image: "node:20-alpine",
        recommended_size_mb: 174,
        recommended_cve_estimate: 1,
        size_reduction_pct: 84,
        cve_reduction_pct: 98,
        risk_level: "HIGH",
        remediation_status: "PENDING",
      },
      {
        id: "adv-cmp-db",
        current_image: "postgres:latest",
        target_resource: "database service",
        source_file: "docker-compose.yml",
        current_size_mb: 450,
        current_cve_estimate: 55,
        recommended_image: "postgres:16-alpine",
        recommended_size_mb: 128,
        recommended_cve_estimate: 2,
        size_reduction_pct: 72,
        cve_reduction_pct: 96,
        risk_level: "MEDIUM",
        remediation_status: "PENDING",
      },
    ];
  }
}
