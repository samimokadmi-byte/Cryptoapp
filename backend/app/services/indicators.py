import pandas as pd
from app.models.schemas import IndicatorSnapshot


def _ema(series: pd.Series, period: int) -> pd.Series:
    return series.ewm(span=period, adjust=False, min_periods=period).mean()


def _rsi(series: pd.Series, period: int = 14) -> pd.Series:
    delta = series.diff()
    gain = delta.clip(lower=0)
    loss = (-delta).clip(lower=0)
    avg_gain = gain.ewm(com=period - 1, adjust=False, min_periods=period).mean()
    avg_loss = loss.ewm(com=period - 1, adjust=False, min_periods=period).mean()
    rs = avg_gain / avg_loss
    return 100 - (100 / (1 + rs))


def _macd(
    series: pd.Series, fast: int = 12, slow: int = 26, signal: int = 9
) -> tuple[pd.Series, pd.Series, pd.Series]:
    ema_fast = _ema(series, fast)
    ema_slow = _ema(series, slow)
    macd_line = ema_fast - ema_slow
    signal_line = _ema(macd_line, signal)
    histogram = macd_line - signal_line
    return macd_line, signal_line, histogram


def compute_indicators(df: pd.DataFrame) -> IndicatorSnapshot:
    close = df["close"]

    rsi = _rsi(close)
    macd_line, macd_signal, macd_hist = _macd(close)
    ema50 = _ema(close, 50)
    ema200 = _ema(close, 200)

    def last(s: pd.Series):
        val = s.iloc[-1]
        return None if pd.isna(val) else round(float(val), 6)

    return IndicatorSnapshot(
        rsi=last(rsi),
        macd=last(macd_line),
        macd_signal=last(macd_signal),
        macd_hist=last(macd_hist),
        ema_50=last(ema50),
        ema_200=last(ema200),
        close=last(close),
    )
