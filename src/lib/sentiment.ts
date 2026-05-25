import type { AssetAnalysis, SentimentResult } from "@/types";

export async function fetchFearGreed(): Promise<SentimentResult | null> {
  try {
    const res = await fetch("https://api.alternative.me/fng/?limit=1&format=json", {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = await res.json();
    const item = data?.data?.[0];
    if (!item) return null;
    const score = parseInt(item.value);
    const label = translateFGLabel(item.value_classification as string);
    return { score, label, source: "fear_greed_api" };
  } catch {
    return null;
  }
}

function translateFGLabel(raw: string): string {
  const map: Record<string, string> = {
    "Extreme Fear": "Peur Extrême",
    "Fear": "Peur",
    "Neutral": "Neutre",
    "Greed": "Avidité",
    "Extreme Greed": "Avidité Extrême",
  };
  return map[raw] ?? raw;
}

export function computeSentiment(assets: AssetAnalysis[]): SentimentResult {
  let total = 0;
  let count = 0;
  for (const asset of assets) {
    for (const tf of asset.timeframes) {
      total += tf.score; // -3 to +3
      count++;
    }
  }
  const avg = count > 0 ? total / count : 0;
  // Normalize avg (-3..+3) to 0..100
  const score = Math.round(((avg + 3) / 6) * 100);

  let label: string;
  if (score >= 80) label = "Avidité Extrême";
  else if (score >= 60) label = "Avidité";
  else if (score >= 40) label = "Neutre";
  else if (score >= 20) label = "Peur";
  else label = "Peur Extrême";

  return { score, label, source: "computed" };
}
