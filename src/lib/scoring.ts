import type { IndicatorResult } from "./indicators";
import type { ICTResult, TrendSignal } from "@/types";

export function scoreTimeframe(
  ind: IndicatorResult,
  ict: ICTResult
): { trend: TrendSignal; score: number } {
  let score = 0;

  // Classic indicators
  if (ind.rsi !== null) score += ind.rsi > 55 ? 1 : ind.rsi < 45 ? -1 : 0;
  if (ind.macd_hist !== null) score += ind.macd_hist > 0 ? 1 : -1;
  if (ind.macd !== null && ind.macd_signal !== null) score += ind.macd > ind.macd_signal ? 1 : -1;
  if (ind.close !== null && ind.ema_50 !== null) score += ind.close > ind.ema_50 ? 1 : -1;
  if (ind.close !== null && ind.ema_200 !== null) score += ind.close > ind.ema_200 ? 1 : -1;

  // ICT: price inside an Order Block
  if (ind.close !== null) {
    for (const ob of ict.orderBlocks) {
      if (ind.close >= ob.low && ind.close <= ob.high) {
        score += ob.type === "bullish" ? 1 : -1;
      }
    }
  }

  // ICT: liquidity sweep on last candle (stop hunt = likely reversal)
  if (ict.recentSSLSweep) score += 1; // swept lows → bullish reversal
  if (ict.recentBSLSweep) score -= 1; // swept highs → bearish reversal

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
  const confluence = new Set(trends).size === 1 && trends[0] !== "NEUTRAL";
  const global_trend: TrendSignal = total >= 2 ? "BULLISH" : total <= -2 ? "BEARISH" : "NEUTRAL";
  return { global_trend, global_score: total, confluence };
}
