import type { Candle } from "./binance";
import type { FVG, OrderBlock, LiquidityLevel, ICTResult } from "@/types";

function bodySize(c: Candle): number {
  return Math.abs(c.close - c.open);
}

function avgBody(candles: Candle[]): number {
  const total = candles.reduce((s, c) => s + bodySize(c), 0);
  return total / candles.length || 1;
}

export function detectFVGs(candles: Candle[]): FVG[] {
  const result: FVG[] = [];
  // scan last 80 candles for formations
  const start = Math.max(0, candles.length - 80);

  for (let i = start + 2; i < candles.length; i++) {
    const a = candles[i - 2];
    const c = candles[i];

    // Bullish FVG: gap between a.high and c.low
    if (a.high < c.low) {
      const gapBottom = a.high;
      const gapTop = c.low;
      // Filled if any later candle's low entered the gap
      let filled = false;
      for (let j = i + 1; j < candles.length; j++) {
        if (candles[j].low <= gapTop) { filled = true; break; }
      }
      if (!filled) result.push({ type: "bullish", low: gapBottom, high: gapTop });
    }

    // Bearish FVG: gap between c.high and a.low
    if (a.low > c.high) {
      const gapBottom = c.high;
      const gapTop = a.low;
      let filled = false;
      for (let j = i + 1; j < candles.length; j++) {
        if (candles[j].high >= gapBottom) { filled = true; break; }
      }
      if (!filled) result.push({ type: "bearish", low: gapBottom, high: gapTop });
    }
  }

  // Return 3 most recent per polarity
  const bullish = result.filter(f => f.type === "bullish").slice(-2);
  const bearish = result.filter(f => f.type === "bearish").slice(-2);
  return [...bullish, ...bearish];
}

export function detectOrderBlocks(candles: Candle[]): OrderBlock[] {
  const result: OrderBlock[] = [];
  const avg = avgBody(candles.slice(-50));
  const start = Math.max(0, candles.length - 60);

  for (let i = start; i < candles.length - 2; i++) {
    const c = candles[i];
    const next = candles[i + 1];

    // Bullish OB: bearish candle followed by strong bullish displacement
    if (c.close < c.open && next.close > next.open && bodySize(next) > avg * 1.5) {
      let mitigated = false;
      for (let j = i + 1; j < candles.length; j++) {
        if (candles[j].low < c.low) { mitigated = true; break; }
      }
      if (!mitigated) result.push({ type: "bullish", low: c.low, high: c.high });
    }

    // Bearish OB: bullish candle followed by strong bearish displacement
    if (c.close > c.open && next.close < next.open && bodySize(next) > avg * 1.5) {
      let mitigated = false;
      for (let j = i + 1; j < candles.length; j++) {
        if (candles[j].high > c.high) { mitigated = true; break; }
      }
      if (!mitigated) result.push({ type: "bearish", low: c.low, high: c.high });
    }
  }

  // Return last unmitigated OB of each type
  const bullishOBs = result.filter(ob => ob.type === "bullish");
  const bearishOBs = result.filter(ob => ob.type === "bearish");
  const out: OrderBlock[] = [];
  if (bullishOBs.length > 0) out.push(bullishOBs[bullishOBs.length - 1]);
  if (bearishOBs.length > 0) out.push(bearishOBs[bearishOBs.length - 1]);
  return out;
}

export function detectLiquidity(candles: Candle[]): LiquidityLevel[] {
  const recent = candles.slice(-50);
  const close = recent[recent.length - 1].close;
  const threshold = 0.002; // 0.2% proximity = "equal" highs/lows
  const result: LiquidityLevel[] = [];

  const addLevel = (type: "bsl" | "ssl", price: number, swept: boolean) => {
    const dup = result.some(l => Math.abs(l.price - price) / price < threshold * 2);
    if (!dup) result.push({ type, price, swept });
  };

  // BSL: equal highs above current price
  const highs = recent.filter(c => c.high > close);
  for (let a = 0; a < highs.length; a++) {
    for (let b = a + 1; b < highs.length; b++) {
      if (Math.abs(highs[a].high - highs[b].high) / highs[a].high < threshold) {
        const lvl = (highs[a].high + highs[b].high) / 2;
        const swept = recent.some(c => c.high > lvl && c.close < lvl);
        addLevel("bsl", lvl, swept);
      }
    }
  }

  // SSL: equal lows below current price
  const lows = recent.filter(c => c.low < close);
  for (let a = 0; a < lows.length; a++) {
    for (let b = a + 1; b < lows.length; b++) {
      if (Math.abs(lows[a].low - lows[b].low) / lows[a].low < threshold) {
        const lvl = (lows[a].low + lows[b].low) / 2;
        const swept = recent.some(c => c.low < lvl && c.close > lvl);
        addLevel("ssl", lvl, swept);
      }
    }
  }

  const bsl = result.filter(l => l.type === "bsl").sort((a, b) => a.price - b.price).slice(0, 3);
  const ssl = result.filter(l => l.type === "ssl").sort((a, b) => b.price - a.price).slice(0, 3);
  return [...ssl, ...bsl];
}

export function detectICT(candles: Candle[]): ICTResult {
  if (candles.length < 10) {
    return { fvgs: [], orderBlocks: [], liquidity: [], recentSSLSweep: false, recentBSLSweep: false };
  }

  const fvgs = detectFVGs(candles);
  const orderBlocks = detectOrderBlocks(candles);
  const liquidity = detectLiquidity(candles);

  // Detect sweep on the most recent candle only (wick outside level, close back inside)
  const last = candles[candles.length - 1];
  const recentSSLSweep = liquidity.some(
    l => l.type === "ssl" && last.low < l.price && last.close > l.price
  );
  const recentBSLSweep = liquidity.some(
    l => l.type === "bsl" && last.high > l.price && last.close < l.price
  );

  return { fvgs, orderBlocks, liquidity, recentSSLSweep, recentBSLSweep };
}
