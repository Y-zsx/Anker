"""Service dependency providers for FastAPI"""
from functools import lru_cache

from backend.services import (
    AIProcessingService,
    AudioCaptureService,
    DeviceService,
    PerformanceReportService,
)


@lru_cache
def get_device_service() -> DeviceService:
    return DeviceService()


@lru_cache
def get_audio_service() -> AudioCaptureService:
    return AudioCaptureService()


@lru_cache
def get_ai_service() -> AIProcessingService:
    return AIProcessingService()


@lru_cache
def get_report_service() -> PerformanceReportService:
    return PerformanceReportService()
