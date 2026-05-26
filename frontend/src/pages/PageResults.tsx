import { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../api';
import { FileText, Languages, ChevronRight, ChevronDown, AlertTriangle, Zap, Calendar, X, Copy, Check, Download } from 'lucide-react';

interface SessionRecord {
  id: string;
  scenario: string;
  duration_sec: number;
  confidence: number;
  processing_time_ms: number;
  created_at: string;
}

const SCENARIO_LABELS: Record<string, string> = {
  meeting: '会议',
  learning: '学习',
  office: '办公',
  daily: '日常',
};

const MONTHS = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

export default function PageResults() {
  const { deviceState, processingStatus, isProcessing } = useApp();
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showFilter, setShowFilter] = useState(false);
  const [filterYear, setFilterYear] = useState<number | null>(null);
  const [filterMonth, setFilterMonth] = useState<number | null>(null);
  const [filterDay, setFilterDay] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const data = await api.getSessions();
      setSessions(data.sessions);
    } catch { /* ignore */ }
    setLoading(false);
  };

  // Parse dates
  const filteredSessions = useMemo(() => {
    let result = sessions;
    if (filterYear !== null) {
      result = result.filter((s) => new Date(s.created_at).getFullYear() === filterYear);
    }
    if (filterMonth !== null) {
      result = result.filter((s) => new Date(s.created_at).getMonth() === filterMonth);
    }
    if (filterDay !== null) {
      result = result.filter((s) => new Date(s.created_at).getDate() === filterDay);
    }
    return result;
  }, [sessions, filterYear, filterMonth, filterDay]);

  // Available years/months/days from data
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    sessions.forEach((s) => years.add(new Date(s.created_at).getFullYear()));
    return Array.from(years).sort((a, b) => b - a);
  }, [sessions]);

  const hasActiveFilter = filterYear !== null || filterMonth !== null || filterDay !== null;

  const formatFileName = (iso: string) => {
    const d = new Date(iso);
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return m > 0 ? `${m}分${sec}秒` : `${sec}秒`;
  };

  const handleCopy = (session: SessionRecord, d: any) => {
    const text = `【${SCENARIO_LABELS[session.scenario]}】${formatFileName(session.created_at)}\n\n转写：\n${d.original_text}\n\n翻译：\n${d.translated_text}\n\n摘要：\n${d.summary}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (session: SessionRecord, d: any) => {
    const text = `【${SCENARIO_LABELS[session.scenario]}】${formatFileName(session.created_at)}\n\n转写：\n${d.original_text}\n\n翻译：\n${d.translated_text}\n\n摘要：\n${d.summary}`;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${formatFileName(session.created_at).replace(/[/: ]/g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-5 h-5 border-2 border-gray-700 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full px-5 py-6">
      {/* Header with filter */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-medium text-gray-500 tracking-wider">处理记录</h2>
        <div className="flex items-center gap-2">
          {hasActiveFilter && (
            <button
              onClick={() => { setFilterYear(null); setFilterMonth(null); setFilterDay(null); }}
              className="text-[10px] text-gray-500 flex items-center gap-1 hover:text-white"
            >
              <X className="w-3 h-3" />
              清除筛选
            </button>
          )}
          <button
            onClick={() => setShowFilter(!showFilter)}
            className="p-1.5 text-gray-600 hover:text-white transition-colors"
          >
            <Calendar className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter panel */}
      {showFilter && (
        <div className="mb-4 p-3 bg-gray-900/50 rounded-xl border border-gray-800/30 space-y-3">
          {/* Year */}
          <div>
            <p className="text-[10px] text-gray-600 mb-1">年</p>
            <div className="flex gap-1.5 flex-wrap">
              {availableYears.map((y) => (
                <button
                  key={y}
                  onClick={() => { setFilterYear(y); setFilterMonth(null); setFilterDay(null); }}
                  className={`px-2 py-1 rounded text-xs ${filterYear === y ? 'bg-white text-black' : 'bg-gray-800 text-gray-500'}`}
                >
                  {y}
                </button>
              ))}
            </div>
          </div>
          {/* Month */}
          {filterYear !== null && (
            <div>
              <p className="text-[10px] text-gray-600 mb-1">月</p>
              <div className="flex gap-1.5 flex-wrap">
                {MONTHS.map((m, i) => (
                  <button
                    key={i}
                    onClick={() => { setFilterMonth(i); setFilterDay(null); }}
                    className={`px-2 py-1 rounded text-xs ${filterMonth === i ? 'bg-white text-black' : 'bg-gray-800 text-gray-500'}`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          )}
          {/* Day */}
          {filterMonth !== null && (
            <div>
              <p className="text-[10px] text-gray-600 mb-1">日</p>
              <div className="flex gap-1.5 flex-wrap">
                {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                  <button
                    key={d}
                    onClick={() => setFilterDay(d)}
                    className={`w-7 h-7 rounded-full text-xs flex items-center justify-center ${filterDay === d ? 'bg-white text-black' : 'bg-gray-800 text-gray-500'}`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Active filter badge */}
      {hasActiveFilter && (
        <div className="mb-3 flex items-center gap-2">
          <span className="px-2 py-0.5 bg-white/5 rounded text-[10px] text-gray-400">
            {filterYear}{filterMonth !== null ? `年${filterMonth + 1}月` : ''}{filterDay !== null ? `${filterDay}日` : ''}
          </span>
          <span className="text-[10px] text-gray-700">{filteredSessions.length} 条记录</span>
        </div>
      )}

      {/* Empty state */}
      {filteredSessions.length === 0 && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <FileText className="w-8 h-8 text-gray-800 mx-auto mb-3" />
            <p className="text-sm text-gray-600 mb-1">暂无处理记录</p>
            <p className="text-xs text-gray-700">在"聆听"页面开始录音后自动生成记录</p>
          </div>
        </div>
      )}

      {/* Session list */}
      <div className="space-y-2 overflow-y-auto no-scrollbar">
        {filteredSessions.map((s) => (
          <div key={s.id} className="bg-gray-900/30 rounded-xl border border-gray-800/30 overflow-hidden">
            <button
              onClick={() => {
                if (expandedId === s.id) {
                  setExpandedId(null);
                  setDetail(null);
                } else {
                  setExpandedId(s.id);
                  setDetail(generateMockDetail(s));
                }
              }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-900/50 transition-colors"
            >
              {/* Play icon */}
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                <span className="text-[10px] text-gray-500">{SCENARIO_LABELS[s.scenario]?.[0] || '?'}</span>
              </div>

              {/* Info */}
              <div className="flex-1 text-left min-w-0">
                <p className="text-xs text-gray-300 truncate">{formatFileName(s.created_at)}</p>
                <p className="text-[10px] text-gray-700 mt-0.5">
                  {formatDuration(s.duration_sec)} · {s.processing_time_ms}ms
                </p>
              </div>

              {expandedId === s.id ? (
                <ChevronDown className="w-4 h-4 text-gray-600 shrink-0" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-700 shrink-0" />
              )}
            </button>

            {/* Expanded detail */}
            {expandedId === s.id && detail && (
              <div className="px-4 pb-4 space-y-3 border-t border-gray-800/30 pt-3">
                {/* Playback simulation */}
                <div className="flex items-center gap-2 p-2 bg-gray-900/50 rounded-lg">
                  <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center">
                    <Zap className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex gap-0.5 items-center h-4">
                      {Array.from({ length: 20 }, (_, i) => (
                        <div
                          key={i}
                          className="w-0.5 bg-gray-600 rounded-full"
                          style={{
                            height: `${4 + Math.abs(Math.sin(i * 0.5 + s.id.charCodeAt(0) * 0.1)) * 12}px`,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-600 font-mono">{formatDuration(s.duration_sec)}</span>
                </div>

                {/* Original text */}
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <FileText className="w-3 h-3 text-gray-600" />
                    <span className="text-[10px] text-gray-600 tracking-wider">转写</span>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed line-clamp-3 bg-gray-900/50 p-2.5 rounded-lg">
                    {detail.original_text}
                  </p>
                </div>

                {/* Translation */}
                {detail.translated_text && (
                  <div>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Languages className="w-3 h-3 text-gray-600" />
                      <span className="text-[10px] text-gray-600 tracking-wider">翻译</span>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed line-clamp-3 bg-gray-900/50 p-2.5 rounded-lg">
                      {detail.translated_text}
                    </p>
                  </div>
                )}

                {/* Summary */}
                {detail.summary && (
                  <div>
                    <p className="text-xs text-gray-300 leading-relaxed bg-gray-900/50 p-2.5 rounded-lg">
                      {detail.summary}
                    </p>
                  </div>
                )}

                {/* Export actions */}
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleCopy(s, detail); }}
                    className="flex-1 py-2 bg-gray-800/60 rounded-lg text-[11px] text-gray-400 flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all hover:text-white"
                  >
                    {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                    {copied ? '已复制' : '复制文本'}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDownload(s, detail); }}
                    className="flex-1 py-2 bg-gray-800/60 rounded-lg text-[11px] text-gray-400 flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all hover:text-white"
                  >
                    <Download className="w-3 h-3" />
                    导出文件
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Processing overlay */}
      {isProcessing && (
        <div className="mt-3 p-3 bg-gray-900/50 rounded-xl border border-gray-800/50">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span className="text-xs text-gray-400">{processingStatus.message}</span>
            <span className="ml-auto text-xs text-gray-600 font-mono">{Math.round(processingStatus.progress)}%</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-0.5">
            <div className="h-0.5 bg-white/60 transition-all duration-300" style={{ width: `${processingStatus.progress}%` }} />
          </div>
        </div>
      )}
    </div>
  );
}

// Mock detail data
const MOCK_TEXTS: Record<string, { original: string; translated: string; summary: string }> = {
  meeting: {
    original: '今天我们讨论一下Q1的产品规划。首先，关于AI耳机的语音识别功能，我们需要在准确率上达到95%以上的目标。目前的模型在嘈杂环境下的表现还有提升空间，建议引入多麦克风阵列降噪技术。',
    translated: 'Today we discussed the Q1 product roadmap. First, regarding the AI earbuds\' speech recognition feature, we need to achieve an accuracy rate of over 95%.',
    summary: '会议讨论了Q1产品规划，重点包括语音识别目标准确率95%以上，建议引入多麦克风降噪技术。',
  },
  learning: {
    original: 'Hello, today we will learn about artificial intelligence and its applications. AI has transformed many industries, from healthcare to finance. Machine learning allows computers to learn from data without being explicitly programmed.',
    translated: '今天我们将学习人工智能及其应用。AI已经改变了从医疗到金融的许多行业。机器学习允许计算机从数据中学习而不需要显式编程。',
    summary: '本节课程介绍了AI基础知识及其在多个行业的应用。',
  },
  office: {
    original: '播放音乐，音量调到60%。打开降噪模式。设置定时器25分钟，我要专注工作。好的，现在切换到我常用的播客列表。',
    translated: 'Play music, set volume to 60%. Turn on noise cancellation mode. Set a timer for 25 minutes for focused work.',
    summary: '办公场景：音乐播放、降噪模式、专注定时器、播客切换。',
  },
  daily: {
    original: '今天天气真不错，适合出去走走。早上去了公园，空气很好，跑了两圈。中午和朋友一起吃了饭，聊了很多有趣的话题。下午去图书馆借了几本书。',
    translated: 'The weather is nice today, perfect for a walk. I went to the park in the morning, the air was great, ran two laps.',
    summary: '日常记录：晨跑公园、午餐聚会、图书馆借阅，充实的一天。',
  },
};

function generateMockDetail(session: SessionRecord) {
  const mock = MOCK_TEXTS[session.scenario] || MOCK_TEXTS['daily'];
  return {
    original_text: mock.original,
    translated_text: mock.translated,
    summary: mock.summary,
    word_count: mock.original.length,
  };
}
