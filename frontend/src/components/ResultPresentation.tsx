import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FileText, Languages, FileBarChart, Download, Copy, Edit3, Check } from 'lucide-react';

export default function ResultPresentation() {
  const { aiResult } = useApp();
  const [activeTab, setActiveTab] = useState<'transcript' | 'translation' | 'summary'>('transcript');
  const [editing, setEditing] = useState(false);
  const [editedText, setEditedText] = useState('');
  const [copied, setCopied] = useState(false);

  if (!aiResult) {
    return (
      <div className="h-full flex flex-col">
        <h2 className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-4">处理结果</h2>
        <div className="flex-1 flex flex-col items-center justify-center py-12">
          <FileText className="w-6 h-6 text-gray-800 mb-2" />
          <p className="text-xs text-gray-600">处理完成后显示结果</p>
        </div>
      </div>
    );
  }

  const handleExport = () => {
    let content = '';
    if (activeTab === 'transcript') content = aiResult.original_text;
    else if (activeTab === 'translation') content = aiResult.translated_text || '';
    else content = aiResult.summary || '';

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeTab}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    let text = '';
    if (activeTab === 'transcript') text = aiResult.original_text;
    else if (activeTab === 'translation') text = aiResult.translated_text || '';
    else text = aiResult.summary || '';

    navigator.clipboard?.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const tabs = [
    { id: 'transcript' as const, label: '转写', icon: <FileText className="w-3.5 h-3.5" /> },
    { id: 'translation' as const, label: '翻译', icon: <Languages className="w-3.5 h-3.5" />, disabled: !aiResult.translated_text },
    { id: 'summary' as const, label: '摘要', icon: <FileBarChart className="w-3.5 h-3.5" />, disabled: !aiResult.summary },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-medium text-gray-400 uppercase tracking-widest">处理结果</h2>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-gray-400">{(aiResult.confidence * 100).toFixed(0)}%</span>
          <span className="text-xs text-gray-600">置信度</span>
        </div>
      </div>

      {/* Confidence bar */}
      <div className="mb-4">
        <div className="w-full bg-gray-800 rounded-full h-0.5 mb-1.5">
          <div
            className="h-0.5 bg-white transition-all"
            style={{ width: `${aiResult.confidence * 100}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-600 font-mono">
          {aiResult.confidence_segments?.map((seg, i) => (
            <span key={i}>{(seg.confidence * 100).toFixed(0)}%</span>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-gray-900/60 p-0.5 rounded-md">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setEditing(false); }}
            disabled={tab.disabled}
            className={`flex-1 py-1.5 rounded text-xs transition-colors flex items-center justify-center gap-1 ${
              activeTab === tab.id
                ? 'bg-white text-black font-medium'
                : tab.disabled
                  ? 'text-gray-700 cursor-not-allowed'
                  : 'text-gray-500 hover:text-white'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-3 border border-gray-800 rounded-lg bg-gray-900/30 mb-4 min-h-[200px]">
        {activeTab === 'transcript' && (
          <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">{aiResult.original_text}</p>
        )}

        {activeTab === 'translation' && aiResult.translated_text && (
          editing ? (
            <div>
              <textarea
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                className="w-full bg-transparent text-sm text-gray-200 leading-relaxed outline-none resize-none font-sans"
                rows={8}
              />
              <button
                onClick={() => setEditing(false)}
                className="mt-3 px-3 py-1.5 bg-white text-black rounded text-xs flex items-center gap-1"
              >
                <Check className="w-3 h-3" />
                保存
              </button>
            </div>
          ) : (
            <div>
              <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">{aiResult.translated_text}</p>
              <button
                onClick={() => { setEditedText(aiResult.translated_text || ''); setEditing(true); }}
                className="mt-3 text-xs text-gray-500 hover:text-white flex items-center gap-1"
              >
                <Edit3 className="w-3 h-3" />
                编辑
              </button>
            </div>
          )
        )}

        {activeTab === 'summary' && aiResult.summary && (
          <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">{aiResult.summary}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleExport}
          className="flex-1 py-2 border border-gray-700 hover:border-gray-500 rounded-md transition-colors text-xs text-gray-300 flex items-center justify-center gap-1.5"
        >
          <Download className="w-3.5 h-3.5" />
          导出
        </button>
        <button
          onClick={handleCopy}
          className="flex-1 py-2 border border-gray-700 hover:border-gray-500 rounded-md transition-colors text-xs text-gray-300 flex items-center justify-center gap-1.5"
        >
          {copied ? (
            <Check className="w-3.5 h-3.5" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
          {copied ? '已复制' : '复制'}
        </button>
      </div>

      {/* Footer */}
      <div className="mt-3 pt-3 border-t border-gray-800/60 flex justify-between text-xs text-gray-600 font-mono">
        <span>{aiResult.word_count} chars</span>
        <span>{aiResult.processing_time_ms}ms</span>
      </div>
    </div>
  );
}
