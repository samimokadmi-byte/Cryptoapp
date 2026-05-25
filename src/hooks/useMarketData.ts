"use client";
import { useState, useEffect, useCallback } from "react";
import { DashboardResponse } from "@/types";
import { api } from "@/lib/api";

const REFRESH_MS = 30_000;

export function useMarketData() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const result = await api.dashboard();
      setData(result);
      setError(null);
      setLastFetch(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, REFRESH_MS);
    return () => clearInterval(id);
  }, [fetchData]);

  return { data, loading, error, lastFetch, refetch: fetchData };
}
