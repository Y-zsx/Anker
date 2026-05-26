import { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Battery, Thermometer, Wifi, Activity, AlertTriangle } from 'lucide-react';

export default function DeviceMonitor() {
  const { deviceStatus, fetchDeviceStatus } = useApp();

  useEffect(() => {
    if (deviceStatus.connected) {
      const interval = setInterval(fetchDeviceStatus, 5000);
      return () => clearInterval(interval);
    }
  }, [deviceStatus.connected, fetchDeviceStatus]);

  if (!deviceStatus.connected || !deviceStatus.device) {
    return (
      <div className="h-full flex flex-col">
        <h2 className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-4">设备状态</h2>
        <div className="flex-1 flex flex-col items-center justify-center py-8">
          <Activity className="w-6 h-6 text-gray-800 mb-2" />
          <p className="text-xs text-gray-600">设备未连接</p>
        </div>
      </div>
    );
  }

  const { device, connection_quality } = deviceStatus;

  const batteryColor =
    device.battery > 60 ? 'text-white' : device.battery > 30 ? 'text-gray-300' : 'text-gray-500';
  const batteryBarColor =
    device.battery > 60 ? 'bg-white' : device.battery > 30 ? 'bg-gray-400' : 'bg-gray-600';

  const qualityLabel =
    connection_quality === 'excellent' ? '良好' :
    connection_quality === 'good' ? '正常' :
    connection_quality === 'fair' ? '一般' : '较弱';

  const tempColor = device.temperature < 38 ? 'text-white' : device.temperature < 42 ? 'text-gray-300' : 'text-gray-500';
  const latencyColor = device.audio_latency < 50 ? 'text-white' : device.audio_latency < 70 ? 'text-gray-300' : 'text-gray-500';

  const alerts: string[] = [];
  if (device.battery < 30) alerts.push('电量较低');
  if (device.temperature >= 40) alerts.push('温度偏高');
  if (device.audio_latency >= 60) alerts.push('延迟偏高');
  if (connection_quality === 'poor') alerts.push('连接不稳定');
  if (device.firmware_version < 'v2.3.0') alerts.push('建议更新固件');

  const metrics = [
    { icon: <Battery className="w-3.5 h-3.5" />, label: '电量', value: `${device.battery}%`, color: batteryColor, bar: device.battery, barColor: batteryBarColor },
    { icon: <Wifi className="w-3.5 h-3.5" />, label: '信号', value: `${device.signal_strength}dBm`, color: 'text-white', badge: qualityLabel },
    { icon: <Thermometer className="w-3.5 h-3.5" />, label: '温度', value: `${device.temperature}°C`, color: tempColor },
    { icon: <Activity className="w-3.5 h-3.5" />, label: '延迟', value: `${device.audio_latency}ms`, color: latencyColor },
  ];

  return (
    <div className="h-full flex flex-col">
      <h2 className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-4">设备状态</h2>

      {/* Device header */}
      <div className="flex items-center gap-3 mb-4 p-2.5 border border-gray-700/60 rounded-lg">
        <div className="w-7 h-7 rounded-md bg-white/5 flex items-center justify-center">
          <Battery className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">{device.name}</p>
          <p className="text-xs text-gray-500">{device.firmware_version}</p>
        </div>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 gap-2 flex-1">
        {metrics.map((m, i) => (
          <div key={i} className="p-3 border border-gray-800/80 rounded-lg bg-gray-900/30">
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-gray-500">{m.icon}</span>
              <span className="text-xs text-gray-500">{m.label}</span>
            </div>
            <p className={`text-lg font-semibold font-mono ${m.color}`}>{m.value}</p>
            {'bar' in m && (
              <div className="mt-2 w-full bg-gray-800 rounded-full h-1">
                <div className={`h-1 rounded-full ${m.barColor} transition-all`} style={{ width: `${m.bar}%` }} />
              </div>
            )}
            {'badge' in m && (
              <span className="text-xs text-gray-400 mt-1 inline-block">{m.badge}</span>
            )}
          </div>
        ))}
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="mt-3 space-y-1.5">
          {alerts.map((alert, i) => (
            <div key={i} className="flex items-center gap-2 p-2 border border-gray-800 rounded-md">
              <AlertTriangle className="w-3 h-3 text-gray-400 flex-shrink-0" />
              <span className="text-xs text-gray-400">{alert}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
