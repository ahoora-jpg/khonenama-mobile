import type { BusinessDetail, BusinessSummary } from "../types";

const API_BASE = process.env.EXPO_PUBLIC_API_URL || "https://khonenama.ir";

async function request<T>(path: string): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12_000);
  try {
    const response = await fetch(API_BASE + path, {
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok || !payload?.ok) throw new Error(payload?.error || "REQUEST_FAILED");
    return payload.data as T;
  } catch {
    throw new Error("در حال حاضر ارتباط با سرور برقرار نیست.");
  } finally {
    clearTimeout(timer);
  }
}

export function searchBusinesses(options: { q?: string; location?: string; category?: string } = {}) {
  const params = new URLSearchParams();
  if (options.q) params.set("q", options.q);
  if (options.location) params.set("location", options.location);
  if (options.category) params.set("category", options.category);
  params.set("limit", "30");
  return request<BusinessSummary[]>(`/api/v1/businesses?${params.toString()}`);
}

export function getBusiness(slug: string) {
  return request<BusinessDetail>(`/api/v1/businesses/${encodeURIComponent(slug)}`);
}
