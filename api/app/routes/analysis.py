import asyncio
import logging
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException

from app.models.schemas import (
    AssetAnalysis,
    DashboardResponse,
    TimeframeAnalysis,
)
from app.services.binance_client import SYMBOLS, TIMEFRAMES, fetch_klines
from app.services.indicators import compute_indicators
from app.services.scoring import aggregate_trends, score_timeframe

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["analysis"])


def _display_symbol(raw: str) -> str:
    """Convert 'SOLUSDT' → 'SOL/USDT'."""
    return raw.replace("USDT", "/USDT")


def _analyze_symbol(symbol: str) -> AssetAnalysis:
    tf_analyses: list[TimeframeAnalysis] = []
    tf_trends = []

    for tf_label, tf_interval in TIMEFRAMES.items():
        df = fetch_klines(symbol, tf_interval)
        snap = compute_indicators(df)
        trend, score = score_timeframe(snap)
        tf_analyses.append(
            TimeframeAnalysis(timeframe=tf_label, indicators=snap, trend=trend, score=score)
        )
        tf_trends.append(trend)

    global_trend, global_score, confluence = aggregate_trends(tf_trends)

    return AssetAnalysis(
        symbol=_display_symbol(symbol),
        timeframes=tf_analyses,
        global_trend=global_trend,
        global_score=global_score,
        confluence=confluence,
        last_updated=datetime.now(timezone.utc),
    )


@router.get("/dashboard", response_model=DashboardResponse)
async def get_dashboard():
    loop = asyncio.get_event_loop()
    tasks = [
        loop.run_in_executor(None, _analyze_symbol, sym)
        for sym in SYMBOLS
    ]
    try:
        results: list[AssetAnalysis] = await asyncio.gather(*tasks)
    except Exception as exc:
        logger.exception("Error fetching market data")
        raise HTTPException(status_code=502, detail=f"Binance fetch error: {exc}")

    confluences = [a for a in results if a.confluence]

    return DashboardResponse(
        assets=list(results),
        confluences=confluences,
        generated_at=datetime.now(timezone.utc),
    )


@router.get("/asset/{symbol}", response_model=AssetAnalysis)
async def get_asset(symbol: str):
    normalized = symbol.upper().replace("/", "").replace("-", "")
    if normalized not in SYMBOLS:
        raise HTTPException(
            status_code=404,
            detail=f"Symbol '{symbol}' not monitored. Tracked: {SYMBOLS}",
        )
    loop = asyncio.get_event_loop()
    try:
        result = await loop.run_in_executor(None, _analyze_symbol, normalized)
    except Exception as exc:
        logger.exception("Error fetching %s", symbol)
        raise HTTPException(status_code=502, detail=str(exc))
    return result
