"use client";
import { useEffect, useRef } from "react";
import type { Candle } from "@/types";

interface CandleChartProps {
  candles: Candle[];
  height?: number;
}

export default function CandleChart({ candles, height = 160 }: CandleChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !candles.length || typeof window === "undefined") return;
    const el = containerRef.current;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let chart: any;
    let ro: ResizeObserver;

    import("lightweight-charts").then(({ createChart }) => {
      if (!containerRef.current) return;

      chart = createChart(el, {
        width: el.clientWidth,
        height,
        layout: {
          background: { color: "transparent" } as never,
          textColor: "#475569",
          fontSize: 10,
          fontFamily: "'JetBrains Mono', monospace",
        },
        grid: {
          vertLines: { color: "#0f172a" },
          horzLines: { color: "#0f172a" },
        },
        rightPriceScale: {
          borderColor: "#1e293b",
          textColor: "#475569",
        },
        timeScale: {
          borderColor: "#1e293b",
          timeVisible: true,
          secondsVisible: false,
          fixLeftEdge: true,
        },
        crosshair: { mode: 1 },
        handleScroll: { mouseWheel: false, pressedMouseMove: true, horzTouchDrag: true },
        handleScale: { mouseWheel: false, pinch: true },
      });

      const series = chart.addCandlestickSeries({
        upColor: "#22c55e",
        downColor: "#ef4444",
        borderUpColor: "#22c55e",
        borderDownColor: "#ef4444",
        wickUpColor: "#22c55e",
        wickDownColor: "#ef4444",
      });

      series.setData(
        candles.map(c => ({
          time: Math.floor(c.time / 1000) as unknown as never,
          open: c.open,
          high: c.high,
          low: c.low,
          close: c.close,
        }))
      );

      chart.timeScale().fitContent();

      ro = new ResizeObserver(() => {
        if (el.clientWidth > 0) chart?.resize(el.clientWidth, height);
      });
      ro.observe(el);
    });

    return () => {
      ro?.disconnect();
      chart?.remove();
    };
  }, [candles, height]);

  return (
    <div
      ref={containerRef}
      className="w-full rounded overflow-hidden bg-surface"
      style={{ height }}
    />
  );
}
