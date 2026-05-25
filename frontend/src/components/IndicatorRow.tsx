import { IndicatorSnapshot } from "@/types";
import clsx from "clsx";

interface IndicatorRowProps {
  indicators: IndicatorSnapshot;
}

function fmt(v: number | null, decimals = 2): string {
  if (v === null) return "—";
  return v.toFixed(decimals);
}

function RSIColor(rsi: number | null) {
  if (rsi === null) return "text-slate-500";
  if (rsi > 55) return "text-accent-green";
  if (rsi < 45) return "text-accent-red";
  return "text-accent-amber";
}

export default function IndicatorRow({ indicators: ind }: IndicatorRowProps) {
  const emaAligned =
    ind.ema_50 !== null && ind.ema_200 !== null && ind.close !== null
      ? ind.close > ind.ema_50 && ind.close > ind.ema_200
        ? "bullish"
        : ind.close < ind.ema_50 && ind.close < ind.ema_200
        ? "bearish"
        : "mixed"
      : null;

  const macdBullish =
    ind.macd !== null && ind.macd_signal !== null ? ind.macd > ind.macd_signal : null;

  return (
    <div className="grid grid-cols-3 gap-x-3 gap-y-1 font-mono text-xs">
      {/* RSI */}
      <div className="text-slate-500">RSI</div>
      <div className={clsx("col-span-2 font-semibold", RSIColor(ind.rsi))}>
        {fmt(ind.rsi, 1)}
      </div>

      {/* MACD */}
      <div className="text-slate-500">MACD</div>
      <div
        className={clsx(
          "col-span-2 font-semibold",
          macdBullish === true && "text-accent-green",
          macdBullish === false && "text-accent-red",
          macdBullish === null && "text-slate-500",
        )}
      >
        {fmt(ind.macd_hist, 4)}
        <span className="text-slate-600 ml-1 font-normal">hist</span>
      </div>

      {/* EMAs */}
      <div className="text-slate-500">EMA</div>
      <div
        className={clsx(
          "col-span-2 font-semibold",
          emaAligned === "bullish" && "text-accent-green",
          emaAligned === "bearish" && "text-accent-red",
          emaAligned === "mixed" && "text-accent-amber",
          emaAligned === null && "text-slate-500",
        )}
      >
        {fmt(ind.ema_50)} <span className="text-slate-600 font-normal">·</span> {fmt(ind.ema_200)}
        <span className="text-slate-600 ml-1 font-normal">50/200</span>
      </div>
    </div>
  );
}
