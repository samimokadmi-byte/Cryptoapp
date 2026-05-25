import { AssetAnalysis } from "@/types";
import clsx from "clsx";

interface AlertPanelProps {
  confluences: AssetAnalysis[];
}

export default function AlertPanel({ confluences }: AlertPanelProps) {
  if (confluences.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-surface-1 px-5 py-4 flex items-center gap-3">
        <div className="h-8 w-8 rounded-lg bg-slate-700/40 flex items-center justify-center flex-shrink-0">
          <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </div>
        <div>
          <p className="font-mono text-xs font-semibold text-slate-400 tracking-wide">
            NO CONFLUENCE ALERT
          </p>
          <p className="text-xs text-slate-600 mt-0.5">
            No asset has all 3 timeframes aligned in the same direction.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {confluences.map((asset) => (
        <div
          key={asset.symbol}
          className={clsx(
            "rounded-xl border px-5 py-4 flex items-center justify-between",
            asset.global_trend === "BULLISH"
              ? "border-accent-green/40 bg-accent-green/10 glow-green"
              : "border-accent-red/40 bg-accent-red/10 glow-red",
          )}
        >
          <div className="flex items-center gap-3">
            <div
              className={clsx(
                "h-9 w-9 rounded-lg flex items-center justify-center font-mono font-bold text-sm flex-shrink-0",
                asset.global_trend === "BULLISH"
                  ? "bg-accent-green/20 text-accent-green border border-accent-green/30"
                  : "bg-accent-red/20 text-accent-red border border-accent-red/30",
              )}
            >
              {asset.global_trend === "BULLISH" ? "▲" : "▼"}
            </div>
            <div>
              <p className="font-mono font-semibold text-sm text-white">
                {asset.symbol}
              </p>
              <p
                className={clsx(
                  "text-xs font-mono",
                  asset.global_trend === "BULLISH" ? "text-accent-green" : "text-accent-red",
                )}
              >
                {asset.global_trend === "BULLISH" ? "CONFLUENCE HAUSSIÈRE" : "CONFLUENCE BAISSIÈRE"}
                {" · "}15m + 30m + 1h alignés
              </p>
            </div>
          </div>

          <div className="flex gap-2 flex-shrink-0">
            {asset.timeframes.map((tf) => (
              <span
                key={tf.timeframe}
                className={clsx(
                  "font-mono text-xs px-2 py-1 rounded border",
                  tf.trend === "BULLISH"
                    ? "text-accent-green border-accent-green/30 bg-accent-green/10"
                    : tf.trend === "BEARISH"
                    ? "text-accent-red border-accent-red/30 bg-accent-red/10"
                    : "text-slate-400 border-slate-600 bg-slate-700/30",
                )}
              >
                {tf.timeframe}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
