"""
Trend scoring engine.

Each timeframe produces a score from -3 to +3 based on 4 signals:
  +1 / -1  RSI > 55 / RSI < 45
  +1 / -1  MACD histogram > 0 / < 0
  +1 / -1  MACD line > signal line
  +1 / -1  Price > EMA-50
  +1 / -1  Price > EMA-200  (bonus weight for long-term trend)

Raw score ranges -5 to +5; we clamp to [-3, +3] for display.
"""
from app.models.schemas import IndicatorSnapshot, TrendSignal


def score_timeframe(snap: IndicatorSnapshot) -> tuple[TrendSignal, int]:
    score = 0

    if snap.rsi is not None:
        if snap.rsi > 55:
            score += 1
        elif snap.rsi < 45:
            score -= 1

    if snap.macd_hist is not None:
        score += 1 if snap.macd_hist > 0 else -1

    if snap.macd is not None and snap.macd_signal is not None:
        score += 1 if snap.macd > snap.macd_signal else -1

    if snap.close is not None and snap.ema_50 is not None:
        score += 1 if snap.close > snap.ema_50 else -1

    if snap.close is not None and snap.ema_200 is not None:
        score += 1 if snap.close > snap.ema_200 else -1

    score = max(-3, min(3, score))

    if score >= 2:
        trend: TrendSignal = "BULLISH"
    elif score <= -2:
        trend = "BEARISH"
    else:
        trend = "NEUTRAL"

    return trend, score


def aggregate_trends(tf_trends: list[TrendSignal]) -> tuple[TrendSignal, int, bool]:
    """
    Returns (global_trend, global_score, confluence).
    confluence = True only when all 3 timeframes share the same non-NEUTRAL trend.
    """
    score_map = {"BULLISH": 1, "NEUTRAL": 0, "BEARISH": -1}
    total = sum(score_map[t] for t in tf_trends)

    confluence = len(set(tf_trends)) == 1 and tf_trends[0] != "NEUTRAL"

    if total >= 2:
        global_trend: TrendSignal = "BULLISH"
    elif total <= -2:
        global_trend = "BEARISH"
    else:
        global_trend = "NEUTRAL"

    return global_trend, total, confluence
