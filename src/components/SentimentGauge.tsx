import type { SentimentResult } from "@/types";
import clsx from "clsx";

interface SentimentGaugeProps {
  sentiment: SentimentResult;
}

const ZONES = [
  { label: "Peur Extrême", min: 0, max: 20, color: "#ef4444" },
  { label: "Peur", min: 20, max: 40, color: "#f97316" },
  { label: "Neutre", min: 40, max: 60, color: "#eab308" },
  { label: "Avidité", min: 60, max: 80, color: "#84cc16" },
  { label: "Avidité Extrême", min: 80, max: 100, color: "#22c55e" },
];

function zoneColor(score: number): string {
  return ZONES.find(z => score >= z.min && score <= z.max)?.color ?? "#eab308";
}

export default function SentimentGauge({ sentiment }: SentimentGaugeProps) {
  const { score, label, source } = sentiment;
  const pct = Math.max(0, Math.min(100, score));
  const color = zoneColor(pct);

  return (
    <div className="rounded-xl border border-border bg-surface-1 px-5 py-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="font-mono text-xs font-semibold tracking-widest text-slate-400 uppercase">
            Sentiment du marché
          </p>
          <p
            className="font-mono text-lg font-bold mt-0.5"
            style={{ color }}
          >
            {label}
          </p>
        </div>
        <div className="text-right">
          <p
            className="font-mono text-3xl font-bold tabular-nums"
            style={{ color }}
          >
            {pct}
          </p>
          <p className="font-mono text-[10px] text-slate-600 mt-0.5">
            {source === "fear_greed_api" ? "Fear & Greed Index" : "Score calculé"}
          </p>
        </div>
      </div>

      {/* Gradient bar */}
      <div className="relative">
        <div
          className="w-full h-2.5 rounded-full overflow-hidden"
          style={{
            background:
              "linear-gradient(to right, #ef4444 0%, #f97316 25%, #eab308 50%, #84cc16 75%, #22c55e 100%)",
          }}
        >
          {/* Marker */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-white shadow"
            style={{ left: `calc(${pct}% - 6px)`, backgroundColor: color }}
          />
        </div>

        {/* Zone labels */}
        <div className="flex justify-between mt-1.5 font-mono text-[9px] text-slate-600">
          <span>Peur<br/>Extrême</span>
          <span className="text-center">Peur</span>
          <span className="text-center">Neutre</span>
          <span className="text-center">Avidité</span>
          <span className="text-right">Avidité<br/>Extrême</span>
        </div>
      </div>

      {/* Zone pills */}
      <div className="flex gap-1 mt-3 flex-wrap">
        {ZONES.map(z => (
          <span
            key={z.label}
            className={clsx(
              "font-mono text-[9px] px-1.5 py-0.5 rounded border transition-all",
              pct >= z.min && pct < z.max
                ? "font-semibold border-current"
                : "text-slate-700 border-transparent bg-surface-3",
            )}
            style={pct >= z.min && pct < z.max ? { color: z.color, borderColor: z.color, backgroundColor: z.color + "18" } : {}}
          >
            {z.min}–{z.max}
          </span>
        ))}
      </div>
    </div>
  );
}
