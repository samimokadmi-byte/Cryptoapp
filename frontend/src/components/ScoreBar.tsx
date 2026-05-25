import clsx from "clsx";

interface ScoreBarProps {
  score: number; // -3 to +3
}

export default function ScoreBar({ score }: ScoreBarProps) {
  const clamped = Math.max(-3, Math.min(3, score));
  const pct = ((clamped + 3) / 6) * 100;

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-surface-3 rounded-full overflow-hidden">
        <div
          className={clsx(
            "h-full rounded-full transition-all duration-500",
            clamped >= 2 && "bg-accent-green",
            clamped <= -2 && "bg-accent-red",
            clamped > -2 && clamped < 2 && "bg-accent-amber",
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span
        className={clsx(
          "font-mono text-xs font-semibold w-5 text-right",
          clamped >= 2 && "text-accent-green",
          clamped <= -2 && "text-accent-red",
          clamped > -2 && clamped < 2 && "text-accent-amber",
        )}
      >
        {clamped > 0 ? `+${clamped}` : clamped}
      </span>
    </div>
  );
}
