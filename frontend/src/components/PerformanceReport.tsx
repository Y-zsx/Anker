import { useEffect } from 'react';
import { useApp } from '../context/AppContext';
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
import { AlertTriangle, Lightbulb, Clock, Target, Activity, Zap } from 'lucide-react';

export default function PerformanceReport() {
  const { report, fetchReport } = useApp();

  useEffect(() => {
    fetchReport();
    const interval = setInterval(fetchReport, 10000);
    return () => clearInterval(interval);
  }, [fetchReport]);

  if (!report) return null;

  const barData = [
    { name: '响应时间', value: Math.round(report.avg_response_time_ms) },
    { name: '处理耗时', value: Math.round(report.ai_processing_time_ms) },
  ];

  const radarData = [
    { metric: '准确率', value: Math.round(report.transcription_accuracy * 100) },
    { metric: '连接稳定', value: report.connection_uptime_pct },
    { metric: '环境', value: report.noise_environment === '安静' ? 90 : report.noise_environment === '一般' ? 70 : 45 },
    { metric: '语音', value: report.speech_rate === '清晰' ? 92 : report.speech_rate === '正常' ? 80 : 65 },
    { metric: '交互', value: report.total_interactions > 0 ? Math.min(95, 60 + report.total_interactions * 10) : 60 },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-1">性能报告</h2>
        <p className="text-sm text-gray-600">系统表现分析与优化建议</p>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-4 gap-3">
        <div className="p-4 border border-gray-800 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-3.5 h-3.5 text-gray-500" />
            <span className="text-xs text-gray-500">平均响应</span>
          </div>
          <p className="text-2xl font-light text-white font-mono">{Math.round(report.avg_response_time_ms)}</p>
          <p className="text-xs text-gray-600">ms</p>
        </div>
        <div className="p-4 border border-gray-800 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-3.5 h-3.5 text-gray-500" />
            <span className="text-xs text-gray-500">准确率</span>
          </div>
          <p className="text-2xl font-light text-white font-mono">{(report.transcription_accuracy * 100).toFixed(1)}</p>
          <p className="text-xs text-gray-600">%</p>
        </div>
        <div className="p-4 border border-gray-800 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-3.5 h-3.5 text-gray-500" />
            <span className="text-xs text-gray-500">AI处理</span>
          </div>
          <p className="text-2xl font-light text-white font-mono">{Math.round(report.ai_processing_time_ms)}</p>
          <p className="text-xs text-gray-600">ms</p>
        </div>
        <div className="p-4 border border-gray-800 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-3.5 h-3.5 text-gray-500" />
            <span className="text-xs text-gray-500">交互次数</span>
          </div>
          <p className="text-2xl font-light text-white font-mono">{report.total_interactions}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 border border-gray-800 rounded-lg">
          <h3 className="text-xs text-gray-500 mb-4 uppercase tracking-wider">耗时分析</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f1f22" />
              <XAxis dataKey="name" stroke="#52525b" fontSize={11} tickLine={false} />
              <YAxis stroke="#52525b" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0c0c0e', border: '1px solid #27272a', borderRadius: '6px', color: '#e4e4e7', fontSize: '12px' }}
                cursor={{ fill: '#1f1f22' }}
              />
              <Bar dataKey="value" fill="#ffffff" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="p-4 border border-gray-800 rounded-lg">
          <h3 className="text-xs text-gray-500 mb-4 uppercase tracking-wider">能力评估</h3>
          <ResponsiveContainer width="100%" height={180}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#27272a" />
              <PolarAngleAxis dataKey="metric" stroke="#71717a" fontSize={10} />
              <Radar
                name="评分"
                dataKey="value"
                stroke="#ffffff"
                fill="#ffffff"
                fillOpacity={0.1}
                strokeWidth={1.5}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Environment */}
      <div className="p-4 border border-gray-800 rounded-lg">
        <h3 className="text-xs text-gray-500 mb-3 uppercase tracking-wider">环境分析</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-gray-900/50 rounded-md">
            <p className="text-xs text-gray-600">噪声环境</p>
            <p className="text-sm text-white mt-0.5">{report.noise_environment}</p>
          </div>
          <div className="p-3 bg-gray-900/50 rounded-md">
            <p className="text-xs text-gray-600">语速评估</p>
            <p className="text-sm text-white mt-0.5">{report.speech_rate}</p>
          </div>
        </div>
      </div>

      {/* Bottlenecks */}
      {report.bottlenecks.length > 0 && (
        <div>
          <h3 className="text-xs text-gray-500 mb-3 flex items-center gap-2 uppercase tracking-wider">
            <AlertTriangle className="w-3.5 h-3.5" />
            体验瓶颈
          </h3>
          <div className="space-y-1.5">
            {report.bottlenecks.map((b, i) => (
              <div key={i} className="flex items-start gap-2 p-3 border border-gray-800 rounded-md">
                <span className="w-1.5 h-1.5 bg-gray-500 rounded-full mt-1 flex-shrink-0" />
                <span className="text-sm text-gray-400">{b}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggestions */}
      {report.suggestions.length > 0 && (
        <div>
          <h3 className="text-xs text-gray-500 mb-3 flex items-center gap-2 uppercase tracking-wider">
            <Lightbulb className="w-3.5 h-3.5" />
            优化建议
          </h3>
          <div className="space-y-1.5">
            {report.suggestions.map((s, i) => (
              <div key={i} className="flex items-start gap-2 p-3 border border-gray-800/80 rounded-md">
                <span className="w-1.5 h-1.5 bg-white rounded-full mt-1 flex-shrink-0" />
                <span className="text-sm text-gray-300">{s}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
