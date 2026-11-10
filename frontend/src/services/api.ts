// Centralized API configuration with resilient Live Engine fallback
export const API_BASE_URL = "/api/v1";

export async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API error [${response.status}]: ${errorText || response.statusText}`);
  }

  return response.json();
}
