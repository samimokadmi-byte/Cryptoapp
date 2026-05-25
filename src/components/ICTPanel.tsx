import type { ICTResult } from "@/types";
import clsx from "clsx";

interface ICTPanelProps {
  ict: ICTResult;
  close: number | null;
}

function fmtPrice(p: number): string {
  if (p >= 1000) return p.toFixed(1);
  if (p >= 10) return p.toFixed(2);
  if (p >= 1) return p.toFixed(3);
  return p.toFixed(4);
}

function inZone(close: number | null, low: number, high: number): boolean {
  return close !== null && close >= low && close <= high;
}

export default function ICTPanel({ ict, close }: ICTPanelProps) {
  const hasData = ict.fvgs.length > 0 || ict.orderBlocks.length > 0 || ict.liquidity.length > 0;
  if (!hasData) return null;

  return (
    <div className="mt-2 pt-2 border-t border-border/50 space-y-1 font-mono text-xs">

      {/* Order Blocks */}
      {ict.orderBlocks.map((ob, i) => {
        const inside = inZone(close, ob.low, ob.high);
        return (
          <div key={`ob-${i}`} className="flex items-center gap-1.5">
            <span
              className={clsx(
                "flex-shrink-0 px-1 py-0.5 rounded text-[10px] font-semibold tracking-wide",
                ob.type === "bullish"
                  ? "bg-accent-green/20 text-accent-green border border-accent-green/30"
                  : "bg-accent-red/20 text-accent-red border border-accent-red/30"
              )}
            >
              OB{ob.type === "bullish" ? "↑" : "↓"}
            </span>
            <span className="text-slate-400">
              {fmtPrice(ob.low)}
              <span className="text-slate-600 mx-0.5">–</span>
              {fmtPrice(ob.high)}
            </span>
            {inside && (
              <span
                className={clsx(
                  "text-[10px] font-semibold animate-pulse_slow",
                  ob.type === "bullish" ? "text-accent-green" : "text-accent-red"
                )}
              >
                ◉ INSIDE
              </span>
            )}
          </div>
        );
      })}

      {/* FVGs */}
      {ict.fvgs.map((fvg, i) => {
        const inside = inZone(close, fvg.low, fvg.high);
        return (
          <div key={`fvg-${i}`} className="flex items-center gap-1.5">
            <span
              className={clsx(
                "flex-shrink-0 px-1 py-0.5 rounded text-[10px] font-semibold tracking-wide",
                fvg.type === "bullish"
                  ? "bg-accent-green/10 text-accent-green/80 border border-accent-green/20"
                  : "bg-accent-red/10 text-accent-red/80 border border-accent-red/20"
              )}
            >
              FVG{fvg.type === "bullish" ? "↑" : "↓"}
            </span>
            <span className="text-slate-500">
              {fmtPrice(fvg.low)}
              <span className="text-slate-600 mx-0.5">–</span>
              {fmtPrice(fvg.high)}
            </span>
            {inside && (
              <span className="text-[10px] text-accent-amber font-semibold">◈ FILL</span>
            )}
          </div>
        );
      })}

      {/* Liquidity */}
      {ict.liquidity.length > 0 && (
        <div className="flex flex-wrap gap-x-3 gap-y-0.5 pt-0.5">
          {ict.liquidity.map((l, i) => (
            <span
              key={`liq-${i}`}
              className={clsx(
                "flex items-center gap-1",
                l.swept ? "opacity-50 line-through" : "",
                l.type === "bsl" ? "text-accent-amber" : "text-slate-400"
              )}
            >
              <span className="text-[10px] font-semibold">
                {l.type === "bsl" ? "BSL" : "SSL"}
              </span>
              {fmtPrice(l.price)}
              {l.swept && <span className="no-underline text-[10px] opacity-80">✓</span>}
            </span>
          ))}
        </div>
      )}

      {/* Sweep alerts */}
      {(ict.recentSSLSweep || ict.recentBSLSweep) && (
        <div
          className={clsx(
            "flex items-center gap-1.5 text-[10px] font-semibold tracking-wider mt-1",
            ict.recentSSLSweep ? "text-accent-green" : "text-accent-red"
          )}
        >
          <span className="animate-pulse_slow">◉</span>
          {ict.recentSSLSweep ? "SSL SWEPT — REVERSAL HAUSSIER POTENTIEL" : "BSL SWEPT — REVERSAL BAISSIER POTENTIEL"}
        </div>
      )}
    </div>
  );
}
