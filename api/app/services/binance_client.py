import logging
import httpx
import pandas as pd

logger = logging.getLogger(__name__)

BINANCE_BASE = "https://api.binance.com"
SYMBOLS = ["SOLUSDT", "ADAUSDT", "XRPUSDT", "BNBUSDT", "SUIUSDT"]
TIMEFRAMES = {"15m": "15m", "30m": "30m", "1h": "1h"}
KLINE_LIMIT = 250

_COLUMNS = [
    "open_time", "open", "high", "low", "close", "volume",
    "close_time", "quote_volume", "trades",
    "taker_buy_base", "taker_buy_quote", "ignore",
]


def check_connection() -> bool:
    try:
        with httpx.Client(timeout=5) as client:
            return client.get(f"{BINANCE_BASE}/api/v3/ping").status_code == 200
    except Exception as exc:
        logger.warning("Binance ping failed: %s", exc)
        return False


def fetch_klines(symbol: str, interval: str, limit: int = KLINE_LIMIT) -> pd.DataFrame:
    with httpx.Client(timeout=30) as client:
        resp = client.get(
            f"{BINANCE_BASE}/api/v3/klines",
            params={"symbol": symbol, "interval": interval, "limit": limit},
        )
        resp.raise_for_status()

    df = pd.DataFrame(resp.json(), columns=_COLUMNS)
    for col in ["open", "high", "low", "close", "volume"]:
        df[col] = df[col].astype(float)
    df["open_time"] = pd.to_datetime(df["open_time"], unit="ms")
    df.set_index("open_time", inplace=True)
    return df[["open", "high", "low", "close", "volume"]]
