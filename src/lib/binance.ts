import type { Candle } from "@/types";

const BASE = "https://api.binance.com";

export const SYMBOLS = [
  "BTCUSDT", "ETHUSDT", "SOLUSDT", "BNBUSDT",
  "XRPUSDT", "ADAUSDT", "SUIUSDT", "XAUTUSDT",
];
export const TIMEFRAMES = ["5m", "15m", "30m", "1h", "4h", "1d"] as const;

export { type Candle };

export function displaySymbol(raw: string) {
  return raw.replace(/USDT$/, "/USDT");
}

export async function fetchCandles(
  symbol: string,
  interval: string,
  limit = 250
): Promise<Candle[]> {
  const url = `${BASE}/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Binance ${symbol}/${interval}: ${res.status}`);
  const raw: string[][] = await res.json();
  return raw.map(k => ({
    time: parseInt(k[0]),
    open: parseFloat(k[1]),
    high: parseFloat(k[2]),
    low: parseFloat(k[3]),
    close: parseFloat(k[4]),
    volume: parseFloat(k[5]),
  }));
}

export async function fetchCloses(
  symbol: string,
  interval: string,
  limit = 250
): Promise<number[]> {
  const candles = await fetchCandles(symbol, interval, limit);
  return candles.map(c => c.close);
}

export async function pingBinance(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE}/api/v3/ping`, { cache: "no-store" });
    return res.ok;
  } catch {
    return false;
  }
}
