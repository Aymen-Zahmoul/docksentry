import { SecurityRule } from "../types/rule";
import { mockRules } from "../mocks/data";
import { request } from "./api";

let rulesList = [...mockRules];

export async function getRules(): Promise<SecurityRule[]> {
  try {
    const rules = await request<SecurityRule[]>("/rules");
    rulesList = rules;
    return rules;
  } catch (err) {
    console.warn("Backend engine unreachable, using local rules cache:", err);
    return rulesList;
  }
}

export async function toggleRule(id: string): Promise<SecurityRule> {
  try {
    return await request<SecurityRule>(`/rules/${id}/toggle`, {
      method: "POST",
    });
  } catch {
    const index = rulesList.findIndex((r) => r.id === id);
    if (index !== -1) {
      rulesList[index] = { ...rulesList[index], enabled: !rulesList[index].enabled };
      return rulesList[index];
    }
    throw new Error("Rule not found");
  }
}
