import { useApp } from '../context/AppContext';
import {
  Zap, Clock, MessageSquare, BarChart3, AlertTriangle,
  Lightbulb, Wifi, Volume2, Mic, ArrowUpRight, ArrowDownRight,
  Minus,
} from 'lucide-react';

// Simple horizontal bar chart component
function BarChart({
  data,
  maxValue,
  color = 'bg-white',
}: {
  data: { label: string; value: number }[];
  maxValue: number;
  color?: string;
}) {
  return (
    <div className="space-y-2.5">
      {data.map((d, i) => {
        const pct = maxValue > 0 ? (d.value / maxValue) * 100 : 0;
        return (
          <div key={i}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-gray-400">{d.label}</span>
              <span className="text-[10px] text-gray-300 font-mono">{d.value}</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full ${color} transition-all duration-500`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Accuracy circle
function AccuracyCircle({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;
  const color = pct >= 90 ? 'text-green-400' : pct >= 80 ? 'text-yellow-400' : 'text-red-400';

  return (
    <div className="flex flex-col items-center">
      <svg className="w-24 h-24" viewBox="0 0 80 80">
        <circle
          cx="40" cy="40" r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="4"
        />
        <circle
          cx="40" cy="40" r={radius}
          fill="none"
          className={color}
          stroke="currentColor"
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 40 40)"
        />
        <text
          x="40" y="36" textAnchor="middle"
          className="fill-white text-lg font-light"
          style={{ fontSize: 16 }}
        >
          {pct}%
        </text>
        <text
          x="40" y="52" textAnchor="middle"
          className="fill-gray-500"
          style={{ fontSize: 8 }}
        >
          准确率
        </text>
      </svg>
    </div>
  );
}

export default function PageReport() {
  const { report, deviceState } = useApp();

  // Empty state: no sessions yet
  if (!report || report.total_interactions === 0) {
    return (
      <div className="flex flex-col h-full px-5 py-6">
        <h2 className="text-xs font-medium text-gray-500 tracking-wider mb-6">性能报告</h2>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <BarChart3 className="w-8 h-8 text-gray-800 mx-auto mb-3" />
            <p className="text-sm text-gray-600 mb-1">暂无报告数据</p>
            <p className="text-xs text-gray-700">完成至少一次聆听后将自动生成性能报告</p>
          </div>
        </div>
      </div>
    );
  }

  const {
    avg_response_time_ms,
    transcription_accuracy,
    ai_processing_time_ms,
    total_interactions,
    connection_uptime_pct,
    noise_environment,
    speech_rate,
    bottlenecks,
    suggestions,
  } = report;

  // Derived quality indicators
  const responseQuality =
    avg_response_time_ms < 2000 ? 'good' : avg_response_time_ms < 4000 ? 'fair' : 'poor';
  const processingQuality =
    ai_processing_time_ms < 3000 ? 'good' : ai_processing_time_ms < 5000 ? 'fair' : 'poor';

  const trendIcon = (quality: string) => {
    if (quality === 'good') return <ArrowDownRight className="w-3.5 h-3.5 text-green-400" />;
    if (quality === 'fair') return <Minus className="w-3.5 h-3.5 text-yellow-400" />;
    return <ArrowUpRight className="w-3.5 h-3.5 text-red-400" />;
  };

  // Chart data: response time per session (simulated from avg)
  const sessionTimes = Array.from({ length: Math.min(total_interactions, 5) }, (_, i) => ({
    label: `第${i + 1}次`,
    value: Math.round(avg_response_time_ms * (0.7 + Math.random() * 0.6)),
  }));
  const maxTime = Math.max(...sessionTimes.map((s) => s.value), 1);

  return (
    <div className="flex flex-col h-full px-5 py-6 overflow-y-auto no-scrollbar">
      <h2 className="text-xs font-medium text-gray-500 tracking-wider mb-5">性能报告</h2>

      {/* Overview cards */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-gray-900/40 rounded-2xl border border-gray-800/30 p-3.5">
          <div className="flex items-center gap-1.5 mb-2">
            <Clock className="w-3.5 h-3.5 text-gray-500" />
            <span className="text-[10px] text-gray-500">平均响应</span>
          </div>
          <p className="text-xl font-light text-white">{Math.round(avg_response_time_ms)}</p>
          <p className="text-[10px] text-gray-600 mt-0.5">毫秒</p>
          <div className="mt-1">{trendIcon(responseQuality)}</div>
        </div>
        <div className="bg-gray-900/40 rounded-2xl border border-gray-800/30 p-3.5">
          <div className="flex items-center gap-1.5 mb-2">
            <MessageSquare className="w-3.5 h-3.5 text-gray-500" />
            <span className="text-[10px] text-gray-500">处理次数</span>
          </div>
          <p className="text-xl font-light text-white">{total_interactions}</p>
          <p className="text-[10px] text-gray-600 mt-0.5">次</p>
        </div>
      </div>

      {/* Accuracy circle + AI processing */}
      <div className="bg-gray-900/30 rounded-2xl border border-gray-800/30 overflow-hidden mb-5">
        <div className="px-4 py-4 flex items-center gap-6">
          <AccuracyCircle value={transcription_accuracy} />
          <div className="flex-1 space-y-3">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <Zap className="w-3.5 h-3.5 text-gray-500" />
                <span className="text-[10px] text-gray-500">AI处理耗时</span>
              </div>
              <p className="text-sm text-gray-300 font-mono">
                {Math.round(ai_processing_time_ms)} ms
              </p>
              <div className="mt-1">{trendIcon(processingQuality)}</div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <Wifi className="w-3.5 h-3.5 text-gray-500" />
                <span className="text-[10px] text-gray-500">连接稳定性</span>
              </div>
              <p className="text-sm text-gray-300 font-mono">
                {connection_uptime_pct.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Session response time chart */}
      {sessionTimes.length > 0 && (
        <div className="bg-gray-900/30 rounded-2xl border border-gray-800/30 overflow-hidden mb-5">
          <div className="px-4 py-3 flex items-center gap-1.5 mb-1">
            <BarChart3 className="w-3.5 h-3.5 text-gray-500" />
            <span className="text-[10px] text-gray-500 tracking-wider">响应时长趋势</span>
          </div>
          <div className="px-4 pb-4">
            <BarChart data={sessionTimes} maxValue={maxTime} />
          </div>
        </div>
      )}

      {/* Environment info */}
      <div className="bg-gray-900/30 rounded-2xl border border-gray-800/30 overflow-hidden mb-5">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Volume2 className="w-3.5 h-3.5 text-gray-500" />
            <span className="text-xs text-gray-300">噪音环境</span>
          </div>
          <span className="text-xs text-gray-500">{noise_environment}</span>
        </div>
        <div className="px-4 py-3 border-t border-gray-800/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mic className="w-3.5 h-3.5 text-gray-500" />
            <span className="text-xs text-gray-300">语音速率</span>
          </div>
          <span className="text-xs text-gray-500">{speech_rate}</span>
        </div>
        <div className="px-4 py-3 border-t border-gray-800/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wifi className="w-3.5 h-3.5 text-gray-500" />
            <span className="text-xs text-gray-300">当前设备</span>
          </div>
          <span className="text-xs text-gray-500">
            {deviceState.connected ? deviceState.device?.name : '未连接'}
          </span>
        </div>
      </div>

      {/* Bottlenecks */}
      {bottlenecks.length > 0 && (
        <div className="bg-gray-900/30 rounded-2xl border border-gray-800/30 overflow-hidden mb-5">
          <div className="px-4 py-3 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-yellow-500" />
            <span className="text-[10px] text-yellow-500 tracking-wider">体验瓶颈</span>
          </div>
          <div className="px-4 pb-3 space-y-1.5">
            {bottlenecks.map((b, i) => (
              <p key={i} className="text-[11px] text-gray-400 leading-relaxed">
                {b}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Suggestions */}
      <div className="bg-gray-900/30 rounded-2xl border border-gray-800/30 overflow-hidden">
        <div className="px-4 py-3 flex items-center gap-1.5">
          <Lightbulb className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-[10px] text-blue-400 tracking-wider">优化建议</span>
        </div>
        <div className="px-4 pb-3 space-y-1.5">
          {suggestions.map((s, i) => (
            <p key={i} className="text-[11px] text-gray-400 leading-relaxed">
              {s}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
