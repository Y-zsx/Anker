import { Bluetooth } from 'lucide-react';
import EarbudsHero from '../components/EarbudsHero';
import { useApp } from '../context/AppContext';

export default function ScreenConnect({ onConnected }: { onConnected: () => void }) {
  const { deviceStatus, connectDevice } = useApp();

  const handleConnect = async () => {
    await connectDevice('earbuds_pro_001');
    onConnected();
  };

  return (
    <div className="flex flex-col items-center justify-center h-full px-6 py-12">
      {/* Brand */}
      <div className="absolute top-14 left-0 right-0 text-center">
        <h1 className="text-lg font-semibold tracking-[0.25em] text-white">ANKERHUB</h1>
      </div>

      {/* Earbuds illustration */}
      <div className="flex-1 flex items-center justify-center">
        <EarbudsHero connected={deviceStatus.connected} />
      </div>

      {/* Status & action */}
      <div className="w-full text-center space-y-6">
        {deviceStatus.connected && deviceStatus.device ? (
          <div className="space-y-4">
            <p className="text-white text-sm font-medium">
              {deviceStatus.device.name}
            </p>
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              已连接 · 电量 {deviceStatus.device.battery}%
            </div>
            <button
              onClick={onConnected}
              className="inline-flex items-center gap-2 px-8 py-3 bg-white text-black rounded-full text-sm font-medium hover:bg-gray-200 transition-colors active:scale-95"
            >
              开始聆听
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-500 text-sm">设备未连接</p>
            <button
              onClick={handleConnect}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-white text-black rounded-full text-sm font-medium hover:bg-gray-200 transition-colors active:scale-95"
            >
              <Bluetooth className="w-4 h-4" />
              连接设备
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
