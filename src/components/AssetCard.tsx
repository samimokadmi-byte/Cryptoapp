"use client";
import { useState } from "react";
import { AssetAnalysis, TimeframeAnalysis, AccumulationZone } from "@/types";
import TrendBadge from "./TrendBadge";
import TimeframeTable from "./TimeframeTable";
import CandleChart from "./CandleChart";
import clsx from "clsx";

interface AssetCardProps {
  asset: AssetAnalysis;
}

const ASSET_ICONS: Record<string, string> = {
  "BTC/USDT": "₿",
  "ETH/USDT": "Ξ",
  "SOL/USDT": "◎",
  "ADA/USDT": "₳",
  "XRP/USDT": "✕",
  "BNB/USDT": "◈",
  "SUI/USDT": "⬡",
  "XAUT/USDT": "◆",
};

const TF_ORDER = ["5m", "15m", "30m", "1h", "4h", "1d"];

function describeTimeframe(tf: TimeframeAnalysis): string {
  const { indicators: ind, ict } = tf;
  const parts: string[] = [];

  if (ind.rsi !== null) {
    if (ind.rsi > 70) parts.push(`RSI suracheté (${ind.rsi.toFixed(1)})`);
    else if (ind.rsi > 55) parts.push(`RSI haussier (${ind.rsi.toFixed(1)})`);
    else if (ind.rsi < 30) parts.push(`RSI survendu (${ind.rsi.toFixed(1)})`);
    else if (ind.rsi < 45) parts.push(`RSI baissier (${ind.rsi.toFixed(1)})`);
    else parts.push(`RSI neutre (${ind.rsi.toFixed(1)})`);
  }
  if (ind.macd_hist !== null) parts.push(ind.macd_hist > 0 ? "MACD+" : "MACD−");
  if (ind.close !== null && ind.ema_50 !== null && ind.ema_200 !== null) {
    if (ind.close > ind.ema_50 && ind.close > ind.ema_200) parts.push("au-dessus EMA 50/200");
    else if (ind.close < ind.ema_50 && ind.close < ind.ema_200) parts.push("sous EMA 50/200");
    else parts.push("entre EMA 50/200");
  }
  const inOB = ict.orderBlocks.find(ob => ind.close !== null && ind.close >= ob.low && ind.close <= ob.high);
  if (inOB) parts.push(`OB ${inOB.type === "bullish" ? "haussier" : "baissier"}`);
  if (ict.recentSSLSweep) parts.push("SSL swept ↑");
  if (ict.recentBSLSweep) parts.push("BSL swept ↓");
  return parts.join(" · ") || "—";
}

function AccumBadge({ zone }: { zone: AccumulationZone }) {
  const isAccum = zone.type === "accumulation";
  const isDistrib = zone.type === "distribution";
  return (
    <span
      className={clsx(
        "font-mono text-[10px] px-1.5 py-0.5 rounded border font-semibold",
        isAccum && zone.strength === "strong" && "text-accent-green bg-accent-green/10 border-accent-green/30",
        isAccum && zone.strength === "weak" && "text-accent-green/60 bg-accent-green/5 border-accent-green/15",
        isDistrib && zone.strength === "strong" && "text-accent-red bg-accent-red/10 border-accent-red/30",
        isDistrib && zone.strength === "weak" && "text-accent-red/60 bg-accent-red/5 border-accent-red/15",
        !isAccum && !isDistrib && "text-slate-500 bg-surface-3 border-border",
      )}
    >
      {isAccum ? "▣ ACCUM" : isDistrib ? "▽ DISTRIB" : "◈ CONSOL"}
      {zone.strength === "strong" ? " ★" : ""}
      <span className="text-[9px] opacity-60 ml-0.5">{zone.rangePercent.toFixed(1)}%</span>
    </span>
  );
}

export default function AssetCard({ asset }: AssetCardProps) {
  const [selectedTF, setSelectedTF] = useState<string>("1h");
  const icon = ASSET_ICONS[asset.symbol] ?? "○";
  const ticker = asset.symbol.split("/")[0];

  const activeTF =
    asset.timeframes.find(tf => tf.timeframe === selectedTF) ??
    asset.timeframes[asset.timeframes.length - 1];

  const priceClose = activeTF?.indicators.close;

  return (
    <div
      className={clsx(
        "rounded-xl border bg-surface-1 overflow-hidden transition-all duration-300",
        asset.confluence && asset.global_trend === "BULLISH" && "border-accent-green/40 glow-green",
        asset.confluence && asset.global_trend === "BEARISH" && "border-accent-red/40 glow-red",
        !asset.confluence && "border-border hover:border-slate-500/60",
      )}
    >
      {/* Header */}
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
            asset.global_trend === "BULLISH" ? "bg-accent-green/15 text-accent-green" : "bg-accent-red/15 text-accent-red",
          )}
        >
          <span className="animate-pulse_slow">◉</span>
          CONFLUENCE — {asset.timeframes.length} TIMEFRAMES ALIGNÉS
        </div>
      )}

      {/* Chart area */}
      <div className="px-3 pt-3 pb-2 bg-surface-2/30">
        {/* TF selector — scrollable row for 6 TFs */}
        <div className="flex items-center gap-1 mb-2 overflow-x-auto pb-0.5 scrollbar-none">
          <span className="font-mono text-[9px] text-slate-600 mr-0.5 flex-shrink-0">TF</span>
          {TF_ORDER.map(tf => {
            const tfData = asset.timeframes.find(t => t.timeframe === tf);
            if (!tfData) return null;
            return (
              <button
                key={tf}
                onClick={() => setSelectedTF(tf)}
                className={clsx(
                  "flex-shrink-0 font-mono text-[10px] px-1.5 py-0.5 rounded border transition-all",
                  selectedTF === tf
                    ? tfData.trend === "BULLISH"
                      ? "border-accent-green/50 text-accent-green bg-accent-green/10"
                      : tfData.trend === "BEARISH"
                      ? "border-accent-red/50 text-accent-red bg-accent-red/10"
                      : "border-accent-cyan/50 text-accent-cyan bg-accent-cyan/10"
                    : "border-border text-slate-500 hover:text-slate-300",
                )}
              >
                {tf}
              </button>
            );
          })}
        </div>

        {/* Candlestick chart */}
        <CandleChart candles={activeTF.candles} height={160} />

        {/* Description + accumulation */}
        <div className="flex items-start justify-between gap-2 mt-1.5">
          <p className="font-mono text-[10px] text-slate-500 leading-relaxed flex-1">
            {describeTimeframe(activeTF)}
          </p>
          {activeTF.accumulation && (
            <AccumBadge zone={activeTF.accumulation} />
          )}
        </div>
      </div>

      {/* Timeframe breakdown */}
      <TimeframeTable timeframes={asset.timeframes} />
    </div>
  );
}
