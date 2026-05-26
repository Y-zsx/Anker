"""Audio capture simulation - generates realistic audio metrics in real-time"""
import asyncio
import math
import random
import time
from dataclasses import dataclass, field
from typing import Optional, Callable, Awaitable


@dataclass
class AudioMetrics:
    is_recording: bool
    duration: float
    sample_rate: int
    volume_level: float
    noise_level: float
    clarity_score: float
    text: str = ""


class AudioSimulator:
    """Simulates audio capture from earbuds microphone."""

    # Simulated transcription texts per scenario
    SCENARIO_TEXTS = {
        "meeting": "今天的会议主要讨论了下一季度的产品规划和技术路线图。团队成员一致认为需要加强AI功能的集成，特别是在语音识别和实时翻译方面。张总提出了三个关键指标：响应速度要达到200毫秒以内，准确率要达到95%以上，同时要保证用户数据的本地化处理。",
        "learning": "This is a sample English lecture about machine learning fundamentals. Today we covered the basics of neural networks, including feedforward architecture, backpropagation algorithm, and common activation functions like ReLU and sigmoid. The key takeaway is that understanding the gradient flow is essential for debugging training issues.",
        "office": "下午需要完成项目进度报告的编写，然后和市场部确认一下新产品的发布时间表。另外记得回复客户的邮件，关于系统集成的方案需要进一步讨论。三点钟有一个跨部门协调会议。",
        "daily": "今天天气不错，适合出去走走。下午要去超市买些生活用品，顺便取一下快递。晚上打算做几个新菜，最近学了一道意大利面，听说味道还不错。对了，还要记得给植物浇水。",
    }

    def __init__(self) -> None:
        self._recording: bool = False
        self._start_time: float = 0.0
        self._task: Optional[asyncio.Task] = None
        self._current_metrics = AudioMetrics(
            is_recording=False,
            duration=0,
            sample_rate=48000,
            volume_level=0,
            noise_level=25,
            clarity_score=80,
        )
        self._scenario: str = "meeting"

    @property
    def is_recording(self) -> bool:
        return self._recording

    @property
    def current_metrics(self) -> AudioMetrics:
        return self._current_metrics

    @property
    def current_scenario(self) -> AudioMetrics:
        return self._current_metrics

    def start(self, scenario: str) -> None:
        """Start audio simulation for a scenario."""
        self._scenario = scenario
        self._recording = True
        self._start_time = time.monotonic()

    def stop(self) -> AudioMetrics:
        """Stop recording and return final metrics."""
        self._recording = False
        if self._task:
            self._task.cancel()
        self._current_metrics.is_recording = False
        return self._current_metrics

    def get_live_metrics(self) -> AudioMetrics:
        """Get current simulated audio metrics (call at high frequency)."""
        if not self._recording:
            return self._current_metrics

        elapsed = time.monotonic() - self._start_time

        # Simulate realistic volume fluctuations
        base_volume = 45 + 20 * math.sin(elapsed * 0.5)
        volume = max(10, min(95, base_volume + random.gauss(0, 5)))

        # Noise level - relatively stable with minor fluctuations
        noise = max(15, min(50, 25 + random.gauss(0, 2)))

        # Clarity - depends on volume (loud = clearer)
        clarity = max(50, min(98, 60 + volume * 0.35 + random.gauss(0, 2)))

        # Gradually build up text
        full_text = self.SCENARIO_TEXTS.get(self._scenario, self.SCENARIO_TEXTS["daily"])
        chars_per_sec = 15
        char_count = min(len(full_text), int(elapsed * chars_per_sec))
        current_text = full_text[:char_count]

        self._current_metrics = AudioMetrics(
            is_recording=True,
            duration=round(elapsed, 1),
            sample_rate=48000,
            volume_level=round(volume, 1),
            noise_level=round(noise, 1),
            clarity_score=round(clarity, 1),
            text=current_text,
        )
        return self._current_metrics


# Singleton
_simulator: Optional[AudioSimulator] = None


def get_audio_simulator() -> AudioSimulator:
    global _simulator
    if _simulator is None:
        _simulator = AudioSimulator()
    return _simulator
