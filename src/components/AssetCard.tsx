import { AssetAnalysis } from "@/types";
import TrendBadge from "./TrendBadge";
import TimeframeTable from "./TimeframeTable";
import clsx from "clsx";

interface AssetCardProps {
  asset: AssetAnalysis;
}

const ASSET_ICONS: Record<string, string> = {
  "SOL/USDT": "◎",
  "ADA/USDT": "₳",
  "XRP/USDT": "✕",
  "BNB/USDT": "◈",
  "SUI/USDT": "⬡",
};

export default function AssetCard({ asset }: AssetCardProps) {
  const icon = ASSET_ICONS[asset.symbol] ?? "○";
  const ticker = asset.symbol.split("/")[0];

  const priceClose = asset.timeframes.find((tf) => tf.timeframe === "1h")
    ?.indicators.close;

  return (
    <div
      className={clsx(
        "rounded-xl border bg-surface-1 overflow-hidden transition-all duration-300",
        asset.confluence && asset.global_trend === "BULLISH" &&
          "border-accent-green/40 glow-green",
        asset.confluence && asset.global_trend === "BEARISH" &&
          "border-accent-red/40 glow-red",
        !asset.confluence && "border-border hover:border-slate-500/60",
      )}
    >
      {/* Card Header */}
      <div className="px-4 py-3 bg-surface-2 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="text-lg text-slate-300">{icon}</span>
          <div>
            <p className="font-mono font-semibold text-sm text-white">{ticker}</p>
            <p className="font-mono text-xs text-slate-500">{asset.symbol}</p>
          </div>
        </div>
        <div className="text-right">
          <TrendBadge trend={asset.global_trend} size="md" />
          {priceClose !== null && priceClose !== undefined && (
            <p className="font-mono text-xs text-slate-400 mt-1">
              ${priceClose.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
            </p>
          )}
        </div>
      </div>

      {/* Confluence badge */}
      {asset.confluence && (
        <div
          className={clsx(
            "px-4 py-1.5 flex items-center gap-2 text-xs font-mono font-semibold tracking-wide",
            asset.global_trend === "BULLISH"
              ? "bg-accent-green/15 text-accent-green"
              : "bg-accent-red/15 text-accent-red",
          )}
        >
          <span className="animate-pulse_slow">◉</span>
          CONFLUENCE MAJEURE — ALL TIMEFRAMES ALIGNED
        </div>
      )}

      {/* Timeframe breakdown */}
      <TimeframeTable timeframes={asset.timeframes} />
    </div>
  );
}
