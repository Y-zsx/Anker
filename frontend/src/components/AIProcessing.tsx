import { useApp } from '../context/AppContext';
import { Cpu, Languages, FileText, Zap, ChevronDown } from 'lucide-react';
import { useState } from 'react';

export default function AIProcessing() {
  const {
    aiConfig,
    processingStatus,
    isProcessing,
    updateAIConfig,
    processAI,
  } = useApp();
  const [showConfig, setShowConfig] = useState(false);

  const { phase, progress, confidence, message, current_text } = processingStatus;

  const isActive = phase !== 'idle';

  const phases = [
    { key: 'transcribing', label: '语音转写', icon: <Cpu className="w-3.5 h-3.5" /> },
    { key: 'translating', label: '翻译', icon: <Languages className="w-3.5 h-3.5" /> },
    { key: 'summarizing', label: '摘要', icon: <FileText className="w-3.5 h-3.5" /> },
    { key: 'done', label: '完成', icon: <Zap className="w-3.5 h-3.5" /> },
  ];

  const currentPhaseIdx = phases.findIndex((p) => p.key === phase);
  const isDone = phase === 'done';

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-medium text-gray-400 uppercase tracking-widest">AI 处理</h2>
        <div className="flex items-center gap-2">
          {/* Mode toggle */}
          <button
            onClick={() => updateAIConfig({
              mode: aiConfig.mode === 'standard' ? 'high_precision' : 'standard'
            })}
            className={`px-2.5 py-1 rounded text-xs transition-colors border ${
              aiConfig.mode === 'high_precision'
                ? 'bg-white text-black border-white'
                : 'border-gray-700 text-gray-400 hover:border-gray-500'
            }`}
          >
            {aiConfig.mode === 'standard' ? '标准' : '高精度'}
          </button>

          {/* Process button */}
          <button
            onClick={processAI}
            disabled={isProcessing}
            className="px-4 py-1.5 bg-white hover:bg-gray-200 disabled:bg-gray-800 disabled:text-gray-600 text-black rounded text-xs font-medium transition-colors flex items-center gap-1.5"
          >
            {isProcessing ? (
              <>
                <div className="w-3 h-3 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                处理中
              </>
            ) : (
              <>
                <Zap className="w-3 h-3" />
                处理
              </>
            )}
          </button>
        </div>
      </div>

      {/* Pipeline visualization */}
      <div className="flex gap-2 mb-4">
        {phases.slice(0, 3).map((p, i) => {
          const isThisPhase = currentPhaseIdx === i;
          const isCompleted = currentPhaseIdx > i || isDone;
          return (
            <div key={p.key} className="flex-1 flex items-center">
              <div
                className={`flex-1 py-2 px-2.5 rounded-md text-center text-xs transition-all flex items-center justify-center gap-1.5 ${
                  isCompleted
                    ? 'bg-white text-black'
                    : isThisPhase
                      ? 'bg-white/10 text-white'
                      : 'bg-gray-900 text-gray-600'
                }`}
              >
                {p.icon}
                {p.label}
              </div>
              {i < 2 && <div className={`w-3 h-px ${isCompleted ? 'bg-white' : isThisPhase ? 'bg-gray-600' : 'bg-gray-800'}`} />}
            </div>
          );
        })}
      </div>

      {/* Progress area */}
      {isActive && (
        <div className="space-y-4 mb-4">
          {/* Status message */}
          <div className="flex items-center gap-2 p-3 border border-gray-700/60 rounded-lg">
            {isProcessing ? (
              <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
            ) : (
              <Zap className="w-3.5 h-3.5 text-white" />
            )}
            <span className="text-sm text-gray-200">{message}</span>
            {!isDone && (
              <span className="ml-auto text-xs text-gray-500 font-mono">{Math.round(progress)}%</span>
            )}
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-800 rounded-full h-0.5">
            <div
              className="h-0.5 bg-white transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Confidence */}
          {confidence > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">置信度</span>
              <div className="flex items-center gap-3 flex-1 mx-4">
                <div className="flex-1 bg-gray-800 rounded-full h-0.5">
                  <div
                    className="h-0.5 bg-gray-400 transition-all duration-300"
                    style={{ width: `${confidence * 100}%` }}
                  />
                </div>
              </div>
              <span className="text-xs text-gray-400 font-mono">{(confidence * 100).toFixed(0)}%</span>
            </div>
          )}
        </div>
      )}

      {/* Current text preview */}
      {current_text && (
        <div className="mb-4 p-3 border border-gray-800/80 rounded-lg bg-gray-900/30">
          <p className="text-xs text-gray-500 mb-2">转写预览</p>
          <p className="text-xs text-gray-300 leading-relaxed line-clamp-3">{current_text}</p>
        </div>
      )}

      {/* Config panel (collapsible) */}
      <div className="mt-auto">
        <button
          onClick={() => setShowConfig(!showConfig)}
          className="w-full flex items-center justify-between py-2 text-xs text-gray-500 hover:text-white transition-colors"
        >
          <span>处理配置</span>
          <ChevronDown className={`w-3 h-3 transition-transform ${showConfig ? 'rotate-180' : ''}`} />
        </button>
        {showConfig && (
          <div className="grid grid-cols-2 gap-2 p-3 border border-gray-800 rounded-lg">
            <div>
              <p className="text-xs text-gray-600 mb-0.5">转写模型</p>
              <p className="text-xs text-gray-300">Whisper</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-0.5">翻译</p>
              <p className="text-xs text-gray-300">EN → ZH</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-0.5">摘要风格</p>
              <p className="text-xs text-gray-300">简洁</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-0.5">语言检测</p>
              <p className="text-xs text-gray-300">自动</p>
            </div>
          </div>
        )}
      </div>

      {/* Idle state */}
      {!isActive && !isProcessing && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-sm text-gray-600">完成录音后处理</p>
            <p className="text-xs text-gray-700 mt-1">转写 → 翻译 → 摘要</p>
          </div>
        </div>
      )}
    </div>
  );
}
