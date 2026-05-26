import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ChevronLeft, FileText, Languages, Copy } from 'lucide-react';

type Tab = 'original' | 'translation' | 'summary';

export default function ScreenResult({
  onBack,
  onViewReport,
}: {
  onBack: () => void;
  onViewReport: () => void;
}) {
  const { aiResult, processingStatus } = useApp();
  const [activeTab, setActiveTab] = useState<Tab>('original');
  const [copied, setCopied] = useState(false);

  const result = aiResult;
  if (!result) {
    return (
      <div className="flex flex-col h-full px-5 py-12 items-center justify-center">
        <p className="text-sm text-gray-600">暂无结果</p>
        <button onClick={onBack} className="mt-4 text-xs text-gray-500">返回</button>
      </div>
    );
  }

  const tabs: { key: Tab; label: string; icon: typeof FileText }[] = [
    { key: 'original', label: '原文', icon: FileText },
    { key: 'translation', label: '翻译', icon: Languages },
    { key: 'summary', label: '摘要', icon: FileText },
  ];

  const contentMap: Record<Tab, string> = {
    original: result.original_text || '暂无转写内容',
    translation: result.translated_text || '暂无翻译内容',
    summary: result.summary || '暂无摘要',
  };

  const handleCopy = () => {
    navigator.clipboard?.writeText(contentMap[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex flex-col h-full px-5 py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="p-1 text-gray-500 hover:text-white">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-xs font-medium text-gray-400 tracking-wider">处理结果</span>
        <button onClick={handleCopy} className="p-1 text-gray-500 hover:text-white">
          <Copy className="w-4 h-4" />
        </button>
      </div>

      {/* Confidence badge */}
      <div className="flex items-center justify-center mb-6">
        <div className="px-3 py-1.5 bg-white/5 rounded-full flex items-center gap-2">
          <div
            className={`w-1.5 h-1.5 rounded-full ${
              result.confidence > 0.85 ? 'bg-green-500' : result.confidence > 0.7 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
          />
          <span className="text-xs text-gray-400">
            置信度 {(result.confidence * 100).toFixed(1)}%
          </span>
          <span className="text-gray-700">·</span>
          <span className="text-xs text-gray-400">{result.word_count} 字</span>
          <span className="text-gray-700">·</span>
          <span className="text-xs text-gray-400">{result.processing_time_ms}ms</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-gray-900/60 p-0.5 rounded-lg">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`flex-1 py-2 rounded-md text-xs transition-colors flex items-center justify-center gap-1 ${
              activeTab === t.key
                ? 'bg-white/10 text-white'
                : 'text-gray-600 hover:text-white'
            }`}
          >
            <t.icon className="w-3 h-3" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="p-4 bg-gray-900/30 rounded-xl border border-gray-800/50 min-h-[200px]">
          <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
            {contentMap[activeTab]}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 space-y-2">
        <button
          onClick={onViewReport}
          className="w-full py-3 bg-white/5 border border-white/10 text-white rounded-xl text-sm hover:bg-white/10 transition-colors"
        >
          查看性能报告
        </button>
      </div>

      {/* Copied toast */}
      {copied && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 px-4 py-2 bg-white text-black text-xs rounded-full shadow-lg z-50">
          已复制
        </div>
      )}
    </div>
  );
}
