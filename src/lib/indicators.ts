export interface IndicatorResult {
  rsi: number | null;
  macd: number | null;
  macd_signal: number | null;
  macd_hist: number | null;
  ema_50: number | null;
  ema_200: number | null;
  close: number | null;
}

function ema(prices: number[], period: number): number[] {
  const alpha = 2 / (period + 1);
  const out = new Array<number>(prices.length).fill(NaN);
  if (prices.length === 0) return out;
  out[0] = prices[0];
  for (let i = 1; i < prices.length; i++) {
    out[i] = alpha * prices[i] + (1 - alpha) * out[i - 1];
  }
  for (let i = 0; i < Math.min(period - 1, prices.length); i++) out[i] = NaN;
  return out;
}

function rsi(prices: number[], period = 14): number[] {
  const out = new Array<number>(prices.length).fill(NaN);
  if (prices.length < period + 1) return out;
  const alpha = 1 / period;
  let avgGain = 0, avgLoss = 0;
  for (let i = 1; i <= period; i++) {
    const d = prices[i] - prices[i - 1];
    avgGain += Math.max(0, d) / period;
    avgLoss += Math.max(0, -d) / period;
  }
  out[period] = 100 - 100 / (1 + avgGain / (avgLoss || 1e-10));
  for (let i = period + 1; i < prices.length; i++) {
    const d = prices[i] - prices[i - 1];
    avgGain = alpha * Math.max(0, d) + (1 - alpha) * avgGain;
    avgLoss = alpha * Math.max(0, -d) + (1 - alpha) * avgLoss;
    out[i] = 100 - 100 / (1 + avgGain / (avgLoss || 1e-10));
  }
  return out;
}

function last(arr: number[]): number | null {
  for (let i = arr.length - 1; i >= 0; i--) {
    if (!isNaN(arr[i])) return Math.round(arr[i] * 1e6) / 1e6;
  }
  return null;
}

export function computeIndicators(closes: number[]): IndicatorResult {
  const rsiArr = rsi(closes);
  const emaFast = ema(closes, 12);
  const emaSlow = ema(closes, 26);
  const macdLine = closes.map((_, i) =>
    isNaN(emaFast[i]) || isNaN(emaSlow[i]) ? NaN : emaFast[i] - emaSlow[i]
  );
  const validMacd = macdLine.map(v => (isNaN(v) ? 0 : v));
  const signalLine = ema(validMacd, 9);
  const histLine = macdLine.map((v, i) =>
    isNaN(v) || isNaN(signalLine[i]) ? NaN : v - signalLine[i]
  );
  const ema50 = ema(closes, 50);
  const ema200 = ema(closes, 200);

  return {
    rsi: last(rsiArr),
    macd: last(macdLine),
    macd_signal: last(signalLine),
    macd_hist: last(histLine),
    ema_50: last(ema50),
    ema_200: last(ema200),
    close: closes.length > 0 ? closes[closes.length - 1] : null,
  };
}
