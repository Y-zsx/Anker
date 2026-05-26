import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../api';
import {
  ChevronRight, Moon, Shield, Database, Info, Bell, Languages,
  Wifi, Headphones, LogOut, Trash2, ChevronDown, ChevronUp,
  RotateCcw, Mic,
} from 'lucide-react';

export default function PageSettings() {
  const { deviceState, disconnectDevice, fetchReport } = useApp();
  const [localOnly, setLocalOnly] = useState(true);
  const [analytics, setAnalytics] = useState(false);
  const [autoReconnect, setAutoReconnect] = useState(true);
  const [notificationSound, setNotificationSound] = useState(true);
  const [retentionDays, setRetentionDays] = useState(30);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  const handleClearData = async () => {
    if (!confirm('确定要清除所有隐私数据吗？此操作不可撤销。')) return;
    try {
      await api.clearData();
      alert('隐私数据已清除');
    } catch {
      alert('清除失败，请稍后重试');
    }
  };

  return (
    <div className="flex flex-col h-full px-5 py-6 overflow-y-auto no-scrollbar">
      <h2 className="text-xs font-medium text-gray-500 tracking-wider mb-6">设置</h2>

      {/* Device section */}
      <p className="text-[10px] text-gray-600 tracking-wider mb-2">设备</p>
      <div className="bg-gray-900/30 rounded-2xl border border-gray-800/30 overflow-hidden mb-6">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Headphones className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-300">当前设备</span>
          </div>
          <span className="text-xs text-gray-600">
            {deviceState.connected ? deviceState.device?.name : '未连接'}
          </span>
        </div>
        <div className="px-4 py-3 border-t border-gray-800/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Wifi className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-300">自动重连</span>
          </div>
          <button
            onClick={() => setAutoReconnect(!autoReconnect)}
            className={`w-9 h-5 rounded-full transition-colors relative ${
              autoReconnect ? 'bg-white/20' : 'bg-gray-800'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all ${
                autoReconnect ? 'right-0.5' : 'left-0.5'
              }`}
            />
          </button>
        </div>
        <div className="px-4 py-3 border-t border-gray-800/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Mic className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-300">麦克风权限</span>
          </div>
          <span className={`text-xs ${deviceState.device?.mic_enabled ? 'text-green-500' : 'text-gray-600'}`}>
            {deviceState.device?.mic_enabled ? '已开启' : '已关闭'}
          </span>
        </div>
        {deviceState.connected && (
          <button
            onClick={disconnectDevice}
            className="px-4 py-3 border-t border-gray-800/30 flex items-center justify-between w-full hover:bg-gray-900/50"
          >
            <div className="flex items-center gap-3">
              <LogOut className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-red-400">断开设备</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-gray-700" />
          </button>
        )}
      </div>

      {/* Audio settings */}
      <p className="text-[10px] text-gray-600 tracking-wider mb-2">音频</p>
      <div className="bg-gray-900/30 rounded-2xl border border-gray-800/30 overflow-hidden mb-6">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Languages className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-300">翻译源语言</span>
          </div>
          <span className="text-xs text-gray-600">英文</span>
        </div>
        <div className="px-4 py-3 border-t border-gray-800/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Languages className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-300">翻译目标语言</span>
          </div>
          <span className="text-xs text-gray-600">中文</span>
        </div>
      </div>

      {/* Privacy & Security */}
      <p className="text-[10px] text-gray-600 tracking-wider mb-2">隐私与安全</p>
      <div className="bg-gray-900/30 rounded-2xl border border-gray-800/30 overflow-hidden mb-6">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-300">仅本地处理</span>
          </div>
          <button
            onClick={() => setLocalOnly(!localOnly)}
            className={`w-9 h-5 rounded-full transition-colors relative ${
              localOnly ? 'bg-white/20' : 'bg-gray-800'
            }`}
          >
            <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all ${localOnly ? 'right-0.5' : 'left-0.5'}`} />
          </button>
        </div>
        <div className="px-4 py-3 border-t border-gray-800/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Database className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-300">数据保留</span>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={retentionDays}
              onChange={(e) => setRetentionDays(Number(e.target.value))}
              className="bg-transparent text-xs text-gray-600 text-right appearance-none pr-2"
            >
              <option value={7}>7天</option>
              <option value={30}>30天</option>
              <option value={90}>90天</option>
            </select>
          </div>
        </div>
        <div className="px-4 py-3 border-t border-gray-800/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Info className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-300">使用分析</span>
          </div>
          <button
            onClick={() => setAnalytics(!analytics)}
            className={`w-9 h-5 rounded-full transition-colors relative ${
              analytics ? 'bg-white/20' : 'bg-gray-800'
            }`}
          >
            <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all ${analytics ? 'right-0.5' : 'left-0.5'}`} />
          </button>
        </div>

        {/* Expandable privacy details */}
        <button
          onClick={() => setShowPrivacy(!showPrivacy)}
          className="w-full px-4 py-2 border-t border-gray-800/30 flex items-center justify-between text-[10px] text-gray-600 hover:text-gray-400"
        >
          <span>数据存储说明</span>
          {showPrivacy ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
        {showPrivacy && (
          <div className="px-4 pb-3 space-y-2 text-[10px] text-gray-700">
            <p>· 所有音频数据默认在本地处理</p>
            <p>· 云端处理需用户明确授权</p>
            <p>· 数据采用 AES-256 加密存储</p>
            <p>· 可随时清除所有历史数据</p>
            <button
              onClick={handleClearData}
              className="mt-2 flex items-center gap-1 text-red-400 hover:text-red-300"
            >
              <Trash2 className="w-3 h-3" />
              立即清除所有数据
            </button>
          </div>
        )}
      </div>

      {/* Notifications */}
      <p className="text-[10px] text-gray-600 tracking-wider mb-2">通知</p>
      <div className="bg-gray-900/30 rounded-2xl border border-gray-800/30 overflow-hidden mb-6">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-300">提示音</span>
          </div>
          <button
            onClick={() => setNotificationSound(!notificationSound)}
            className={`w-9 h-5 rounded-full transition-colors relative ${
              notificationSound ? 'bg-white/20' : 'bg-gray-800'
            }`}
          >
            <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all ${notificationSound ? 'right-0.5' : 'left-0.5'}`} />
          </button>
        </div>
      </div>

      {/* About */}
      <p className="text-[10px] text-gray-600 tracking-wider mb-2">关于</p>
      <div className="bg-gray-900/30 rounded-2xl border border-gray-800/30 overflow-hidden mb-6">
        <button
          onClick={() => setShowAbout(!showAbout)}
          className="w-full px-4 py-3 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <Info className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-300">应用信息</span>
          </div>
          {showAbout ? <ChevronUp className="w-3.5 h-3.5 text-gray-700" /> : <ChevronRight className="w-3.5 h-3.5 text-gray-700" />}
        </button>
        {showAbout && (
          <div className="px-4 pb-3 space-y-2 text-xs border-t border-gray-800/30 pt-3">
            <div className="flex justify-between">
              <span className="text-gray-600">名称</span>
              <span className="text-gray-400">ANKERHUB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">版本</span>
              <span className="text-gray-400 font-mono">v1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">架构</span>
              <span className="text-gray-400">设备模拟层 + AI处理层 + UI层</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">数据库</span>
              <span className="text-gray-400 font-mono">SQLite (async)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">通信协议</span>
              <span className="text-gray-400">REST API + SSE</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
