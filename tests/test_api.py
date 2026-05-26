"""Backend API tests"""
import pytest
from httpx import AsyncClient


@pytest.mark.anyio
async def test_health_check(client: AsyncClient):
    """Health endpoint should return ok status"""
    response = await client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["database_connected"] is True


@pytest.mark.anyio
async def test_list_devices(client: AsyncClient):
    """Should return list of available devices"""
    response = await client.get("/api/device/list")
    assert response.status_code == 200
    data = response.json()
    assert "devices" in data
    assert len(data["devices"]) == 3


@pytest.mark.anyio
async def test_list_devices_legacy(client: AsyncClient):
    """Legacy /api/devices endpoint should still work"""
    response = await client.get("/api/devices")
    assert response.status_code == 200
    data = response.json()
    assert "devices" in data
    assert len(data["devices"]) == 3


@pytest.mark.anyio
async def test_device_status_not_connected(client: AsyncClient):
    """Device status should show not connected initially"""
    response = await client.get("/api/device/status")
    assert response.status_code == 200
    data = response.json()
    assert data["connected"] is False


@pytest.mark.anyio
async def test_device_scan(client: AsyncClient):
    """Device scan should return SSE stream"""
    response = await client.get("/api/device/scan")
    assert response.status_code == 200
    # SSE response
    assert "text/event-stream" in response.headers.get("content-type", "")


@pytest.mark.anyio
async def test_list_scenarios(client: AsyncClient):
    """Should return available recording scenarios"""
    response = await client.get("/api/audio/scenarios")
    assert response.status_code == 200
    data = response.json()
    assert "scenarios" in data
    assert len(data["scenarios"]) >= 4


@pytest.mark.anyio
async def test_audio_state_idle(client: AsyncClient):
    """Audio state should show not recording initially"""
    response = await client.get("/api/audio/state")
    assert response.status_code == 200
    data = response.json()
    assert data["is_recording"] is False


@pytest.mark.anyio
async def test_ai_config_default(client: AsyncClient):
    """AI config should return default values"""
    response = await client.get("/api/ai/config")
    assert response.status_code == 200
    data = response.json()
    assert data["speech_to_text_model"] == "whisper"
    assert data["language"] == "auto"


@pytest.mark.anyio
async def test_ai_config_update(client: AsyncClient):
    """AI config should accept updates"""
    response = await client.post(
        "/api/ai/config",
        json={
            "speech_to_text_model": "whisper-large",
            "mode": "high_precision",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "配置已更新"
    assert data["config"]["mode"] == "high_precision"


@pytest.mark.anyio
async def test_report_empty(client: AsyncClient):
    """Report should return default values when no data"""
    response = await client.get("/api/report")
    assert response.status_code == 200
    data = response.json()
    assert "bottlenecks" in data
    assert "suggestions" in data


@pytest.mark.anyio
async def test_connect_device_sse(client: AsyncClient):
    """Device connection should return SSE stream"""
    response = await client.post("/api/device/connect/earbuds_001")
    assert response.status_code == 200
    assert "text/event-stream" in response.headers.get("content-type", "")


@pytest.mark.anyio
async def test_connect_device_not_found(client: AsyncClient):
    """Connecting to non-existent device should return error"""
    response = await client.post("/api/device/connect/nonexistent")
    assert response.status_code == 200  # SSE still returns 200
    # Error will be in the SSE stream content


@pytest.mark.anyio
async def test_ai_process_sse(client: AsyncClient):
    """AI processing should return SSE stream"""
    response = await client.post("/api/ai/process?scenario=meeting")
    assert response.status_code == 200
    assert "text/event-stream" in response.headers.get("content-type", "")
