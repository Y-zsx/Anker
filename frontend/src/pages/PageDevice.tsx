import { useState } from 'react';
import { Bluetooth, RotateCcw, ChevronDown, ChevronUp, Wifi, Thermometer, Clock, Battery } from 'lucide-react';
import EarbudsHero from '../components/EarbudsHero';
import { useApp } from '../context/AppContext';

export default function PageDevice() {
  const { deviceState, connectDevice, disconnectDevice } = useApp();
  const [showDetails, setShowDetails] = useState(false);
  const [connecting, setConnecting] = useState(false);

  const handleConnect = async () => {
    setConnecting(true);
    await connectDevice('earbuds_pro_001');
    setConnecting(false);
  };

  const handleDisconnect = async () => {
    await disconnectDevice();
  };

  return (
    <div className="flex flex-col min-h-full px-6 py-6">
      {/* Brand */}
      <div className="text-center mb-6">
        <h1 className="text-lg font-semibold tracking-[0.3em] text-white">ANKERHUB</h1>
        <p className="text-[10px] text-gray-700 mt-1 tracking-wider">AI SMART EARBUDS</p>
      </div>

      {/* Earbuds illustration */}
      <div className="flex items-center justify-center py-4">
        <EarbudsHero
          connected={deviceState.connected}
          battery={deviceState.device?.battery ?? 0}
          size={140}
        />
      </div>

      {/* Connection status / actions */}
      <div className="space-y-3 mb-4">
        {deviceState.connected && deviceState.device ? (
          <>
            {/* Device info card */}
            <div className="p-4 bg-gray-900/50 rounded-2xl border border-gray-800/50 space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-white">{deviceState.device.name}</p>
                  <p className="text-[10px] text-gray-600 font-mono">FW {deviceState.device.firmware_version}</p>
                </div>
                <span className="flex items-center gap-1.5 text-xs text-green-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  已连接
                </span>
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-4 gap-2">
                <div className="flex items-center gap-1.5">
                  <Battery className="w-3 h-3 text-gray-600" />
                  <span className="text-xs text-gray-300 font-mono">{deviceState.device.battery}%</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Wifi className="w-3 h-3 text-gray-600" />
                  <span className="text-xs text-gray-300 font-mono">{deviceState.device.signal_strength}dB</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Thermometer className="w-3 h-3 text-gray-600" />
                  <span className="text-xs text-gray-300 font-mono">{deviceState.device.temperature}°C</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-gray-600" />
                  <span className="text-xs text-gray-300 font-mono">{deviceState.device.audio_latency}ms</span>
                </div>
              </div>

              {/* Expandable details */}
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="w-full flex items-center justify-between py-1 text-[10px] text-gray-600 hover:text-gray-400 transition-colors"
              >
                <span>详细信息</span>
                {showDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>

              {showDetails && (
                <div className="space-y-2 pt-2 border-t border-gray-800/30 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600">设备 ID</span>
                    <span className="text-gray-400 font-mono">{deviceState.device.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">连接类型</span>
                    <span className="text-gray-400">蓝牙 5.3</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">连接时间</span>
                    <span className="text-gray-400 font-mono">
                      {deviceState.device.connected_at
                        ? new Date(deviceState.device.connected_at).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
                        : '--'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">麦克风</span>
                    <span className={deviceState.device.mic_enabled ? 'text-green-500' : 'text-gray-500'}>
                      {deviceState.device.mic_enabled ? '已开启' : '已关闭'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Disconnect button */}
            <button
              onClick={handleDisconnect}
              className="w-full py-3 border border-gray-800 text-gray-500 rounded-2xl text-xs flex items-center justify-center gap-1.5 hover:border-gray-600 hover:text-gray-300 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              断开连接
            </button>
          </>
        ) : (
          <>
            {/* Status messages during connection */}
            {connecting || (deviceState.phase !== 'idle' && deviceState.phase !== 'connected') && (
              <div className="text-center py-3">
                <div className="w-5 h-5 border-2 border-gray-700 border-t-white rounded-full animate-spin mx-auto mb-2" />
                <p className="text-xs text-gray-500">{deviceState.message}</p>
              </div>
            )}

            {/* Not connected */}
            {!deviceState.connected && deviceState.phase === 'idle' && (
              <div className="text-center space-y-3">
                <p className="text-sm text-gray-500">设备未连接</p>
                <p className="text-[10px] text-gray-700">连接 ANKERHUB 耳机开始使用</p>
                <button
                  onClick={handleConnect}
                  disabled={connecting}
                  className="w-full py-3.5 bg-white text-black rounded-2xl text-sm font-medium flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:bg-gray-800 disabled:text-gray-600"
                >
                  <Bluetooth className="w-4 h-4" />
                  连接设备
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
