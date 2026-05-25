import { DashboardResponse, AssetAnalysis } from "@/types";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function request<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`API ${path} → ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  dashboard: (): Promise<DashboardResponse> => request("/api/dashboard"),
  asset: (symbol: string): Promise<AssetAnalysis> =>
    request(`/api/asset/${encodeURIComponent(symbol)}`),
  health: () => request<{ status: string; binance_connected: boolean }>("/health"),
};
