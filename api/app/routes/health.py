from fastapi import APIRouter
from app.services.binance_client import check_connection
from app.models.schemas import HealthResponse

router = APIRouter(prefix="/health", tags=["health"])


@router.get("", response_model=HealthResponse)
async def health_check():
    connected = check_connection()
    return HealthResponse(
        status="ok" if connected else "degraded",
        binance_connected=connected,
        message="Binance reachable" if connected else "Binance unreachable — check API keys or network",
    )
