import { NextResponse } from "next/server";
import { analyzeAll } from "@/lib/analysis";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const assets = await analyzeAll();
    const confluences = assets.filter(a => a.confluence);
    return NextResponse.json({
      assets,
      confluences,
      generated_at: new Date().toISOString(),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
