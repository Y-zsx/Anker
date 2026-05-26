import { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Mic, MicOff, AlertTriangle } from 'lucide-react';

const SCENARIOS = [
  { id: 'meeting', label: '会议' },
  { id: 'learning', label: '学习' },
  { id: 'office', label: '办公' },
  { id: 'daily', label: '日常' },
];

export default function PageListen({ onProcessed }: { onProcessed: () => void }) {
  const { deviceState, audioState, selectedScenario, startRecording, stopRecording, processAI, isProcessing, processingStatus } = useApp();
  const [localScenario, setLocalScenario] = useState(selectedScenario);
  const animRef = useRef<number>();

  // Waveform animation
  const [bars, setBars] = useState<number[]>(() => Array.from({ length: 40 }, () => 4));
  useEffect(() => {
    if (audioState.is_recording) {
      let frame = 0;
      const animate = () => {
        frame++;
        setBars(
          Array.from({ length: 40 }, (_, i) =>
            Math.abs(Math.sin(i * 0.3 + frame * 0.05)) * 40 + 4
          )
        );
        animRef.current = requestAnimationFrame(animate);
      };
      animRef.current = requestAnimationFrame(animate);
    } else {
      setBars(Array.from({ length: 40 }, () => 4));
    }
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [audioState.is_recording]);

  // Auto-navigate to processing when recording stops AND there's content
  const prevRecordingRef = useRef(audioState.is_recording);
  useEffect(() => {
    if (prevRecordingRef.current && !audioState.is_recording && audioState.duration > 2) {
      // Recording just finished with content, process it
      processAI(localScenario).then(() => onProcessed());
    }
    prevRecordingRef.current = audioState.is_recording;
  }, [audioState.is_recording, audioState.duration]);

  const handleStart = async () => {
    await startRecording(localScenario);
  };

  const handleStop = async () => {
    await stopRecording();
  };

  // Guard: not connected
  if (!deviceState.connected) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-6 text-center">
        <div className="w-12 h-12 rounded-full bg-gray-900 flex items-center justify-center mb-4">
          <AlertTriangle className="w-5 h-5 text-gray-600" />
        </div>
        <p className="text-sm text-gray-400 mb-2">设备未连接</p>
        <p className="text-xs text-gray-700">请先在"设备"页面连接耳机</p>
      </div>
    );
  }

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-full px-5 py-6">
      {/* Scenario pills */}
      <div className="flex gap-1.5 mb-8">
        {SCENARIOS.map((s) => (
          <button
            key={s.id}
            onClick={() => setLocalScenario(s.id)}
            className={`flex-1 py-2 rounded-full text-xs transition-all ${
              localScenario === s.id
                ? 'bg-white text-black font-medium'
                : 'bg-gray-900 text-gray-500 hover:text-white'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Waveform + Timer */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="flex items-center justify-center gap-[2px] h-16 mb-6 w-full px-2">
          {bars.map((h, i) => (
            <div
              key={i}
              className={`w-[2px] rounded-full transition-all duration-75 ${
                audioState.is_recording ? 'bg-white/80' : 'bg-gray-800'
              }`}
              style={{ height: `${h}px` }}
            />
          ))}
        </div>

        {/* Timer - THIS TICKS IN REAL-TIME */}
        <div className="text-center mb-1">
          <span className="text-5xl font-mono font-extralight text-white tracking-wider">
            {formatTime(audioState.duration)}
          </span>
          {audioState.is_recording && (
            <span className="ml-2 inline-block w-2 h-2 rounded-full bg-white/60 animate-pulse" />
          )}
        </div>
        <p className="text-[10px] text-gray-700 mt-1 tracking-wider">
          {SCENARIOS.find((s) => s.id === localScenario)?.label || '聆听'}
        </p>
      </div>

      {/* Audio metrics (only when recording) */}
      {audioState.is_recording && (
        <div className="flex justify-center gap-8 mb-6">
          <div className="text-center">
            <p className="text-sm font-mono text-gray-300">{Math.round(audioState.volume_level)}</p>
            <p className="text-[10px] text-gray-600">音量</p>
          </div>
          <div className="w-px h-8 bg-gray-800" />
          <div className="text-center">
            <p className="text-sm font-mono text-gray-300">{Math.round(audioState.noise_level)}</p>
            <p className="text-[10px] text-gray-600">噪声</p>
          </div>
          <div className="w-px h-8 bg-gray-800" />
          <div className="text-center">
            <p className="text-sm font-mono text-gray-300">{Math.round(audioState.clarity_score)}</p>
            <p className="text-[10px] text-gray-600">清晰度</p>
          </div>
        </div>
      )}

      {/* Record button */}
      {audioState.is_recording ? (
        <button
          onClick={handleStop}
          className="w-full py-4 border border-white/40 text-white rounded-2xl text-sm font-medium active:scale-[0.98] flex items-center justify-center gap-2 hover:bg-white/5 mb-3"
        >
          <MicOff className="w-4 h-4" />
          结束聆听
        </button>
      ) : (
        <button
          onClick={handleStart}
          disabled={isProcessing}
          className="w-full py-4 bg-white hover:bg-gray-200 text-black rounded-2xl text-sm font-medium active:scale-[0.98] flex items-center justify-center gap-2 mb-3 disabled:bg-gray-800 disabled:text-gray-600"
        >
          <Mic className="w-4 h-4" />
          开始聆听
        </button>
      )}

      {/* Processing overlay */}
      {isProcessing && (
        <div className="p-3 bg-gray-900/50 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span className="text-xs text-gray-400">{processingStatus.message}</span>
            <span className="ml-auto text-xs text-gray-600 font-mono">{Math.round(processingStatus.progress)}%</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-0.5">
            <div
              className="h-0.5 bg-white/60 transition-all duration-300"
              style={{ width: `${processingStatus.progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
