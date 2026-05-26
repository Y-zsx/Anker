"""Device connection and discovery routes"""
import json
import asyncio
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sse_starlette.sse import EventSourceResponse

from backend.database import get_db
from backend.models.db import DeviceEvent
from backend.services.device_simulator import get_device_simulator

router = APIRouter(prefix="/api/device", tags=["devices"])


@router.get("/list")
async def list_devices():
    """List all available simulated devices."""
    sim = get_device_simulator()
    return {"devices": sim.list_available_devices()}


@router.get("/status")
async def get_device_status():
    """Get current device connection status."""
    sim = get_device_simulator()
    return sim.get_state()


@router.post("/connect/{device_id}")
async def connect_device(device_id: str, db: AsyncSession = Depends(get_db)):
    """Connect a device with SSE progress stream."""
    sim = get_device_simulator()

    async def connect_stream():
        # Phase 1: Searching
        yield {"event": "device", "data": json.dumps({
            "phase": "searching",
            "message": "正在搜索设备...",
        })}
        await asyncio.sleep(0.5)

        # Phase 2: Connecting
        yield {"event": "device", "data": json.dumps({
            "phase": "connecting",
            "message": "正在连接...",
        })}
        await asyncio.sleep(0.8)

        # Phase 3: Handshake
        yield {"event": "device", "data": json.dumps({
            "phase": "handshake",
            "message": "设备握手...",
        })}
        await asyncio.sleep(0.5)

        # Phase 4: Actually connect the simulator
        try:
            device = await sim.connect(device_id)
        except Exception as e:
            yield {"event": "device", "data": json.dumps({
                "phase": "error",
                "message": f"连接失败: {str(e)}",
            })}
            return

        # Phase 5: Connected
        yield {"event": "device", "data": json.dumps({
            "phase": "connected",
            "message": f"{device.name} 已连接",
            "device": {
                "id": device.id,
                "name": device.name,
                "type": device.type,
                "battery": device.battery,
                "signal_strength": device.signal_strength,
                "firmware_version": device.firmware_version,
                "temperature": device.temperature,
                "audio_latency": device.audio_latency,
            },
        })}

        # Log to DB
        event_id = str(uuid.uuid4())
        db.add(DeviceEvent(
            id=event_id,
            device_id=device_id,
            device_name=device.name,
            event_type="connect",
            timestamp=datetime.now(timezone.utc),
            battery_pct=device.battery,
            signal_strength=device.signal_strength,
        ))
        try:
            await db.commit()
        except Exception:
            await db.rollback()

    return EventSourceResponse(connect_stream())


@router.post("/disconnect")
async def disconnect_device(db: AsyncSession = Depends(get_db)):
    """Disconnect the current device."""
    sim = get_device_simulator()
    dev = sim.device
    name = dev.name if dev else "未知设备"
    device_id = dev.id if dev else "unknown"

    await sim.disconnect()

    # Log to DB
    try:
        db.add(DeviceEvent(
            id=str(uuid.uuid4()),
            device_id=device_id,
            device_name=name,
            event_type="disconnect",
            timestamp=datetime.now(timezone.utc),
        ))
        await db.commit()
    except Exception:
        await db.rollback()

    return {"message": f"已断开 {name}", "device_id": device_id}


@router.get("/events")
async def get_event_history(
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
):
    """Get device connection event history."""
    result = await db.execute(
        select(DeviceEvent)
        .order_by(DeviceEvent.timestamp.desc())
        .limit(limit)
    )
    events = result.scalars().all()
    return {
        "events": [
            {
                "id": e.id,
                "device_id": e.device_id,
                "device_name": e.device_name,
                "event_type": e.event_type,
                "timestamp": e.timestamp.isoformat(),
                "battery_pct": e.battery_pct,
                "signal_strength": e.signal_strength,
            }
            for e in events
        ],
        "total": len(events),
    }
