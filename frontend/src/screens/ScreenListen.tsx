import { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Mic, MicOff, ChevronLeft } from 'lucide-react';

const SCENARIOS = [
  { id: 'meeting', label: '会议' },
  { id: 'learning', label: '学习' },
  { id: 'office', label: '办公' },
  { id: 'daily', label: '日常' },
];

export default function ScreenListen({
  onBack,
  onRecordingDone,
}: {
  onBack: () => void;
  onRecordingDone: () => void;
}) {
  const { audioState, selectedScenario, setSelectedScenario, startRecording, stopRecording } = useApp();
  const [localScenario, setLocalScenario] = useState(selectedScenario || 'meeting');
  const animRef = useRef<number>();

  // Sync context when scenario changes
  useEffect(() => {
    setSelectedScenario(localScenario);
  }, [localScenario, setSelectedScenario]);

  // Animate waveform bars
  const [bars, setBars] = useState<number[]>(() => Array.from({ length: 40 }, () => 4));
  useEffect(() => {
    if (audioState.is_recording) {
      let frame = 0;
      const animate = () => {
        frame++;
        setBars(
          Array.from({ length: 40 }, (_, i) => {
            const h = Math.abs(Math.sin(i * 0.3 + frame * 0.05)) * 40 + 4;
            return h;
          })
        );
        animRef.current = requestAnimationFrame(animate);
      };
      animRef.current = requestAnimationFrame(animate);
    } else {
      setBars(Array.from({ length: 40 }, () => 4));
    }
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [audioState.is_recording]);

  const handleStart = async () => {
    // Update selected scenario (need to add this to context)
    await startRecording();
  };

  const handleStop = async () => {
    await stopRecording();
    onRecordingDone();
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-full px-5 py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button onClick={onBack} className="p-1 text-gray-500 hover:text-white">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-xs font-medium text-gray-400 tracking-wider">
          {SCENARIOS.find((s) => s.id === localScenario)?.label || '聆听'}
        </span>
        <div className="w-5" />
      </div>

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

      {/* Waveform */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="flex items-center justify-center gap-[2px] h-16 mb-6 w-full">
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

        {/* Timer */}
        <div className="text-center mb-2">
          <span className="text-5xl font-mono font-extralight text-white tracking-wider">
            {formatTime(audioState.duration)}
          </span>
          {audioState.is_recording && (
            <span className="ml-2 inline-block w-2 h-2 rounded-full bg-white/60 animate-pulse" />
          )}
        </div>
      </div>

      {/* Audio metrics */}
      {audioState.is_recording && (
        <div className="flex justify-center gap-6 mb-8">
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
      {!audioState.is_recording ? (
        <button
          onClick={handleStart}
          className="w-full py-4 bg-white hover:bg-gray-200 text-black rounded-2xl text-sm font-medium transition-all active:scale-[0.98] flex items-center justify-center gap-2 mb-4"
        >
          <Mic className="w-4 h-4" />
          开始聆听
        </button>
      ) : (
        <button
          onClick={handleStop}
          className="w-full py-4 border border-white/40 text-white rounded-2xl text-sm font-medium transition-all active:scale-[0.98] flex items-center justify-center gap-2 hover:bg-white/5"
        >
          <MicOff className="w-4 h-4" />
          结束聆听
        </button>
      )}
    </div>
  );
}
