import { Container } from "../types/container";
import { mockContainers } from "../mocks/data";
import { request } from "./api";

export async function getContainers(): Promise<Container[]> {
  try {
    return await request<Container[]>("/containers");
  } catch (err) {
    console.warn("Backend engine unreachable, using local containers cache:", err);
    return mockContainers;
  }
}

export async function getContainerById(id: string): Promise<Container | undefined> {
  try {
    return await request<Container>(`/containers/${id}`);
  } catch {
    return mockContainers.find((c) => c.id === id || c.name === id);
  }
}
