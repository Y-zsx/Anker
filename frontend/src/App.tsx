import { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import PhoneFrame from './components/PhoneFrame';
import TabBar from './components/TabBar';
import PageDevice from './pages/PageDevice';
import PageListen from './pages/PageListen';
import PageResults from './pages/PageResults';
import PageSettings from './pages/PageSettings';

type Tab = 'device' | 'listen' | 'results' | 'settings';

function AppContent() {
  const [tab, setTab] = useState<Tab>('device');
  const { deviceState, fetchReport } = useApp();

  // Initial data load
  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  // Guarded tab switching: require device for listen/results
  const switchTab = (t: Tab) => {
    if ((t === 'listen' || t === 'results') && !deviceState.connected) {
      setTab('device');
      return;
    }
    setTab(t);
  };

  const renderPage = () => {
    switch (tab) {
      case 'device':
        return <PageDevice onConnected={() => switchTab('listen')} />;
      case 'listen':
        return <PageListen onProcessed={() => switchTab('results')} />;
      case 'results':
        return <PageResults />;
      case 'settings':
        return <PageSettings />;
    }
  };

  return (
    <PhoneFrame>
      <div className="h-full bg-black text-white flex flex-col">
        {/* Status bar */}
        <div className="flex justify-between items-center px-6 pt-3 pb-1 text-[10px] text-gray-600 font-medium">
          <span>ANKERHUB</span>
          {deviceState.connected && (
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <span>{deviceState.device?.battery}%</span>
            </div>
          )}
        </div>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto no-scrollbar">
          {renderPage()}
        </div>

        {/* Bottom tab bar */}
        <TabBar activeTab={tab} onTabChange={switchTab} />
      </div>
    </PhoneFrame>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
