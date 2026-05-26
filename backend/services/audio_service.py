"""Audio capture simulation service"""
import asyncio
import random
import math
from typing import AsyncGenerator

from backend.models import AudioState, AudioSample, SCENARIOS


class AudioCaptureService:
    """Simulates audio recording with realistic waveform and noise"""

    def __init__(self):
        self.is_recording = False
        self.start_time = 0.0
        self._scenario: AudioSample | None = None
        self._noise_base = 25.0

    @property
    def current_scenario(self):
        return self._scenario

    def get_available_scenarios(self) -> list[dict]:
        return [
            {"id": "meeting", "label": "会议模式"},
            {"id": "learning", "label": "学习模式"},
            {"id": "office", "label": "办公模式"},
            {"id": "daily", "label": "日常模式"},
        ]

    async def start_recording(
        self, scenario_id: str = "meeting", duration: float = 15.0
    ) -> AsyncGenerator[dict, None]:
        """Simulate recording with progressive audio data"""
        if scenario_id not in SCENARIOS:
            yield {"error": f"未知场景: {scenario_id}"}
            return

        self._scenario = AudioSample(**SCENARIOS[scenario_id])
        self.is_recording = True
        self.start_time = 0.0

        source_text = self._scenario.text
        words = source_text.split()
        total_words = len(words)
        words_per_tick = max(1, total_words // 30)

        yield {"phase": "starting", "message": "开始录音...", "scenario": scenario_id}
        await asyncio.sleep(0.5)

        accumulated_words = 0
        tick = 0
        while self.is_recording and accumulated_words < total_words:
            tick += 1
            accumulated_words = min(accumulated_words + words_per_tick, total_words)
            current_text = " ".join(words[:accumulated_words])
            elapsed = tick * 0.5
            self.start_time = elapsed

            volume = 40 + random.uniform(-15, 25)
            volume = max(5, min(95, volume))

            noise = self._noise_base + random.uniform(-5, 10)
            noise = max(5, min(60, noise))

            base_clarity = {
                "meeting": 78,
                "learning": 85,
                "office": 82,
                "daily": 80,
            }.get(scenario_id, 80)
            clarity = base_clarity + random.uniform(-8, 8)
            clarity = max(50, min(98, clarity))

            sample_rate = 48000 if random.random() > 0.3 else 44100
            noise_reduction = max(10, 35 - noise + random.uniform(0, 5))

            waveform = [
                round(
                    math.sin(elapsed * 3 + i * 0.5) * (volume / 100)
                    + random.uniform(-0.1, 0.1),
                    3,
                )
                for i in range(20)
            ]

            progress = (accumulated_words / total_words) * 100

            yield {
                "phase": "recording",
                "elapsed": round(elapsed, 1),
                "volume": round(volume, 1),
                "noise_level": round(noise, 1),
                "clarity_score": round(clarity, 1),
                "sample_rate": sample_rate,
                "noise_reduction": round(noise_reduction, 1),
                "waveform": waveform,
                "progress": round(progress, 1),
                "current_text": current_text,
            }

            await asyncio.sleep(0.5)

        if self.is_recording:
            self.stop_recording()

    def stop_recording(self) -> AudioState:
        self.is_recording = False
        return AudioState(
            is_recording=False,
            duration=round(self.start_time, 1),
            sample_rate=48000,
            noise_level=round(self._noise_base + random.uniform(-2, 2), 1),
            clarity_score=round(
                {"meeting": 78, "learning": 85, "office": 82, "daily": 80}.get(
                    self._scenario.scenario if self._scenario else "meeting", 80
                )
                + random.uniform(-3, 3),
                1,
            ),
            volume_level=0.0,
        )

    def get_current_state(self) -> AudioState:
        return AudioState(
            is_recording=self.is_recording,
            duration=round(self.start_time, 1),
            sample_rate=48000,
            noise_level=round(self._noise_base + random.uniform(-2, 2), 1),
            clarity_score=round(80 + random.uniform(-5, 5), 1),
            volume_level=round(random.uniform(20, 70), 1) if self.is_recording else 0.0,
        )
