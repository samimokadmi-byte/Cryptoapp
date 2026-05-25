export type TrendSignal = "BULLISH" | "BEARISH" | "NEUTRAL";

export interface IndicatorSnapshot {
  rsi: number | null;
  macd: number | null;
  macd_signal: number | null;
  macd_hist: number | null;
  ema_50: number | null;
  ema_200: number | null;
  close: number | null;
}

export interface TimeframeAnalysis {
  timeframe: string;
  indicators: IndicatorSnapshot;
  trend: TrendSignal;
  score: number;
}

export interface AssetAnalysis {
  symbol: string;
  timeframes: TimeframeAnalysis[];
  global_trend: TrendSignal;
  global_score: number;
  confluence: boolean;
  last_updated: string;
}

export interface DashboardResponse {
  assets: AssetAnalysis[];
  confluences: AssetAnalysis[];
  generated_at: string;
}
