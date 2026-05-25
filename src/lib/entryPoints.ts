import type { AssetAnalysis, EntryPoint } from "@/types";

export function detectEntryPoints(assets: AssetAnalysis[]): EntryPoint[] {
  const entries: EntryPoint[] = [];

  for (const asset of assets) {
    for (const tf of asset.timeframes) {
      const price = tf.indicators.close;
      if (price === null) continue;

      for (const ob of tf.ict.orderBlocks) {
        const NEAR = 0.005; // within 0.5% of OB edge

        if (ob.type === "bullish") {
          // Price inside or approaching from above (within 0.5% above ob.high)
          const near = price >= ob.low * 0.99 && price <= ob.high * (1 + NEAR);
          if (!near) continue;

          const reasons: string[] = ["OB haussier"];
          const hasFVG = tf.ict.fvgs.some(
            f => f.type === "bullish" && f.low < ob.high && f.high > ob.low
          );
          if (hasFVG) reasons.push("FVG confluence");
          if (tf.ict.recentSSLSweep) reasons.push("SSL swept");
          if (tf.trend === "BULLISH") reasons.push("Tendance confirmée");
          if (tf.score >= 2) reasons.push(`Score +${tf.score}`);

          entries.push({
            symbol: asset.symbol,
            timeframe: tf.timeframe,
            direction: "long",
            entryZone: { low: ob.low, high: ob.high },
            stopLoss: ob.low * 0.997,
            reasons,
            confidence: (hasFVG && tf.ict.recentSSLSweep) || reasons.length >= 3 ? "high" : "medium",
          });
        }

        if (ob.type === "bearish") {
          // Price inside or approaching from below (within 0.5% below ob.low)
          const near = price <= ob.high * 1.01 && price >= ob.low * (1 - NEAR);
          if (!near) continue;

          const reasons: string[] = ["OB baissier"];
          const hasFVG = tf.ict.fvgs.some(
            f => f.type === "bearish" && f.low < ob.high && f.high > ob.low
          );
          if (hasFVG) reasons.push("FVG confluence");
          if (tf.ict.recentBSLSweep) reasons.push("BSL swept");
          if (tf.trend === "BEARISH") reasons.push("Tendance confirmée");
          if (tf.score <= -2) reasons.push(`Score ${tf.score}`);

          entries.push({
            symbol: asset.symbol,
            timeframe: tf.timeframe,
            direction: "short",
            entryZone: { low: ob.low, high: ob.high },
            stopLoss: ob.high * 1.003,
            reasons,
            confidence: (hasFVG && tf.ict.recentBSLSweep) || reasons.length >= 3 ? "high" : "medium",
          });
        }
      }
    }
  }

  return entries.sort((a, b) => {
    if (a.confidence !== b.confidence) return a.confidence === "high" ? -1 : 1;
    return b.reasons.length - a.reasons.length;
  });
}
