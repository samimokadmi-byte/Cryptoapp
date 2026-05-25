import type { Candle } from "@/types";

export interface AccumulationZone {
  type: "accumulation" | "distribution" | "consolidation";
  rangeLow: number;
  rangeHigh: number;
  rangePercent: number;
  strength: "strong" | "weak";
}

export function detectAccumulation(candles: Candle[]): AccumulationZone | null {
  const window = candles.slice(-20);
  if (window.length < 10) return null;

  const rangeHigh = Math.max(...window.map(c => c.high));
  const rangeLow = Math.min(...window.map(c => c.low));
  const mid = (rangeHigh + rangeLow) / 2;
  const rangePercent = ((rangeHigh - rangeLow) / mid) * 100;

  if (rangePercent > 5) return null; // too wide to be accumulation

  const lastClose = candles[candles.length - 1].close;
  const positionInRange = (lastClose - rangeLow) / (rangeHigh - rangeLow || 1);

  // Volume split: is more volume happening near lows or highs?
  const volLow = window
    .filter(c => c.close < mid)
    .reduce((s, c) => s + c.volume, 0);
  const volHigh = window
    .filter(c => c.close >= mid)
    .reduce((s, c) => s + c.volume, 0);

  let type: AccumulationZone["type"];
  if (volLow > volHigh * 1.2 && positionInRange < 0.5) {
    type = "accumulation"; // buying near lows = institutional accumulation
  } else if (volHigh > volLow * 1.2 && positionInRange > 0.5) {
    type = "distribution"; // selling near highs = distribution
  } else if (positionInRange < 0.4) {
    type = "accumulation";
  } else if (positionInRange > 0.6) {
    type = "distribution";
  } else {
    type = "consolidation";
  }

  return {
    type,
    rangeLow,
    rangeHigh,
    rangePercent,
    strength: rangePercent < 2 ? "strong" : "weak",
  };
}
