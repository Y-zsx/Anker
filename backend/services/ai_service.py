"""AI processing simulation service"""
import asyncio
import random
import uuid
from datetime import datetime, timezone
from typing import AsyncGenerator, Optional

from sqlalchemy.ext.asyncio import AsyncSession

from backend.logging_config import get_logger
from backend.models.db import SessionRecord, PerformanceMetric
from backend.models.schemas import AIConfig, TranscriptionResult

logger = get_logger("services.ai_service")

SUMMARIES = {
    "meeting": (
        "Q1产品规划会议要点：\n"
        "• AI耳机语音识别目标准确率95%+\n"
        "• 建议引入多麦克风阵列降噪技术\n"
        "• 实时翻译响应时间控制在3秒以内\n"
        "• 音频数据默认本地处理，云端需授权"
    ),
    "learning": (
        "AI学习摘要：\n"
        "• 本课介绍AI及其在各行业的应用\n"
        "• 机器学习：从数据中学习，无需显式编程\n"
        "• 深度学习：神经网络驱动，在图像/NLP/语音领域成果显著"
    ),
    "office": (
        "办公指令汇总：\n"
        "• 音乐播放已启动，音量60%\n"
        "• 降噪模式已开启\n"
        "• 25分钟专注定时器已设置\n"
        "• 已切换至常用播客列表"
    ),
    "daily": (
        "日常活动摘要：\n"
        "• 上午：公园晨跑，环境良好\n"
        "• 中午：与朋友聚餐交流\n"
        "• 下午：图书馆借阅AI相关资料\n"
        "• 晚间计划：做饭、看电影放松"
    ),
}

TRANSLATIONS = {
    "learning": {
        "zh_text": (
            "大家好，今天我们将学习人工智能及其应用。"
            "AI已经改变了许多行业，从医疗保健到金融。"
            "机器学习是AI的一个子集，它允许计算机从数据中学习，"
            "而不需要被显式编程。深度学习由神经网络驱动，"
            "在图像识别、自然语言处理和语音识别方面取得了显著成果。"
            "让我们更详细地探索这些概念。"
        ),
    },
}


