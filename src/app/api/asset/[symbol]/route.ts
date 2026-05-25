import { NextResponse } from "next/server";
import { analyzeSymbol } from "@/lib/analysis";
import { SYMBOLS } from "@/lib/binance";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: { symbol: string } }
) {
  const raw = params.symbol.toUpperCase().replace(/[/\-]/g, "");
  if (!SYMBOLS.includes(raw)) {
    return NextResponse.json({ error: `Symbol '${raw}' not tracked` }, { status: 404 });
  }
  try {
    const data = await analyzeSymbol(raw);
    return NextResponse.json(data);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
