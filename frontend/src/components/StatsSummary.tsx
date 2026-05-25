import { AssetAnalysis } from "@/types";

interface StatsSummaryProps {
  assets: AssetAnalysis[];
}

export default function StatsSummary({ assets }: StatsSummaryProps) {
  const bullish = assets.filter((a) => a.global_trend === "BULLISH").length;
  const bearish = assets.filter((a) => a.global_trend === "BEARISH").length;
  const neutral = assets.filter((a) => a.global_trend === "NEUTRAL").length;
  const confluent = assets.filter((a) => a.confluence).length;

  const stats = [
    { label: "BULLISH", value: bullish, color: "text-accent-green", bg: "bg-accent-green/10 border-accent-green/20" },
    { label: "BEARISH", value: bearish, color: "text-accent-red", bg: "bg-accent-red/10 border-accent-red/20" },
    { label: "NEUTRAL", value: neutral, color: "text-slate-400", bg: "bg-slate-700/20 border-slate-600/30" },
    { label: "CONFLUENCE", value: confluent, color: "text-accent-cyan", bg: "bg-accent-cyan/10 border-accent-cyan/20" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {stats.map((s) => (
        <div key={s.label} className={`rounded-lg border px-4 py-3 ${s.bg}`}>
          <p className="font-mono text-xs text-slate-500 tracking-widest">{s.label}</p>
          <p className={`font-mono text-2xl font-bold mt-0.5 ${s.color}`}>{s.value}</p>
          <p className="text-xs text-slate-600 mt-0.5">/ {assets.length} assets</p>
        </div>
      ))}
    </div>
  );
}
