import { Bluetooth, RotateCcw } from 'lucide-react';
import EarbudsHero from '../components/EarbudsHero';
import { useApp } from '../context/AppContext';

export default function PageDevice({ onConnected }: { onConnected: () => void }) {
  const { deviceState, connectDevice, disconnectDevice } = useApp();

  const handleConnect = async () => {
    await connectDevice('earbuds_pro_001');
    // After connection SSE completes, user can click "start listening"
  };

  const handleStartListening = () => {
    onConnected();
  };

  const handleDisconnect = async () => {
    await disconnectDevice();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-full px-6 py-8">
      {/* Brand */}
      <div className="mb-8 text-center">
        <h1 className="text-lg font-semibold tracking-[0.3em] text-white">ANKERHUB</h1>
        <p className="text-[10px] text-gray-600 mt-1 tracking-wider">AI SMART EARBUDS</p>
      </div>

      {/* Earbuds illustration */}
      <div className="flex-1 flex items-center justify-center">
        <EarbudsHero connected={deviceState.connected} battery={deviceState.device?.battery ?? 0} />
      </div>

      {/* Connection status / actions */}
      <div className="w-full space-y-4 mb-4">
        {deviceState.connected && deviceState.device ? (
          <div className="space-y-4">
            {/* Device info card */}
            <div className="p-4 bg-gray-900/50 rounded-2xl border border-gray-800/50 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-white">{deviceState.device.name}</span>
                <span className="w-2 h-2 rounded-full bg-green-500" />
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-xs text-gray-500">电量</p>
                  <p className="text-sm font-mono text-white">{deviceState.device.battery}%</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">信号</p>
                  <p className="text-sm font-mono text-white">{deviceState.device.signal_strength}dB</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">延迟</p>
                  <p className="text-sm font-mono text-white">{deviceState.device.audio_latency}ms</p>
                </div>
              </div>
              <p className="text-[10px] text-gray-600 font-mono">
                FW {deviceState.device.firmware_version}
              </p>
            </div>

            {/* Actions */}
            <button
              onClick={handleStartListening}
              className="w-full py-3.5 bg-white text-black rounded-2xl text-sm font-medium active:scale-[0.98] transition-transform"
            >
              开始聆听
            </button>
            <button
              onClick={handleDisconnect}
              className="w-full py-2.5 text-gray-500 text-xs flex items-center justify-center gap-1.5 hover:text-gray-300 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              断开连接
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Status */}
            <div className="text-center space-y-1">
              {deviceState.phase !== 'idle' && deviceState.phase !== 'connected' && (
                <>
                  <div className="w-4 h-4 border-2 border-gray-600 border-t-white rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-gray-500">{deviceState.message}</p>
                </>
              )}
              {!deviceState.connected && deviceState.phase === 'idle' && (
                <>
                  <p className="text-sm text-gray-500">设备未连接</p>
                  <p className="text-[10px] text-gray-700">连接 ANKERHUB 耳机开始使用</p>
                </>
              )}
            </div>

            {/* Connect button */}
            {!deviceState.connected && deviceState.phase === 'idle' && (
              <button
                onClick={handleConnect}
                className="w-full py-3.5 bg-white text-black rounded-2xl text-sm font-medium flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
              >
                <Bluetooth className="w-4 h-4" />
                连接设备
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
