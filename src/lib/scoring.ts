import type { IndicatorResult } from "./indicators";
import type { ICTResult, TrendSignal } from "@/types";

export function scoreTimeframe(
  ind: IndicatorResult,
  ict: ICTResult
): { trend: TrendSignal; score: number } {
  let score = 0;

  if (ind.rsi !== null) score += ind.rsi > 55 ? 1 : ind.rsi < 45 ? -1 : 0;
  if (ind.macd_hist !== null) score += ind.macd_hist > 0 ? 1 : -1;
  if (ind.macd !== null && ind.macd_signal !== null) score += ind.macd > ind.macd_signal ? 1 : -1;
  if (ind.close !== null && ind.ema_50 !== null) score += ind.close > ind.ema_50 ? 1 : -1;
  if (ind.close !== null && ind.ema_200 !== null) score += ind.close > ind.ema_200 ? 1 : -1;

  if (ind.close !== null) {
    for (const ob of ict.orderBlocks) {
      if (ind.close >= ob.low && ind.close <= ob.high) {
        score += ob.type === "bullish" ? 1 : -1;
      }
    }
  }

  if (ict.recentSSLSweep) score += 1;
  if (ict.recentBSLSweep) score -= 1;

  score = Math.max(-3, Math.min(3, score));
  const trend: TrendSignal = score >= 2 ? "BULLISH" : score <= -2 ? "BEARISH" : "NEUTRAL";
  return { trend, score };
}

export function aggregateTrends(trends: TrendSignal[]): {
  global_trend: TrendSignal;
  global_score: number;
  confluence: boolean;
} {
  const map: Record<TrendSignal, number> = { BULLISH: 1, NEUTRAL: 0, BEARISH: -1 };
  const total = trends.reduce((s, t) => s + map[t], 0);
  const n = trends.length;

  // Confluence: ≥ 75% of TFs agree in the same non-neutral direction
  const minForConfluence = Math.ceil(n * 0.75);
  const bullishCount = trends.filter(t => t === "BULLISH").length;
  const bearishCount = trends.filter(t => t === "BEARISH").length;
  const confluence = bullishCount >= minForConfluence || bearishCount >= minForConfluence;

  // Global trend: majority threshold scales with TF count
  const threshold = Math.max(1, Math.ceil(n / 3));
  const global_trend: TrendSignal = total >= threshold ? "BULLISH" : total <= -threshold ? "BEARISH" : "NEUTRAL";
  return { global_trend, global_score: total, confluence };
}
