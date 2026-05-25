import type { EntryPoint } from "@/types";
import clsx from "clsx";

interface EntryPointsPanelProps {
  entries: EntryPoint[];
}

function fmtPrice(p: number): string {
  if (p >= 1000) return p.toFixed(1);
  if (p >= 10) return p.toFixed(2);
  if (p >= 1) return p.toFixed(3);
  return p.toFixed(4);
}

export default function EntryPointsPanel({ entries }: EntryPointsPanelProps) {
  if (entries.length === 0) {
    return (
      <p className="font-mono text-xs text-slate-600 text-center py-3">
        Aucun point d&apos;entrée actif — prix éloigné des zones OB
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
      {entries.map((ep, i) => (
        <div
          key={i}
          className={clsx(
            "rounded-xl border p-4 space-y-3",
            ep.direction === "long"
              ? "border-accent-green/40 bg-accent-green/5"
              : "border-accent-red/40 bg-accent-red/5",
            ep.confidence === "high" && "shadow-lg",
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className={clsx(
                  "font-mono text-sm font-bold",
                  ep.direction === "long" ? "text-accent-green" : "text-accent-red"
                )}
              >
                {ep.direction === "long" ? "▲ LONG" : "▼ SHORT"}
              </span>
              <span className="font-mono text-sm font-semibold text-white">{ep.symbol}</span>
              <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-surface-3 text-slate-400 border border-border">
                {ep.timeframe}
              </span>
            </div>
            <span
              className={clsx(
                "font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded border tracking-wide",
                ep.confidence === "high"
                  ? "text-accent-cyan bg-accent-cyan/10 border-accent-cyan/30"
                  : "text-slate-400 bg-surface-3 border-border"
              )}
            >
              {ep.confidence === "high" ? "★ HAUTE" : "MEDIUM"}
            </span>
          </div>

          {/* Zones */}
          <div className="font-mono text-xs space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 w-12">Zone</span>
              <span
                className={clsx(
                  "font-semibold",
                  ep.direction === "long" ? "text-accent-green" : "text-accent-red"
                )}
              >
                {fmtPrice(ep.entryZone.low)}
                <span className="text-slate-600 mx-1">–</span>
                {fmtPrice(ep.entryZone.high)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500 w-12">SL</span>
              <span className="text-accent-red/70">{fmtPrice(ep.stopLoss)}</span>
            </div>
          </div>

          {/* Reasons */}
          <div className="flex flex-wrap gap-1">
            {ep.reasons.map((r, j) => (
              <span
                key={j}
                className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-surface-3 text-slate-300 border border-border"
              >
                {r}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
