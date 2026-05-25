import { fetchCandles, SYMBOLS, TIMEFRAMES, displaySymbol } from "./binance";
import { computeIndicators } from "./indicators";
import { scoreTimeframe, aggregateTrends } from "./scoring";
import { detectICT } from "./ict";
import type { AssetAnalysis, TimeframeAnalysis } from "@/types";

export async function analyzeSymbol(symbol: string): Promise<AssetAnalysis> {
  const tfResults = await Promise.all(
    TIMEFRAMES.map(async (tf): Promise<TimeframeAnalysis> => {
      const candles = await fetchCandles(symbol, tf);
      const closes = candles.map(c => c.close);
      const indicators = computeIndicators(closes);
      const ict = detectICT(candles);
      const { trend, score } = scoreTimeframe(indicators, ict);
      return {
        timeframe: tf,
        indicators,
        trend,
        score,
        ict,
        candles: candles.slice(-100), // last 100 for chart display
      };
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
