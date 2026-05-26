"""
ANKERHUB Backend - FastAPI
Simulates the complete device-APP-cloud-AI pipeline

Architecture:
    - Device simulation layer (bluetooth earbuds + mic)
    - Audio capture simulation (real-time metrics streaming)
    - AI processing layer (mock transcribe/translate/summarize)
    - Persistence layer (SQLite via SQLAlchemy async)
    - UI layer (REST API + SSE for real-time updates)
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.config import get_settings
from backend.database import close_db, init_db
from backend.routers import ai_router, audio_router, devices_router, report_router

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifecycle."""
    await init_db()
    yield
    await close_db()


app = FastAPI(
    title="ANKERHUB",
    version="1.0.0",
    description="AI Earbuds Hub - Device simulation and AI processing pipeline",
    lifespan=lifespan,
)

# Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(devices_router)
app.include_router(audio_router)
app.include_router(ai_router)
app.include_router(report_router)


@app.get("/api/health")
async def health():
    """System health check."""
    from backend.services.device_simulator import get_device_simulator
    from backend.services.audio_simulator import get_audio_simulator

    device_sim = get_device_simulator()
    audio_sim = get_audio_simulator()

    return {
        "status": "ok",
        "device_connected": device_sim.connected,
        "recording_active": audio_sim.is_recording,
        "database_connected": True,
        "version": settings.app_version,
    }


# Backward-compatible alias: frontend calls /api/devices, router provides /api/device/list
@app.get("/api/devices")
async def list_devices_compat():
    from backend.routers.devices import list_devices
    return await list_devices()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "backend.main:app",
        host=settings.host,
        port=settings.port,
        reload=True,
    )
