"""SQLAlchemy ORM models for data persistence"""
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, Text, DateTime, JSON, Boolean

from backend.database import Base


class SessionRecord(Base):
    """Stores each user session / interaction"""
    __tablename__ = "sessions"

    id = Column(String(36), primary_key=True)
    device_id = Column(String(64), nullable=True)
    scenario = Column(String(32), nullable=False, default="meeting")
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )
    duration_sec = Column(Float, default=0.0)
    original_text = Column(Text, default="")
    translated_text = Column(Text, nullable=True)
    summary = Column(Text, nullable=True)
    confidence = Column(Float, default=0.0)
    processing_time_ms = Column(Integer, default=0)
    confidence_segments = Column(JSON, nullable=True)
    ai_mode = Column(String(32), default="standard")


class DeviceEvent(Base):
    """Logs device connection/disconnection events"""
    __tablename__ = "device_events"

    id = Column(String(36), primary_key=True)
    device_id = Column(String(64), nullable=False)
    device_name = Column(String(128), nullable=False)
    event_type = Column(String(32), nullable=False)
    timestamp = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )
    battery_pct = Column(Integer, nullable=True)
    signal_strength = Column(Integer, nullable=True)


class PerformanceMetric(Base):
    """Stores per-interaction performance metrics"""
    __tablename__ = "performance_metrics"

    id = Column(String(36), primary_key=True)
    session_id = Column(String(36), nullable=True)
    scenario = Column(String(32), nullable=False)
    processing_time_ms = Column(Integer, nullable=False)
    confidence = Column(Float, nullable=False)
    ai_mode = Column(String(32), default="standard")
    noise_level = Column(Float, default=0.0)
    clarity_score = Column(Float, default=0.0)
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )


class AIConfigRecord(Base):
    """Stores user AI configuration preferences"""
    __tablename__ = "ai_configs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    speech_to_text_model = Column(String(64), default="whisper")
    language = Column(String(16), default="auto")
    translation_source = Column(String(16), default="en")
    translation_target = Column(String(16), default="zh")
    summary_max_length = Column(Integer, default=100)
    summary_style = Column(String(32), default="concise")
    mode = Column(String(32), default="standard")
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )


class PrivacySetting(Base):
    """Stores user privacy preferences"""
    __tablename__ = "privacy_settings"

    id = Column(Integer, primary_key=True, autoincrement=True)
    local_only_mode = Column(Boolean, default=False)
    data_retention_days = Column(Integer, default=30)
    analytics_enabled = Column(Boolean, default=True)
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )
