"""AI processing routes - processes recorded audio through transcribe/translate/summarize pipeline"""
import json
import asyncio
import time
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sse_starlette.sse import EventSourceResponse

from backend.database import get_db
from backend.models.db import SessionRecord, PerformanceMetric
from backend.models.schemas import AIConfig, SCENARIOS
from backend.services.audio_simulator import get_audio_simulator

router = APIRouter(prefix="/api/ai", tags=["ai"])


# Mock AI results per scenario
MOCK_RESULTS = {
    "meeting": {
        "original_text": "今天我们讨论一下Q1的产品规划。首先，关于AI耳机的语音识别功能，我们需要在准确率上达到95%以上的目标。目前的模型在嘈杂环境下的表现还有提升空间，建议引入多麦克风阵列降噪技术。另外，实时翻译功能也是我们的重要卖点，特别是中英互译场景，响应时间需要控制在3秒以内。最后，关于用户隐私保护，所有音频数据默认本地处理，云端处理需要用户明确授权。",
        "translated_text": "Today we discussed the Q1 product roadmap. First, regarding the AI earbuds' speech recognition feature, we need to achieve an accuracy rate of over 95%. The current model's performance in noisy environments still has room for improvement, and we recommend introducing multi-microphone array noise reduction technology. Additionally, real-time translation is also our key selling point, especially for Chinese-English translation scenarios, where response time needs to be controlled within 3 seconds. Finally, regarding user privacy protection, all audio data is processed locally by default, and cloud processing requires explicit user consent.",
        "summary": "会议讨论了Q1产品规划，重点包括：1) 语音识别目标准确率95%以上；2) 建议引入多麦克风降噪技术；3) 实时翻译功能响应时间需控制在3秒内；4) 音频数据默认本地处理，云端需用户授权。",
    },
    "learning": {
        "original_text": "Hello, today we will learn about artificial intelligence and its applications. AI has transformed many industries, from healthcare to finance. Machine learning, a subset of AI, allows computers to learn from data without being explicitly programmed. Deep learning, powered by neural networks, has achieved remarkable results in image recognition, natural language processing, and speech recognition. Let's explore these concepts in more detail.",
        "translated_text": "今天我们将学习人工智能及其应用。AI已经改变了从医疗到金融的许多行业。机器学习是AI的一个子集，它允许计算机从数据中学习而不需要显式编程。由神经网络驱动的深度学习在图像识别、自然语言处理和语音识别方面取得了显著成果。让我们更深入地探讨这些概念。",
        "summary": "本节课程介绍了AI基础知识：AI改变多个行业、机器学习从数据学习、深度学习在图像/语言/语音识别方面的成就。",
    },
    "office": {
        "original_text": "播放音乐，音量调到60%。打开降噪模式。设置定时器25分钟，我要专注工作。好的，现在切换到我常用的播客列表。顺便帮我查一下今天下午的日程安排。",
        "translated_text": "Play music, set volume to 60%. Turn on noise cancellation mode. Set a timer for 25 minutes, I need to focus on work. Okay, now switch to my usual podcast list. Also, please check my schedule for this afternoon.",
        "summary": "办公场景：音乐播放(60%音量)、降噪模式开启、25分钟专注定时器、播客切换、下午日程查询。",
    },
    "daily": {
        "original_text": "今天天气真不错，适合出去走走。早上去了公园，空气很好，跑了两圈。中午和朋友一起吃了饭，聊了很多有趣的话题。下午去图书馆借了几本书，最近在看人工智能相关的资料。晚上打算回家做晚饭，然后看看电影放松一下。这一天过得充实而有意义，希望能继续保持这种状态。",
        "translated_text": "The weather is nice today, perfect for a walk. I went to the park in the morning, the air was great, ran two laps. Had lunch with friends at noon, chatted about many interesting topics. Went to the library in the afternoon to borrow some books, recently reading AI-related materials. Planning to go home and cook dinner tonight, then watch a movie to relax. This day was fulfilling and meaningful, hope to keep it up.",
        "summary": "日常记录：晨跑公园、午餐聚会、图书馆借阅AI资料、晚上做饭看电影，充实的一天。",
    },
}


@router.post("/config")
async def update_ai_config(config: AIConfig):
    """Update AI processing configuration."""
    return {"message": "配置已更新", "config": config.model_dump()}


@router.get("/config")
async def get_ai_config():
    """Get current AI configuration."""
    return {
        "speech_to_text_model": "whisper",
        "language": "auto",
        "translation_source": "en",
        "translation_target": "zh",
        "summary_max_length": 100,
        "summary_style": "concise",
        "mode": "standard",
    }


@router.post("/process")
async def process_ai(
    scenario: str = "meeting",
    db: AsyncSession = Depends(get_db),
):
    """Process recorded audio through the AI pipeline with SSE streaming."""
    audio_sim = get_audio_simulator()
    recorded_text = audio_sim.current_metrics.text if audio_sim.current_metrics.text else SCENARIOS.get(scenario, {}).get("text", "")

    if not recorded_text:
        raise HTTPException(status_code=400, detail="没有可处理的录音内容")

    mock = MOCK_RESULTS.get(scenario, MOCK_RESULTS["daily"])

    async def processing_stream():
        start_time = time.time()

        # Phase 1: Transcribing
        yield {"event": "ai", "data": json.dumps({
            "phase": "transcribing",
            "progress": 10,
            "confidence": 0,
            "message": "正在转写语音...",
        })}
        await asyncio.sleep(0.6)

        for pct in range(10, 40, 5):
            yield {"event": "ai", "data": json.dumps({
                "phase": "transcribing",
                "progress": pct,
                "confidence": 0,
                "current_text": mock["original_text"][:pct * 3],
                "message": "正在转写语音...",
            })}
            await asyncio.sleep(0.15)

        # Phase 2: Translating
        yield {"event": "ai", "data": json.dumps({
            "phase": "translating",
            "progress": 45,
            "confidence": 0,
            "message": "正在翻译...",
        })}
        await asyncio.sleep(0.5)

        for pct in range(45, 70, 5):
            yield {"event": "ai", "data": json.dumps({
                "phase": "translating",
                "progress": pct,
                "confidence": 0.85 + pct * 0.001,
                "message": "正在翻译...",
            })}
            await asyncio.sleep(0.15)

        # Phase 3: Summarizing
        yield {"event": "ai", "data": json.dumps({
            "phase": "summarizing",
            "progress": 75,
            "confidence": 0.9,
            "message": "正在生成摘要...",
        })}
        await asyncio.sleep(0.5)

        for pct in range(75, 95, 5):
            yield {"event": "ai", "data": json.dumps({
                "phase": "summarizing",
                "progress": pct,
                "confidence": 0.9 + pct * 0.001,
                "message": "正在生成摘要...",
            })}
            await asyncio.sleep(0.12)

        # Phase 4: Done
        elapsed_ms = int((time.time() - start_time) * 1000)
        confidence = 0.91 + 0.05 * (hash(scenario) % 10) / 10

        result = {
            "original_text": mock["original_text"],
            "translated_text": mock["translated_text"],
            "summary": mock["summary"],
            "confidence": round(confidence, 3),
            "word_count": len(mock["original_text"]),
            "processing_time_ms": elapsed_ms,
            "confidence_segments": [],
        }

        yield {"event": "ai", "data": json.dumps({
            "phase": "done",
            "progress": 100,
            "confidence": round(confidence, 3),
            "message": "处理完成",
            "result": result,
        })}

        # Persist to DB
        try:
            session_id = str(uuid.uuid4())
            db.add(SessionRecord(
                id=session_id,
                scenario=scenario,
                duration_sec=audio_sim.current_metrics.duration,
                original_text=mock["original_text"],
                translated_text=mock["translated_text"],
                summary=mock["summary"],
                confidence=round(confidence, 3),
                processing_time_ms=elapsed_ms,
                ai_mode="standard",
            ))
            db.add(PerformanceMetric(
                id=str(uuid.uuid4()),
                session_id=session_id,
                scenario=scenario,
                processing_time_ms=elapsed_ms,
                confidence=round(confidence, 3),
                noise_level=audio_sim.current_metrics.noise_level,
                clarity_score=audio_sim.current_metrics.clarity_score,
            ))
            await db.commit()
        except Exception:
            await db.rollback()

    return EventSourceResponse(processing_stream())


@router.get("/result")
async def get_ai_result():
    """Get the last processing result."""
    return {
        "original_text": "",
        "translated_text": None,
        "summary": None,
        "confidence": 0,
        "word_count": 0,
        "processing_time_ms": 0,
        "confidence_segments": [],
    }


@router.get("/history")
async def get_ai_history(db: AsyncSession = Depends(get_db)):
    """Get processing history from DB."""
    result = await db.execute(
        select(SessionRecord).order_by(SessionRecord.created_at.desc()).limit(20)
    )
    sessions = result.scalars().all()
    return {
        "history": [
            {
                "id": s.id,
                "scenario": s.scenario,
                "duration_sec": s.duration_sec,
                "confidence": s.confidence,
                "processing_time_ms": s.processing_time_ms,
                "created_at": s.created_at.isoformat(),
            }
            for s in sessions
        ]
    }
