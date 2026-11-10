import { DashboardStats } from "../types/dashboard";
import { mockDashboardStats } from "../mocks/data";
import { request } from "./api";

export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    return await request<DashboardStats>("/dashboard");
  } catch (err) {
    console.warn("Backend engine unreachable, using local posture data:", err);
    return mockDashboardStats;
  }
}
