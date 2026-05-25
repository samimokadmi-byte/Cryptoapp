const BASE = "https://api.binance.com";

export const SYMBOLS = ["SOLUSDT", "ADAUSDT", "XRPUSDT", "BNBUSDT", "SUIUSDT"];
export const TIMEFRAMES = ["15m", "30m", "1h"] as const;

export function displaySymbol(raw: string) {
  return raw.replace("USDT", "/USDT");
}

export async function fetchCloses(
  symbol: string,
  interval: string,
  limit = 250
): Promise<number[]> {
  const url = `${BASE}/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Binance ${symbol}/${interval}: ${res.status}`);
  const raw: string[][] = await res.json();
  return raw.map(k => parseFloat(k[4])); // index 4 = close price
}

export async function pingBinance(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE}/api/v3/ping`, { cache: "no-store" });
    return res.ok;
  } catch {
    return false;
  }
}
