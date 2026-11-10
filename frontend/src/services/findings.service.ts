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
