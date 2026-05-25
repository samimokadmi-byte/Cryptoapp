"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { DashboardResponse, EntryPoint, SentimentResult } from "@/types";
import { analyzeAll } from "@/lib/analysis";
import { detectEntryPoints } from "@/lib/entryPoints";
import { fetchFearGreed, computeSentiment } from "@/lib/sentiment";
import { useNotifications } from "./useNotifications";

const REFRESH_MS = 30_000;

function collectSignals(assets: DashboardResponse["assets"]): Set<string> {
  const keys = new Set<string>();
  for (const asset of assets) {
    if (asset.confluence) {
      keys.add(`${asset.symbol}:::CONFLUENCE_${asset.global_trend}`);
    }
    for (const tf of asset.timeframes) {
      const price = tf.indicators.close;
      if (tf.ict.recentSSLSweep) keys.add(`${asset.symbol}:::${tf.timeframe}:::SSL_SWEPT`);
      if (tf.ict.recentBSLSweep) keys.add(`${asset.symbol}:::${tf.timeframe}:::BSL_SWEPT`);
      if (price !== null) {
        for (const ob of tf.ict.orderBlocks) {
          if (price >= ob.low && price <= ob.high) {
            keys.add(`${asset.symbol}:::${tf.timeframe}:::IN_OB_${ob.type.toUpperCase()}`);
          }
        }
      }
    }
  }
  return keys;
}

function signalToNotification(key: string): { title: string; body: string } | null {
  const parts = key.split(":::");
  if (parts.length === 2) {
    const [sym, type] = parts;
    const trend = type.replace("CONFLUENCE_", "");
    return { title: `${sym} — Confluence ${trend}`, body: "Les TFs sont alignés — signal fort" };
  }
  if (parts.length === 3) {
    const [sym, tf, type] = parts;
    if (type === "SSL_SWEPT")
      return { title: `${sym} ${tf} — Retournement haussier`, body: "SSL swept — stop hunt baissier" };
    if (type === "BSL_SWEPT")
      return { title: `${sym} ${tf} — Retournement baissier`, body: "BSL swept — stop hunt haussier" };
    if (type === "IN_OB_BULLISH")
      return { title: `${sym} ${tf} — Zone OB haussier`, body: "Prix dans un Order Block — LONG potentiel" };
    if (type === "IN_OB_BEARISH")
      return { title: `${sym} ${tf} — Zone OB baissier`, body: "Prix dans un Order Block — SHORT potentiel" };
  }
  return null;
}

export function useMarketData() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);
  const [entryPoints, setEntryPoints] = useState<EntryPoint[]>([]);
  const [sentiment, setSentiment] = useState<SentimentResult | null>(null);

  const { permission: notifPermission, requestPermission: requestNotifPermission, notify } = useNotifications();
  const prevSignals = useRef<Set<string>>(new Set());
  const isFirstFetch = useRef(true);

  const fetchData = useCallback(async () => {
    try {
      const [assets, fgResult] = await Promise.all([
        analyzeAll(),
        fetchFearGreed().catch(() => null),
      ]);

      const confluences = assets.filter(a => a.confluence);

      const signals = collectSignals(assets);
      if (!isFirstFetch.current) {
        Array.from(signals).forEach(key => {
          if (!prevSignals.current.has(key)) {
            const notif = signalToNotification(key);
            if (notif) notify(notif.title, notif.body);
          }
        });
      }
      isFirstFetch.current = false;
      prevSignals.current = signals;

      setSentiment(fgResult ?? computeSentiment(assets));
      setEntryPoints(detectEntryPoints(assets));
      setData({ assets, confluences, generated_at: new Date().toISOString() });
      setError(null);
      setLastFetch(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Binance fetch error");
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, REFRESH_MS);
    return () => clearInterval(id);
  }, [fetchData]);

  return { data, loading, error, lastFetch, refetch: fetchData, entryPoints, sentiment, notifPermission, requestNotifPermission };
}
