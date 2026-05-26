import { Headphones, BarChart3, Settings } from 'lucide-react';

type Tab = 'workspace' | 'report' | 'settings';

export default function Sidebar({ activeTab, onTabChange }: { activeTab: Tab; onTabChange: (tab: Tab) => void }) {
  return (
    <aside className="w-16 bg-black border-r border-gray-800 flex flex-col items-center py-4 gap-1 fixed left-0 top-0 bottom-0 z-50">
      {/* Logo */}
      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-4">
        <Headphones className="w-5 h-5 text-white" />
      </div>

      {/* Nav items */}
      <button
        onClick={() => onTabChange('workspace')}
        className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
          activeTab === 'workspace'
            ? 'bg-white text-black'
            : 'text-gray-500 hover:text-white hover:bg-gray-900'
        }`}
        title="工作台"
      >
        <Headphones className="w-5 h-5" />
      </button>

      <button
        onClick={() => onTabChange('report')}
        className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
          activeTab === 'report'
            ? 'bg-white text-black'
            : 'text-gray-500 hover:text-white hover:bg-gray-900'
        }`}
        title="性能报告"
      >
        <BarChart3 className="w-5 h-5" />
      </button>

      <button
        onClick={() => onTabChange('settings')}
        className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
          activeTab === 'settings'
            ? 'bg-white text-black'
            : 'text-gray-500 hover:text-white hover:bg-gray-900'
        }`}
        title="设置"
      >
        <Settings className="w-5 h-5" />
      </button>

      {/* Bottom spacer */}
      <div className="flex-1" />
      <div className="w-6 h-6 rounded-full border border-gray-700" />
    </aside>
  );
}
