import { useApp } from '../context/AppContext';
import { Mic, MicOff, Volume2, Activity, BarChart3, Clock } from 'lucide-react';

const SCENARIO_MAP: Record<string, { label: string; icon: typeof Mic }> = {
  meeting: { label: '会议模式', icon: Mic },
  learning: { label: '学习模式', icon: Clock },
  office: { label: '办公模式', icon: BarChart3 },
  daily: { label: '日常模式', icon: Activity },
};

export default function AudioCapture() {
  const {
    audioState,
    selectedScenario,
    startRecording,
    stopRecording,
    deviceStatus,
  } = useApp();

  const { is_recording, duration, volume_level, noise_level, clarity_score, sample_rate } = audioState;

  const activeLabel = SCENARIO_MAP[selectedScenario]?.label || '';

  return (
    <div className="h-full flex flex-col">
      {/* Scenario selector */}
      <div className="flex gap-1 mb-6 bg-gray-900/60 p-1 rounded-lg">
        {Object.entries(SCENARIO_MAP).map(([id, { label }]) => (
          <button
            key={id}
            onClick={() => {}}
            className={`flex-1 py-1.5 rounded-md text-xs transition-colors ${
              selectedScenario === id
                ? 'bg-white text-black font-medium'
                : 'text-gray-500 hover:text-white'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Waveform area */}
      <div className="flex-1 flex flex-col items-center justify-center border border-gray-800/80 rounded-lg bg-gray-900/30 px-6 py-8 mb-6 relative overflow-hidden">
        {/* Waveform bars */}
        <div className="flex items-center justify-center gap-px h-16 mb-6">
          {Array.from({ length: 48 }).map((_, i) => {
            const isActive = is_recording;
            const h = isActive
              ? Math.abs(Math.sin(i * 0.35 + Date.now() / 250)) * 40 + 4
              : 4;
            return (
              <div
                key={i}
                className={`w-1 rounded-sm transition-all ${isActive ? 'bg-white/80' : 'bg-gray-800'}`}
                style={{ height: `${h}px` }}
              />
            );
          })}
        </div>

        {/* Timer */}
        <div className="text-center">
          <span className="text-4xl font-mono font-light text-white tracking-wider">
            {formatTime(duration)}
          </span>
          {is_recording && (
            <span className="ml-2 inline-flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            </span>
          )}
        </div>

        {/* Scenario badge */}
        {activeLabel && (
          <span className="mt-4 px-3 py-1 border border-gray-700 rounded-full text-xs text-gray-400">
            {activeLabel}
          </span>
        )}

        {/* Sample rate */}
        <span className="absolute top-3 right-3 text-xs text-gray-600 font-mono">
          {sample_rate}Hz
        </span>
      </div>

      {/* Audio metrics */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="p-2 border border-gray-800/80 rounded-lg text-center">
          <Volume2 className="w-3.5 h-3.5 text-gray-500 mx-auto mb-1" />
          <p className="text-base font-semibold font-mono text-white">{Math.round(volume_level)}</p>
          <p className="text-xs text-gray-600">音量</p>
        </div>
        <div className="p-2 border border-gray-800/80 rounded-lg text-center">
          <Activity className="w-3.5 h-3.5 text-gray-500 mx-auto mb-1" />
          <p className="text-base font-semibold font-mono text-white">{Math.round(noise_level)}</p>
          <p className="text-xs text-gray-600">噪声 dB</p>
        </div>
        <div className="p-2 border border-gray-800/80 rounded-lg text-center">
          <BarChart3 className="w-3.5 h-3.5 text-gray-500 mx-auto mb-1" />
          <p className="text-base font-semibold font-mono text-white">{Math.round(clarity_score)}</p>
          <p className="text-xs text-gray-600">清晰度</p>
        </div>
      </div>

      {/* Record button */}
      {!is_recording ? (
        <button
          onClick={startRecording}
          disabled={!deviceStatus.connected}
          className="w-full py-3.5 bg-white hover:bg-gray-200 disabled:bg-gray-800 disabled:text-gray-600 text-black rounded-lg transition-colors flex items-center justify-center gap-2 text-sm font-medium"
        >
          <Mic className="w-4 h-4" />
          开始录音
        </button>
      ) : (
        <button
          onClick={stopRecording}
          className="w-full py-3.5 border border-white hover:bg-white hover:text-black text-white rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
        >
          <MicOff className="w-4 h-4" />
          停止录音
        </button>
      )}

      {!deviceStatus.connected && (
        <p className="text-xs text-gray-600 mt-3 text-center">连接设备后可使用录音功能</p>
      )}
    </div>
  );
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
