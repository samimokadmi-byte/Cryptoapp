import clsx from "clsx";
import { TrendSignal } from "@/types";

interface TrendBadgeProps {
  trend: TrendSignal;
  size?: "sm" | "md" | "lg";
}

const labels: Record<TrendSignal, string> = {
  BULLISH: "▲ BULLISH",
  BEARISH: "▼ BEARISH",
  NEUTRAL: "◆ NEUTRAL",
};

export default function TrendBadge({ trend, size = "md" }: TrendBadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center font-mono font-semibold rounded tracking-wider border",
        {
          "text-xs px-1.5 py-0.5": size === "sm",
          "text-xs px-2 py-1": size === "md",
          "text-sm px-3 py-1.5": size === "lg",
        },
        trend === "BULLISH" && "text-accent-green bg-accent-green/10 border-accent-green/30",
        trend === "BEARISH" && "text-accent-red bg-accent-red/10 border-accent-red/30",
        trend === "NEUTRAL" && "text-slate-400 bg-slate-700/30 border-slate-600/40",
      )}
    >
      {labels[trend]}
    </span>
  );
}
