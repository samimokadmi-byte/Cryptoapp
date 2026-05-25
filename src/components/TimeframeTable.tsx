import { TimeframeAnalysis } from "@/types";
import TrendBadge from "./TrendBadge";
import ScoreBar from "./ScoreBar";
import IndicatorRow from "./IndicatorRow";
import ICTPanel from "./ICTPanel";
import clsx from "clsx";

interface TimeframeTableProps {
  timeframes: TimeframeAnalysis[];
}

const TF_ORDER = ["15m", "30m", "1h"];

export default function TimeframeTable({ timeframes }: TimeframeTableProps) {
  const sorted = [...timeframes].sort(
    (a, b) => TF_ORDER.indexOf(a.timeframe) - TF_ORDER.indexOf(b.timeframe)
  );

  return (
    <div className="divide-y divide-border">
      {sorted.map((tf) => (
        <div
          key={tf.timeframe}
          className={clsx(
            "px-4 py-3",
            tf.trend === "BULLISH" && "bg-accent-green/5",
            tf.trend === "BEARISH" && "bg-accent-red/5",
          )}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-xs font-semibold text-slate-300 tracking-widest">
              {tf.timeframe.toUpperCase()}
            </span>
            <TrendBadge trend={tf.trend} size="sm" />
          </div>
          <ScoreBar score={tf.score} />
          <div className="mt-2">
            <IndicatorRow indicators={tf.indicators} />
          </div>
          <ICTPanel ict={tf.ict} close={tf.indicators.close} />
        </div>
      ))}
    </div>
  );
}
