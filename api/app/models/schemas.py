from pydantic import BaseModel
from typing import Literal, Optional
from datetime import datetime


TrendSignal = Literal["BULLISH", "BEARISH", "NEUTRAL"]


class IndicatorSnapshot(BaseModel):
    rsi: Optional[float] = None
    macd: Optional[float] = None
    macd_signal: Optional[float] = None
    macd_hist: Optional[float] = None
    ema_50: Optional[float] = None
    ema_200: Optional[float] = None
    close: Optional[float] = None


class TimeframeAnalysis(BaseModel):
    timeframe: str
    indicators: IndicatorSnapshot
    trend: TrendSignal
    score: int  # -3 to +3


class AssetAnalysis(BaseModel):
    symbol: str
    timeframes: list[TimeframeAnalysis]
    global_trend: TrendSignal
    global_score: int  # sum of timeframe scores
    confluence: bool  # True when all 3 timeframes agree
    last_updated: datetime


class DashboardResponse(BaseModel):
    assets: list[AssetAnalysis]
    confluences: list[AssetAnalysis]  # only assets with confluence=True
    generated_at: datetime


class HealthResponse(BaseModel):
    status: str
    binance_connected: bool
    message: str
