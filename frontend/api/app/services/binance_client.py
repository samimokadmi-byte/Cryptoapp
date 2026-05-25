import logging
from binance.client import Client
from binance.exceptions import BinanceAPIException
import pandas as pd
from app.config import get_settings

logger = logging.getLogger(__name__)

SYMBOLS = ["SOLUSDT", "ADAUSDT", "XRPUSDT", "BNBUSDT", "SUIUSDT"]
TIMEFRAMES = {
    "15m": Client.KLINE_INTERVAL_15MINUTE,
    "30m": Client.KLINE_INTERVAL_30MINUTE,
    "1h": Client.KLINE_INTERVAL_1HOUR,
}
KLINE_LIMIT = 250  # enough for EMA 200


def _build_client() -> Client:
    settings = get_settings()
    return Client(
        api_key=settings.binance_api_key or None,
        api_secret=settings.binance_api_secret or None,
        tld="com",
    )


_client: Client | None = None


def get_client() -> Client:
    global _client
    if _client is None:
        _client = _build_client()
    return _client


def check_connection() -> bool:
    try:
        get_client().ping()
        return True
    except Exception as exc:
        logger.warning("Binance ping failed: %s", exc)
        return False


def fetch_klines(symbol: str, interval: str, limit: int = KLINE_LIMIT) -> pd.DataFrame:
    """Return OHLCV DataFrame for a symbol/interval."""
    client = get_client()
    raw = client.get_klines(symbol=symbol, interval=interval, limit=limit)
    columns = [
        "open_time", "open", "high", "low", "close", "volume",
        "close_time", "quote_volume", "trades",
        "taker_buy_base", "taker_buy_quote", "ignore",
    ]
    df = pd.DataFrame(raw, columns=columns)
    for col in ["open", "high", "low", "close", "volume"]:
        df[col] = df[col].astype(float)
    df["open_time"] = pd.to_datetime(df["open_time"], unit="ms")
    df.set_index("open_time", inplace=True)
    return df[["open", "high", "low", "close", "volume"]]
