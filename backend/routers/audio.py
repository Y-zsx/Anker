"""Audio capture routes - uses audio simulator for real-time metrics"""
import json
import asyncio
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sse_starlette.sse import EventSourceResponse

from backend.services.audio_simulator import get_audio_simulator, AudioSimulator
from backend.services.device_simulator import get_device_simulator
from backend.models.schemas import SCENARIOS

router = APIRouter(prefix="/api/audio", tags=["audio"])


def _get_sim() -> AudioSimulator:
    return get_audio_simulator()


@router.get("/scenarios")
async def list_scenarios():
    """List available recording scenarios."""
    return {
        "scenarios": [
            {"id": sid, "label": s.get("label", sid), "description": ""}
            for sid, s in SCENARIOS.items()
        ]
    }


@router.post("/start/{scenario}")
async def start_recording(scenario: str):
    """Start simulated recording with real-time metrics stream."""
    sim = get_audio_simulator()
    device_sim = get_device_simulator()

    if not device_sim.connected:
        raise HTTPException(status_code=400, detail="请先连接设备")

    if sim.is_recording:
        raise HTTPException(status_code=400, detail="已有录音正在进行")

    # Enable mic on device
    device_sim.enable_mic()
    sim.start(scenario)

    async def recording_stream():
        try:
            # Stream live metrics at ~4Hz
            max_duration = 120  # seconds
            while sim.is_recording:
                metrics = sim.get_live_metrics()
                yield {
                    "event": "audio",
                    "data": json.dumps({
                        "phase": "recording",
                        "elapsed": metrics.duration,
                        "volume": metrics.volume_level,
                        "noise_level": metrics.noise_level,
                        "clarity_score": metrics.clarity_score,
                        "sample_rate": metrics.sample_rate,
                        "text": metrics.text,
                    }),
                }
                await asyncio.sleep(0.25)

                # Auto-stop after max duration
                if metrics.duration >= max_duration:
                    break
        finally:
            # Clean up when stream ends
            sim.stop()
            device_sim.disable_mic()

    return EventSourceResponse(recording_stream())


@router.post("/stop")
async def stop_recording():
    """Stop current recording."""
    sim = get_audio_simulator()
    device_sim = get_device_simulator()

    if not sim.is_recording:
        raise HTTPException(status_code=400, detail="没有正在进行的录音")

    metrics = sim.stop()
    device_sim.disable_mic()

    return {
        "is_recording": False,
        "duration": metrics.duration,
        "sample_rate": metrics.sample_rate,
        "noise_level": metrics.noise_level,
        "clarity_score": metrics.clarity_score,
        "volume_level": metrics.volume_level,
        "text": metrics.text,
    }


@router.get("/state")
async def get_audio_state():
    """Get current audio state."""
    sim = get_audio_simulator()
    m = sim.current_metrics
    return {
        "is_recording": m.is_recording,
        "duration": m.duration,
        "sample_rate": m.sample_rate,
        "noise_level": m.noise_level,
        "clarity_score": m.clarity_score,
        "volume_level": m.volume_level,
        "text": m.text,
    }
