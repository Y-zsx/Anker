import { useState, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { Radio, Wifi, Bluetooth, RefreshCw, X, Signal } from 'lucide-react';

export default function DeviceConnection() {
  const { deviceStatus, disconnectDevice } = useApp();
  const [scanning, setScanning] = useState(false);
  const [foundDevices, setFoundDevices] = useState<any[]>([]);
  const [connMessage, setConnMessage] = useState('');

  const scanDevices = useCallback(async () => {
    setScanning(true);
    setFoundDevices([]);
    setConnMessage('');

    const response = await fetch('/api/device/scan');
    if (!response.body) return;

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.device) {
                setFoundDevices((prev) => {
                  if (!prev.find((d) => d.id === data.device.id)) {
                    return [...prev, data.device];
                  }
                  return prev;
                });
              }
              if (data.devices) {
                setFoundDevices(data.devices);
                setScanning(false);
              }
            } catch { /* skip */ }
          }
        }
      }
    } catch { /* stream closed */ }
  }, []);

  const handleConnect = useCallback(async (deviceId: string) => {
    setConnMessage('正在连接...');
    try {
      const response = await fetch(`/api/device/connect/${deviceId}`, {
        method: 'POST',
      });
      if (!response.body) return;

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              setConnMessage(data.message);
            } catch { /* skip */ }
          }
        }
      }
    } catch {
      setConnMessage('连接失败');
    }
  }, []);

  const handleDisconnect = useCallback(async () => {
    await disconnectDevice();
    setFoundDevices([]);
    setConnMessage('');
  }, [disconnectDevice]);

  const getSignalBars = (strength: number) => {
    const count = strength > -45 ? 4 : strength > -55 ? 3 : strength > -65 ? 2 : 1;
    return (
      <div className="flex items-end gap-px h-3.5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`w-1 rounded-sm transition-colors ${i <= count ? 'bg-white' : 'bg-gray-700'}`}
            style={{ height: `${i * 3 + 2}px` }}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-medium text-gray-400 uppercase tracking-widest">设备连接</h2>
        {deviceStatus.connected && (
          <button
            onClick={handleDisconnect}
            className="p-1.5 hover:bg-gray-800 rounded-md transition-colors"
          >
            <X className="w-3.5 h-3.5 text-gray-500" />
          </button>
        )}
      </div>

      {/* Connected device */}
      {deviceStatus.connected && deviceStatus.device && (
        <div className="p-3 border border-gray-700/60 rounded-lg mb-4 bg-gray-900/40">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
              <Bluetooth className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{deviceStatus.device.name}</p>
              <p className="text-xs text-gray-500">{deviceStatus.device.firmware_version}</p>
            </div>
            <div className="flex items-center gap-2">
              {getSignalBars(deviceStatus.device.signal_strength)}
              <span className="text-xs text-gray-400 font-mono">{deviceStatus.device.battery}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Connection status */}
      {connMessage && (
        <div className="p-2.5 border border-gray-700/60 rounded-lg mb-4 bg-white/5">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <p className="text-sm text-gray-300">{connMessage}</p>
          </div>
        </div>
      )}

      {/* Scan */}
      <button
        onClick={scanDevices}
        disabled={scanning || deviceStatus.connected}
        className="w-full py-2 border border-gray-700 hover:border-gray-500 disabled:border-gray-800 disabled:text-gray-600 text-gray-200 rounded-md transition-colors flex items-center justify-center gap-2 text-xs mb-3"
      >
        {scanning ? (
          <>
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            扫描中
          </>
        ) : (
          <>
            <Radio className="w-3.5 h-3.5" />
            扫描设备
          </>
        )}
      </button>

      {/* Device list */}
      {foundDevices.length > 0 && (
        <div className="space-y-1.5 flex-1 overflow-auto">
          {foundDevices.map((device) => (
            <button
              key={device.id}
              onClick={() => handleConnect(device.id)}
              disabled={deviceStatus.connected}
              className="w-full p-2.5 border border-gray-800 hover:border-gray-600 rounded-md transition-colors text-left disabled:opacity-40"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded bg-gray-800 flex items-center justify-center">
                    {device.type === 'bluetooth' ? (
                      <Bluetooth className="w-3 h-3 text-gray-400" />
                    ) : (
                      <Wifi className="w-3 h-3 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-white font-medium">{device.name}</p>
                    <p className="text-xs text-gray-500">{device.type === 'bluetooth' ? '蓝牙' : 'WiFi'} / {device.battery}%</p>
                  </div>
                </div>
                {getSignalBars(device.signal_strength)}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!deviceStatus.connected && foundDevices.length === 0 && !connMessage && (
        <div className="flex-1 flex flex-col items-center justify-center py-8">
          <Signal className="w-6 h-6 text-gray-800 mb-2" />
          <p className="text-xs text-gray-600">扫描附近设备</p>
        </div>
      )}
    </div>
  );
}
