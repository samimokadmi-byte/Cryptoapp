from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    binance_api_key: str = ""
    binance_api_secret: str = ""
    refresh_interval: int = 30  # seconds between data refresh
    cors_origins: str = "http://localhost:3000"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
