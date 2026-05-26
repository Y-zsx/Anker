"""Device simulation layer - simulates earbuds hardware lifecycle"""
import asyncio
import random
import time
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Optional
from threading import Lock


@dataclass
class DeviceInfo:
    id: str
    name: str
    type: str
    battery: int
    signal_strength: int
    firmware_version: str
    temperature: float
    audio_latency: int
    mic_enabled: bool = False
    connected_at: Optional[datetime] = None


class DeviceSimulator:
    """Simulates a pair of AI earbuds + microphone hardware."""

    def __init__(self) -> None:
        self._lock = Lock()
        self._device: Optional[DeviceInfo] = None
        self._connected: bool = False
        self._battery_drain_task: Optional[asyncio.Task] = None
        self._running: bool = False

        # Simulated device catalog
        self._catalog = {
            "earbuds_pro_001": {
                "name": "ANKERHUB Pro",
                "type": "bluetooth",
                "battery": 87,
                "signal_strength": -45,
                "firmware_version": "2.1.4",
                "temperature": 32.5,
                "audio_latency": 48,
            },
            "earbuds_lite_002": {
                "name": "ANKERHUB Lite",
                "type": "bluetooth",
                "battery": 65,
                "signal_strength": -52,
                "firmware_version": "1.8.2",
                "temperature": 31.0,
                "audio_latency": 62,
            },
        }

    @property
    def connected(self) -> bool:
        with self._lock:
            return self._connected

    @property
    def device(self) -> Optional[DeviceInfo]:
        with self._lock:
            return self._device

    async def connect(self, device_id: str) -> DeviceInfo:
        """Connect a simulated device."""
        catalog_entry = self._catalog.get(device_id, self._catalog["earbuds_pro_001"])
        device = DeviceInfo(
            id=device_id,
            name=catalog_entry["name"],
            type=catalog_entry["type"],
            battery=catalog_entry["battery"],
            signal_strength=catalog_entry["signal_strength"],
            firmware_version=catalog_entry["firmware_version"],
            temperature=catalog_entry["temperature"],
            audio_latency=catalog_entry["audio_latency"],
            mic_enabled=False,
            connected_at=datetime.now(timezone.utc),
        )

        with self._lock:
            self._device = device
            self._connected = True

        # Start battery drain simulation
        self._running = True
        self._battery_drain_task = asyncio.create_task(self._drain_battery())

        return device

    async def disconnect(self) -> None:
        """Disconnect the simulated device."""
        self._running = False
        if self._battery_drain_task:
            self._battery_drain_task.cancel()
            try:
                await self._battery_drain_task
            except asyncio.CancelledError:
                pass

        with self._lock:
            self._device = None
            self._connected = False

    async def _drain_battery(self) -> None:
        """Simulate gradual battery drain over time."""
        while self._running:
            await asyncio.sleep(10)
            with self._lock:
                if self._device:
                    drain = random.uniform(0.05, 0.2)
                    self._device.battery = max(5, int(self._device.battery - drain))
                    # Temperature fluctuates
                    self._device.temperature = round(
                        self._device.temperature + random.uniform(-0.3, 0.3), 1
                    )
                    # Signal fluctuates
                    self._device.signal_strength = max(
                        -80,
                        min(-30, self._device.signal_strength + random.randint(-3, 3)),
                    )

    def enable_mic(self) -> bool:
        with self._lock:
            if self._device:
                self._device.mic_enabled = True
                return True
            return False

    def disable_mic(self) -> bool:
        with self._lock:
            if self._device:
                self._device.mic_enabled = False
                return True
            return False

    def get_state(self) -> dict:
        """Return current full device state for API responses."""
        with self._lock:
            if not self._connected or not self._device:
                return {
                    "connected": False,
                    "device": None,
                    "connection_quality": "unknown",
                }

            d = self._device
            signal_pct = max(0, min(100, int((d.signal_strength + 80) / 50 * 100)))
            quality = "excellent" if signal_pct > 75 else "good" if signal_pct > 50 else "fair"

            return {
                "connected": True,
                "device": {
                    "id": d.id,
                    "name": d.name,
                    "type": d.type,
                    "battery": d.battery,
                    "signal_strength": d.signal_strength,
                    "firmware_version": d.firmware_version,
                    "temperature": d.temperature,
                    "audio_latency": d.audio_latency,
                    "mic_enabled": d.mic_enabled,
                    "connected_at": d.connected_at.isoformat() if d.connected_at else None,
                },
                "connection_quality": quality,
            }

    def list_available_devices(self) -> list[dict]:
        """List all devices that can be connected."""
        return [
            {
                "id": dev_id,
                "name": dev["name"],
                "type": dev["type"],
                "battery": dev["battery"],
                "available": dev_id not in (
                    self._device.id if self._device else ""
                ),
            }
            for dev_id, dev in self._catalog.items()
        ]


# Singleton instance
_simulator: Optional[DeviceSimulator] = None


def get_device_simulator() -> DeviceSimulator:
    global _simulator
    if _simulator is None:
        _simulator = DeviceSimulator()
    return _simulator


async def close_simulator() -> None:
    global _simulator
    if _simulator:
        await _simulator.disconnect()
        _simulator = None
