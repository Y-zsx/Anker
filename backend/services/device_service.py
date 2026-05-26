"""Device simulation service"""
import asyncio
import random
import uuid
from datetime import datetime, timezone
from typing import AsyncGenerator, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.logging_config import get_logger
from backend.models.db import DeviceEvent
from backend.models.schemas import DeviceInfo, DeviceStatus

logger = get_logger("services.device_service")


DEVICES = [
    DeviceInfo(
        id="earbuds_001",
        name="Soundcore Liberty 4",
        type="bluetooth",
        battery=85,
        signal_strength=-45,
        firmware_version="v2.3.1",
        temperature=35.0,
        audio_latency=40,
    ),
    DeviceInfo(
        id="earbuds_002",
        name="Soundcore Space A40",
        type="bluetooth",
        battery=62,
        signal_strength=-58,
        firmware_version="v2.1.0",
        temperature=37.2,
        audio_latency=55,
    ),
    DeviceInfo(
        id="earbuds_003",
        name="Soundcore Elite Pro",
        type="wifi",
        battery=91,
        signal_strength=-32,
        firmware_version="v3.0.2",
        temperature=33.8,
        audio_latency=25,
    ),
]


class DeviceService:
    """Simulates device discovery, connection, and monitoring"""

    def __init__(self):
        self.connected_device: DeviceInfo | None = None
        self.is_connected = False
        self.monitor_task: asyncio.Task | None = None
        self._battery_drain = 0

    def get_available_devices(self) -> list[DeviceInfo]:
        return DEVICES

    async def scan_devices(self) -> AsyncGenerator[dict, None]:
        """Simulate device scanning with progressive discovery"""
        yield {"phase": "scanning", "message": "正在扫描附近设备...", "found": []}
        await asyncio.sleep(0.8)

        for i, device in enumerate(DEVICES):
            yield {
                "phase": "discovering",
                "message": f"发现设备: {device.name}",
                "device": device.model_dump(),
                "signal_strength": device.signal_strength,
            }
            await asyncio.sleep(0.5 + random.random() * 0.5)

        yield {
            "phase": "complete",
            "message": f"扫描完成，共发现 {len(DEVICES)} 个设备",
            "devices": [d.model_dump() for d in DEVICES],
        }

    async def connect_device(
        self, device_id: str, db: Optional[AsyncSession] = None
    ) -> AsyncGenerator[dict, None]:
        """Simulate connection process with authentication"""
        device = next((d for d in DEVICES if d.id == device_id), None)
        if not device:
            logger.warning(f"Connection attempt for unknown device: {device_id}")
            yield {"phase": "error", "message": "设备不存在"}
            return

        logger.info(f"Connecting to device: {device.name} ({device_id})")

        yield {"phase": "pairing", "message": f"正在配对 {device.name}..."}
        await asyncio.sleep(0.6)

        yield {"phase": "authenticating", "message": "设备认证中...", "progress": 30}
        await asyncio.sleep(0.4)

        yield {"phase": "authenticating", "message": "验证设备密钥...", "progress": 60}
        await asyncio.sleep(0.5)

        if random.random() < 0.3:
            yield {"phase": "authenticating", "message": "二次验证...", "progress": 80}
            await asyncio.sleep(0.8)

        yield {"phase": "connecting", "message": "建立连接通道...", "progress": 90}
        await asyncio.sleep(0.3)

        self.connected_device = device
        self.is_connected = True
        self._battery_drain = 0

        # Log event to database
        if db:
            try:
                event = DeviceEvent(
                    id=str(uuid.uuid4()),
                    device_id=device.id,
                    device_name=device.name,
                    event_type="connect",
                    timestamp=datetime.now(timezone.utc),
                    battery_pct=device.battery,
                    signal_strength=device.signal_strength,
                )
                db.add(event)
                await db.flush()
                logger.info(f"Device event logged: connect/{device.name}")
            except Exception as e:
                logger.error(f"Failed to log device event: {e}")

        yield {
            "phase": "connected",
            "message": f"{device.name} 连接成功！",
            "progress": 100,
            "device": device.model_dump(),
        }

    def disconnect_device(self) -> str | None:
        if self.connected_device:
            name = self.connected_device.name
            logger.info(f"Device disconnected: {name}")
            self.connected_device = None
            self.is_connected = False
            return name
        return None

    def get_status(self) -> DeviceStatus:
        if not self.is_connected or not self.connected_device:
            return DeviceStatus(connected=False)

        device = self.connected_device
        battery = max(0, device.battery - self._battery_drain)
        signal = device.signal_strength + random.randint(-5, 5)
        temp = device.temperature + random.uniform(-0.5, 1.5)
        latency = device.audio_latency + random.randint(-5, 10)

        if signal > -50 and battery > 50:
            quality = "excellent"
        elif signal > -60 and battery > 30:
            quality = "good"
        elif signal > -70 and battery > 15:
            quality = "fair"
        else:
            quality = "poor"

        return DeviceStatus(
            connected=True,
            device=DeviceInfo(
                id=device.id,
                name=device.name,
                type=device.type,
                battery=battery,
                signal_strength=signal,
                firmware_version=device.firmware_version,
                temperature=round(temp, 1),
                audio_latency=latency,
            ),
            connection_quality=quality,
        )

    async def monitor_loop(self):
        while self.is_connected:
            await asyncio.sleep(10)
            self._battery_drain += 1

    def start_monitoring(self):
        if self.is_connected and not self.monitor_task:
            self.monitor_task = asyncio.create_task(self.monitor_loop())

    def stop_monitoring(self):
        if self.monitor_task:
            self.monitor_task.cancel()
            self.monitor_task = None

    async def get_event_history(self, db: AsyncSession, limit: int = 50) -> list[dict]:
        """Retrieve device event history from database"""
        result = await db.execute(
            select(DeviceEvent)
            .order_by(DeviceEvent.timestamp.desc())
            .limit(limit)
        )
        events = result.scalars().all()
        return [
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
        ]
