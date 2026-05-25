import { NextResponse } from "next/server";
import { pingBinance } from "@/lib/binance";

export const dynamic = "force-dynamic";

export async function GET() {
  const connected = await pingBinance();
  return NextResponse.json({
    status: connected ? "ok" : "degraded",
    binance_connected: connected,
  });
}
