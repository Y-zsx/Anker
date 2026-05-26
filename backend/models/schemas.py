"""Pydantic schemas for API request/response validation"""
from pydantic import BaseModel
from typing import Optional, Literal
from datetime import datetime


class DeviceInfo(BaseModel):
    id: str
    name: str
    type: Literal["bluetooth", "wifi"]
    battery: int
    signal_strength: int
    firmware_version: str
    temperature: float = 35.0
    audio_latency: int = 40


class DeviceStatus(BaseModel):
    connected: bool
    device: Optional[DeviceInfo] = None
    connection_quality: str = "unknown"


class AudioState(BaseModel):
    is_recording: bool
    duration: float
    sample_rate: int
    noise_level: float
    clarity_score: float
    volume_level: float
    text: str = ""


class ScenarioInfo(BaseModel):
    id: str
    label: str
    description: str = ""


class AudioSample(BaseModel):
    scenario: str
    duration: int
    text: str
    participants: Optional[int] = None
    language: Optional[str] = None


class AIConfig(BaseModel):
    speech_to_text_model: str = "whisper"
    language: str = "auto"
    translation_source: str = "en"
    translation_target: str = "zh"
    summary_max_length: int = 100
    summary_style: str = "concise"
    mode: Literal["standard", "high_precision"] = "standard"


class AIProcessingStatus(BaseModel):
    phase: Literal["idle", "transcribing", "translating", "summarizing", "done"]
    progress: float
    confidence: float = 0.0
    current_text: str = ""


class TranscriptionResult(BaseModel):
    original_text: str
    translated_text: Optional[str] = None
    summary: Optional[str] = None
    confidence: float
    word_count: int
    processing_time_ms: int
    confidence_segments: Optional[list[dict]] = None


class PerformanceMetrics(BaseModel):
    avg_response_time_ms: float
    transcription_accuracy: float
    ai_processing_time_ms: float
    total_interactions: int
    connection_uptime_pct: float
    noise_environment: str
    speech_rate: str
    bottlenecks: list[str]
    suggestions: list[str]


class SessionSummary(BaseModel):
    id: str
    scenario: str
    duration_sec: float
    confidence: float
    processing_time_ms: int
    created_at: datetime


class PrivacySettings(BaseModel):
    local_only_mode: bool = False
    data_retention_days: int = 30
    analytics_enabled: bool = True


class HealthResponse(BaseModel):
    status: str
    device_connected: bool
    recording_active: bool
    database_connected: bool = True
    version: str = "1.0.0"


class ErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None
    suggestion: Optional[str] = None


SCENARIOS = {
    "meeting": {
        "scenario": "meeting",
        "label": "会议模式",
        "duration": 120,
        "text": (
            "今天我们讨论一下Q1的产品规划。首先，关于AI耳机的语音识别功能，"
            "我们需要在准确率上达到95%以上的目标。目前的模型在嘈杂环境下的表现还有提升空间，"
            "建议引入多麦克风阵列降噪技术。另外，实时翻译功能也是我们的重要卖点，"
            "特别是中英互译场景，响应时间需要控制在3秒以内。"
            "最后，关于用户隐私保护，所有音频数据默认本地处理，云端处理需要用户明确授权。"
        ),
        "participants": 3,
    },
    "learning": {
        "scenario": "learning",
        "label": "学习模式",
        "duration": 60,
        "text": (
            "Hello, today we will learn about artificial intelligence and its applications. "
            "AI has transformed many industries, from healthcare to finance. "
            "Machine learning, a subset of AI, allows computers to learn from data "
            "without being explicitly programmed. Deep learning, powered by neural networks, "
            "has achieved remarkable results in image recognition, natural language processing, "
            "and speech recognition. Let's explore these concepts in more detail."
        ),
        "language": "en",
    },
    "office": {
        "scenario": "office",
        "label": "办公模式",
        "duration": 30,
        "text": (
            "播放音乐，音量调到60%。打开降噪模式。设置定时器25分钟，我要专注工作。"
            "好的，现在切换到我常用的播客列表。顺便帮我查一下今天下午的日程安排。"
        ),
    },
    "daily": {
        "scenario": "daily",
        "label": "日常模式",
        "duration": 300,
        "text": (
            "今天天气真不错，适合出去走走。早上去了公园，空气很好，跑了两圈。"
            "中午和朋友一起吃了饭，聊了很多有趣的话题。下午去图书馆借了几本书，"
            "最近在看人工智能相关的资料。晚上打算回家做晚饭，然后看看电影放松一下。"
            "这一天过得充实而有意义，希望能继续保持这种状态。"
        ),
    },
}
