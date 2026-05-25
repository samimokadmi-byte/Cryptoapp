export type TrendSignal = "BULLISH" | "BEARISH" | "NEUTRAL";

export interface Candle {
  time: number;  // ms timestamp
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface IndicatorSnapshot {
  rsi: number | null;
  macd: number | null;
  macd_signal: number | null;
  macd_hist: number | null;
  ema_50: number | null;
  ema_200: number | null;
  close: number | null;
}

export interface FVG {
  type: "bullish" | "bearish";
  high: number;
  low: number;
}

export interface OrderBlock {
  type: "bullish" | "bearish";
  high: number;
  low: number;
}

export interface LiquidityLevel {
  type: "bsl" | "ssl";
  price: number;
  swept: boolean;
}

export interface ICTResult {
  fvgs: FVG[];
  orderBlocks: OrderBlock[];
  liquidity: LiquidityLevel[];
  recentSSLSweep: boolean;
  recentBSLSweep: boolean;
}

export interface TimeframeAnalysis {
  timeframe: string;
  indicators: IndicatorSnapshot;
  trend: TrendSignal;
  score: number;
  ict: ICTResult;
  candles: Candle[];
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

export interface EntryPoint {
  symbol: string;
  timeframe: string;
  direction: "long" | "short";
  entryZone: { low: number; high: number };
  stopLoss: number;
  reasons: string[];
  confidence: "high" | "medium";
}
