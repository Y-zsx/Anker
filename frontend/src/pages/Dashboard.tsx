import DeviceConnection from '../components/DeviceConnection';
import DeviceMonitor from '../components/DeviceMonitor';
import AudioCapture from '../components/AudioCapture';
import AIProcessing from '../components/AIProcessing';
import ResultPresentation from '../components/ResultPresentation';

export default function Dashboard() {
  return (
    <div className="h-[calc(100vh-0px)] flex">
      {/* Left panel: Device controls (280px) */}
      <div className="w-72 border-r border-gray-800 p-4 overflow-y-auto flex-shrink-0">
        <div className="space-y-6">
          <DeviceConnection />
          <div className="border-t border-gray-800 pt-6">
            <DeviceMonitor />
          </div>
        </div>
      </div>

      {/* Main area: Recording + AI (flex-1) */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <h1 className="text-lg font-medium text-white">工作台</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              设备连接 → 录音采集 → AI处理 → 结果展示
            </p>
          </div>
          <div className="space-y-6">
            <div className="h-[420px]">
              <AudioCapture />
            </div>
            <div className="h-[360px]">
              <AIProcessing />
            </div>
          </div>
        </div>
      </div>

      {/* Right panel: Results (320px) */}
      <div className="w-80 border-l border-gray-800 p-4 overflow-y-auto flex-shrink-0">
        <ResultPresentation />
      </div>
    </div>
  );
}