class AIProcessingService:
    """Simulates AI speech-to-text, translation, and summarization"""

    def __init__(self):
        self.config = AIConfig()
        self._last_result: TranscriptionResult | None = None
        self._processing_history: list[dict] = []

    def update_config(self, config: AIConfig):
        self.config = config

    async def process_audio(
        self, text: str, scenario: str = "meeting", db: Optional[AsyncSession] = None
    ) -> AsyncGenerator[dict, None]:
        """Simulate full AI processing pipeline with progress updates"""
        logger.info(f"Starting AI processing: scenario={scenario}, mode={self.config.mode}")
        is_high_precision = self.config.mode == "high_precision"
        base_speed = 0.8 if is_high_precision else 0.5

        # Phase 1: Speech-to-Text
        yield {
            "phase": "transcribing",
            "progress": 0,
            "confidence": 0.0,
            "message": "正在转写语音...",
            "current_text": "",
        }
        await asyncio.sleep(0.6 * base_speed)

        words = text.split()
        for i in range(0, len(words), max(1, len(words) // 8)):
            progress = (i / len(words)) * 30
            confidence = 0.6 + random.uniform(0, 0.2)
            current = " ".join(words[: i + max(1, len(words) // 8)])

            yield {
                "phase": "transcribing",
                "progress": round(progress, 1),
                "confidence": round(min(confidence, 0.95), 3),
                "message": "语音转文字中...",
                "current_text": current + "...",
            }
            await asyncio.sleep(0.2 * base_speed)

        yield {
            "phase": "transcribing",
            "progress": 30,
            "confidence": round(0.88 + random.uniform(0, 0.08), 3),
            "message": "转写完成",
            "current_text": text,
        }
        await asyncio.sleep(0.3)

        # Phase 2: Translation
        translated = None
        if scenario == "learning":
            yield {
                "phase": "translating",
                "progress": 30,
                "confidence": 0.0,
                "message": f"正在翻译 ({self.config.translation_source} → {self.config.translation_target})...",
                "current_text": text,
            }
            await asyncio.sleep(0.5 * base_speed)

            zh_result = TRANSLATIONS.get("learning", {}).get("zh_text", "翻译结果...")
            zh_words = zh_result.split()
            for i in range(0, len(zh_words), max(1, len(zh_words) // 4)):
                progress = 30 + (i / len(zh_words)) * 30
                confidence = 0.7 + random.uniform(0, 0.2)
                yield {
                    "phase": "translating",
                    "progress": round(progress, 1),
                    "confidence": round(min(confidence, 0.93), 3),
                    "message": "翻译中...",
                    "current_text": text,
                    "translated_partial": " ".join(zh_words[: i + max(1, len(zh_words) // 4)]),
                }
                await asyncio.sleep(0.3 * base_speed)

            translated = zh_result
            yield {
                "phase": "translating",
                "progress": 60,
                "confidence": round(0.89 + random.uniform(0, 0.07), 3),
                "message": "翻译完成",
                "current_text": text,
                "translated_text": translated,
            }
            await asyncio.sleep(0.3)

        # Phase 3: Summarization
        yield {
            "phase": "summarizing",
            "progress": 60,
            "confidence": 0.0,
            "message": "正在生成智能摘要...",
            "current_text": text,
            "translated_text": translated,
        }
        await asyncio.sleep(0.5 * base_speed)

        summary = SUMMARIES.get(scenario, "摘要生成中...")
        summary_words = summary.split()
        for i in range(0, len(summary_words), max(1, len(summary_words) // 3)):
            progress = 60 + (i / len(summary_words)) * 35
            yield {
                "phase": "summarizing",
                "progress": round(progress, 1),
                "confidence": round(0.85 + random.uniform(0, 0.1), 3),
                "message": "摘要生成中...",
                "current_text": text,
                "translated_text": translated,
                "summary_partial": " ".join(summary_words[: i + max(1, len(summary_words) // 3)]),
            }
            await asyncio.sleep(0.3 * base_speed)

        # Phase 4: Done
        processing_time = int(1500 + random.uniform(0, 800))
        if is_high_precision:
            processing_time = int(processing_time * 1.5)

        final_confidence = round(
            0.91 + random.uniform(0, 0.06)
            if is_high_precision
            else 0.87 + random.uniform(0, 0.08),
            3,
        )

        confidence_segments = [
            {"start": 0, "end": min(30, len(text)), "confidence": round(final_confidence + random.uniform(-0.05, 0.03), 3)},
            {"start": 30, "end": min(60, len(text)), "confidence": round(final_confidence + random.uniform(-0.08, 0.05), 3)},
            {"start": 60, "end": len(text), "confidence": round(final_confidence + random.uniform(-0.03, 0.04), 3)},
        ]

        self._last_result = TranscriptionResult(
            original_text=text,
            translated_text=translated,
            summary=summary,
            confidence=final_confidence,
            word_count=len(text),
            processing_time_ms=processing_time,
            confidence_segments=confidence_segments,
        )

        self._processing_history.append({
            "scenario": scenario,
            "processing_time_ms": processing_time,
            "confidence": final_confidence,
            "mode": self.config.mode,
        })

        # Persist to database
        if db:
            try:
                session_id = str(uuid.uuid4())
                db.add(SessionRecord(
                    id=session_id, scenario=scenario,
                    original_text=text, translated_text=translated,
                    summary=summary, confidence=final_confidence,
                    processing_time_ms=processing_time,
                    confidence_segments=confidence_segments,
                    ai_mode=self.config.mode,
                ))
                db.add(PerformanceMetric(
                    id=str(uuid.uuid4()), session_id=session_id,
                    scenario=scenario, processing_time_ms=processing_time,
                    confidence=final_confidence, ai_mode=self.config.mode,
                ))
                await db.flush()
                logger.info(f"AI result saved to DB: {scenario}/{final_confidence}")
            except Exception as e:
                logger.error(f"Failed to save AI result to DB: {e}")

        yield {
            "phase": "done",
            "progress": 100,
            "confidence": final_confidence,
            "message": "处理完成！",
            "result": self._last_result.model_dump(),
        }

    def get_last_result(self) -> TranscriptionResult | None:
        return self._last_result

    def get_processing_history(self) -> list[dict]:
        return self._processing_history
