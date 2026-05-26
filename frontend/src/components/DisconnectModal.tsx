import { WifiOff, RefreshCw, X, Headphones } from 'lucide-react';

export default function DisconnectModal({
  deviceName,
  onReconnect,
  onDismiss,
}: {
  deviceName: string;
  onReconnect: () => void;
  onDismiss: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-6">
      <div className="w-full max-w-sm bg-gray-900 rounded-3xl p-6 shadow-2xl">
        {/* Icon */}
        <div className="w-14 h-14 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-4">
          <WifiOff className="w-6 h-6 text-red-400" />
        </div>

        {/* Title */}
        <p className="text-center text-sm font-medium text-white mb-1">设备已断开</p>
        <p className="text-center text-[11px] text-gray-500 mb-5">
          {deviceName} 已断开连接
        </p>

        {/* Info */}
        <div className="bg-gray-800/50 rounded-xl p-3 mb-5 flex items-center gap-3">
          <Headphones className="w-4 h-4 text-gray-500 shrink-0" />
          <p className="text-[11px] text-gray-400">
            蓝牙连接中断。是否尝试重新连接？
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onDismiss}
            className="flex-1 py-3 border border-gray-700 text-gray-300 rounded-xl text-sm active:scale-[0.98] flex items-center justify-center gap-1.5"
          >
            <X className="w-3.5 h-3.5" />
            稍后连接
          </button>
          <button
            onClick={onReconnect}
            className="flex-1 py-3 bg-white text-black rounded-xl text-sm font-medium active:scale-[0.98] flex items-center justify-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            重新连接
          </button>
        </div>
      </div>
    </div>
  );
}
