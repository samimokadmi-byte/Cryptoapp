import { fetchCloses, SYMBOLS, TIMEFRAMES, displaySymbol } from "./binance";
import { computeIndicators } from "./indicators";
import { scoreTimeframe, aggregateTrends } from "./scoring";
import type { AssetAnalysis, TimeframeAnalysis } from "@/types";

export async function analyzeSymbol(symbol: string): Promise<AssetAnalysis> {
  const tfResults = await Promise.all(
    TIMEFRAMES.map(async (tf): Promise<TimeframeAnalysis> => {
      const closes = await fetchCloses(symbol, tf);
      const indicators = computeIndicators(closes);
      const { trend, score } = scoreTimeframe(indicators);
      return { timeframe: tf, indicators, trend, score };
    })
  );

  const trends = tfResults.map(t => t.trend);
  const { global_trend, global_score, confluence } = aggregateTrends(trends);

  return {
    symbol: displaySymbol(symbol),
    timeframes: tfResults,
    global_trend,
    global_score,
    confluence,
    last_updated: new Date().toISOString(),
  };
}

export async function analyzeAll(): Promise<AssetAnalysis[]> {
  return Promise.all(SYMBOLS.map(analyzeSymbol));
}
