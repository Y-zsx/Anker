import { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ChevronLeft, Clock, Target, Zap, Activity } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
} from 'recharts';

export default function ScreenReport({ onBack }: { onBack: () => void }) {
  const { report, fetchReport } = useApp();

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  if (!report) {
    return (
      <div className="flex flex-col h-full px-5 py-12 items-center justify-center">
        <p className="text-sm text-gray-600">暂无报告数据</p>
        <button onClick={onBack} className="mt-4 text-xs text-gray-500">返回</button>
      </div>
    );
  }

  const barData = [
    { name: '响应', value: Math.round(report.avg_response_time_ms) },
    { name: '处理', value: Math.round(report.ai_processing_time_ms) },
  ];

  const radarData = [
    { metric: '准确率', value: Math.round(report.transcription_accuracy * 100) },
    { metric: '稳定性', value: report.connection_uptime_pct },
    { metric: '环境', value: report.noise_environment === '安静' ? 90 : report.noise_environment === '一般' ? 70 : 45 },
    { metric: '语音', value: report.speech_rate === '清晰' ? 92 : report.speech_rate === '正常' ? 80 : 65 },
  ];

  return (
    <div className="flex flex-col h-full px-5 py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="p-1 text-gray-500 hover:text-white">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-xs font-medium text-gray-400 tracking-wider">性能报告</span>
        <div className="w-5" />
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="p-3 bg-gray-900/50 rounded-xl">
          <div className="flex items-center gap-1.5 mb-1">
            <Clock className="w-3 h-3 text-gray-600" />
            <span className="text-[10px] text-gray-600">响应时间</span>
          </div>
          <p className="text-xl font-mono text-white">{Math.round(report.avg_response_time_ms)}<span className="text-xs text-gray-600 ml-1">ms</span></p>
        </div>
        <div className="p-3 bg-gray-900/50 rounded-xl">
          <div className="flex items-center gap-1.5 mb-1">
            <Target className="w-3 h-3 text-gray-600" />
            <span className="text-[10px] text-gray-600">准确率</span>
          </div>
          <p className="text-xl font-mono text-white">{(report.transcription_accuracy * 100).toFixed(1)}<span className="text-xs text-gray-600 ml-1">%</span></p>
        </div>
        <div className="p-3 bg-gray-900/50 rounded-xl">
          <div className="flex items-center gap-1.5 mb-1">
            <Zap className="w-3 h-3 text-gray-600" />
            <span className="text-[10px] text-gray-600">AI 处理</span>
          </div>
          <p className="text-xl font-mono text-white">{Math.round(report.ai_processing_time_ms)}<span className="text-xs text-gray-600 ml-1">ms</span></p>
        </div>
        <div className="p-3 bg-gray-900/50 rounded-xl">
          <div className="flex items-center gap-1.5 mb-1">
            <Activity className="w-3 h-3 text-gray-600" />
            <span className="text-[10px] text-gray-600">交互</span>
          </div>
          <p className="text-xl font-mono text-white">{report.total_interactions}<span className="text-xs text-gray-600 ml-1">次</span></p>
        </div>
      </div>

      {/* Charts */}
      <div className="space-y-3 mb-4">
        <div className="p-3 bg-gray-900/30 rounded-xl border border-gray-800/50">
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f1f22" />
              <XAxis dataKey="name" stroke="#52525b" fontSize={10} tickLine={false} />
              <YAxis stroke="#52525b" fontSize={10} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0c0c0e', border: '1px solid #27272a', borderRadius: '6px', color: '#e4e4e7', fontSize: '11px' }}
                cursor={{ fill: '#1f1f22' }}
              />
              <Bar dataKey="value" fill="#ffffff" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="p-3 bg-gray-900/30 rounded-xl border border-gray-800/50">
          <ResponsiveContainer width="100%" height={120}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#27272a" />
              <PolarAngleAxis dataKey="metric" stroke="#71717a" fontSize={9} />
              <Radar name="评分" dataKey="value" stroke="#ffffff" fill="#ffffff" fillOpacity={0.08} strokeWidth={1} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Suggestions */}
      {report.suggestions.length > 0 && (
        <div className="p-3 bg-gray-900/30 rounded-xl border border-gray-800/50">
          <p className="text-[10px] text-gray-600 mb-2 tracking-wider">建议</p>
          <div className="space-y-1.5">
            {report.suggestions.map((s, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="w-1 h-1 rounded-full bg-white mt-1.5 flex-shrink-0" />
                <span className="text-xs text-gray-400">{s}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
