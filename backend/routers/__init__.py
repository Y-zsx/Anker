from backend.routers.devices import router as devices_router
from backend.routers.audio import router as audio_router
from backend.routers.ai import router as ai_router
from backend.routers.report import router as report_router

__all__ = ["devices_router", "audio_router", "ai_router", "report_router"]
