import { Headphones, Mic, FileText, BarChart3, Settings2 } from 'lucide-react';

type Tab = 'device' | 'listen' | 'results' | 'report' | 'settings';

const TABS = [
  { key: 'device' as Tab, label: '设备', Icon: Headphones },
  { key: 'listen' as Tab, label: '聆听', Icon: Mic },
  { key: 'results' as Tab, label: '记录', Icon: FileText },
  { key: 'report' as Tab, label: '报告', Icon: BarChart3 },
  { key: 'settings' as Tab, label: '设置', Icon: Settings2 },
];

export default function TabBar({
  activeTab,
  onTabChange,
}: {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}) {
  return (
    <div className="border-t border-gray-800/60 bg-black/95 backdrop-blur-sm px-2 pb-6 pt-1.5 flex justify-around items-center">
      {TABS.map(({ key, label, Icon }) => {
        const isActive = activeTab === key;

        return (
          <button
            key={key}
            onClick={() => onTabChange(key)}
            className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg transition-all min-w-[48px] ${
              isActive
                ? 'text-white'
                : 'text-gray-600 hover:text-gray-400'
            }`}
          >
            <Icon className="w-4.5 h-4.5" style={{ width: 18, height: 18 }} />
            <span className="text-[10px]">{label}</span>
            {isActive && <div className="w-1 h-1 rounded-full bg-white mt-0.5" />}
          </button>
        );
      })}
    </div>
  );
}
