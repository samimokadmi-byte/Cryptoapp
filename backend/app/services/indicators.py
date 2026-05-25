import pandas as pd
import pandas_ta as ta
from app.models.schemas import IndicatorSnapshot


def compute_indicators(df: pd.DataFrame) -> IndicatorSnapshot:
    """
    Compute RSI, MACD, EMA-50, EMA-200 on a OHLCV DataFrame.
    Returns the most-recent bar values as an IndicatorSnapshot.
    """
    close = df["close"]

    rsi_series = ta.rsi(close, length=14)
    macd_df = ta.macd(close, fast=12, slow=26, signal=9)
    ema50 = ta.ema(close, length=50)
    ema200 = ta.ema(close, length=200)

    def last(s: pd.Series | None):
        if s is None or s.empty:
            return None
        val = s.iloc[-1]
        return None if pd.isna(val) else round(float(val), 6)

    macd_val = macd_signal = macd_hist = None
    if macd_df is not None and not macd_df.empty:
        # pandas_ta column names: MACD_12_26_9, MACDs_12_26_9, MACDh_12_26_9
        cols = macd_df.columns.tolist()
        macd_col = next((c for c in cols if c.startswith("MACD_")), None)
        sig_col = next((c for c in cols if c.startswith("MACDs_")), None)
        hist_col = next((c for c in cols if c.startswith("MACDh_")), None)
        if macd_col:
            macd_val = last(macd_df[macd_col])
        if sig_col:
            macd_signal = last(macd_df[sig_col])
        if hist_col:
            macd_hist = last(macd_df[hist_col])

    return IndicatorSnapshot(
        rsi=last(rsi_series),
        macd=macd_val,
        macd_signal=macd_signal,
        macd_hist=macd_hist,
        ema_50=last(ema50),
        ema_200=last(ema200),
        close=last(close),
    )
