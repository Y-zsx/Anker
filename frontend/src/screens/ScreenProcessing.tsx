import { useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ChevronLeft } from 'lucide-react';

const PHASES = [
  { key: 'transcribing', label: '转写中' },
  { key: 'translating', label: '翻译中' },
  { key: 'summarizing', label: '整理中' },
  { key: 'done', label: '完成' },
];

export default function ScreenProcessing({
  onBack,
  onDone,
}: {
  onBack: () => void;
  onDone: () => void;
}) {
  const { processingStatus, isProcessing, processAI } = useApp();
  const { phase, progress, message, current_text } = processingStatus;

  const currentIdx = PHASES.findIndex((p) => p.key === phase);
  const isDone = phase === 'done';

  // Auto-trigger processing on mount
  const triggeredRef = useRef(false);
  useEffect(() => {
    if (!triggeredRef.current && phase === 'idle') {
      triggeredRef.current = true;
      processAI().then(() => onDone());
    }
  }, []);

  if (isDone) {
    onDone();
    return null;
  }

  return (
    <div className="flex flex-col h-full px-5 py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <button onClick={onBack} className="p-1 text-gray-500 hover:text-white">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-xs font-medium text-gray-400 tracking-wider">处理中</span>
        <div className="w-5" />
      </div>

      {/* Phase indicators */}
      <div className="space-y-3 mb-10">
        {PHASES.filter((p) => p.key !== 'done').map((p, i) => {
          const isActive = currentIdx === i;
          const isCompleted = currentIdx > i;
          return (
            <div
              key={p.key}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? 'bg-white/5 border border-white/10'
                  : isCompleted
                    ? 'bg-white/5 border border-transparent'
                    : 'bg-transparent'
              }`}
            >
              {/* Dot */}
              <div
                className={`w-2 h-2 rounded-full transition-all ${
                  isCompleted
                    ? 'bg-white'
                    : isActive
                      ? 'bg-white animate-pulse'
                      : 'bg-gray-800'
                }`}
              />
              <span
                className={`text-sm ${
                  isActive ? 'text-white' : isCompleted ? 'text-gray-400' : 'text-gray-700'
                }`}
              >
                {p.label}
              </span>
              {isCompleted && (
                <span className="ml-auto text-xs text-gray-600">完成</span>
              )}
              {isActive && (
                <div className="ml-auto w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
              )}
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      {isProcessing && (
        <div className="space-y-3">
          <div className="w-full bg-gray-900 rounded-full h-0.5">
            <div
              className="h-0.5 bg-white/60 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between items-center">
            <p className="text-xs text-gray-600">{message}</p>
            <span className="text-xs text-gray-600 font-mono">{Math.round(progress)}%</span>
          </div>
        </div>
      )}

      {/* Text preview */}
      {current_text && (
        <div className="mt-8 p-4 bg-gray-900/50 rounded-xl">
          <p className="text-[10px] text-gray-600 mb-2 tracking-wider">实时转写</p>
          <p className="text-xs text-gray-400 leading-relaxed line-clamp-4">{current_text}</p>
        </div>
      )}
    </div>
  );
}
