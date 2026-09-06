import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Cpu, 
  BookOpen, 
  Download, 
  Wifi, 
  WifiOff, 
  Layers, 
  FileText,
  ChevronDown
} from 'lucide-react';
import { AIAgentProvider } from '../types';
import { AI_PROVIDERS } from '../services/aiGateway';

interface HeaderProps {
  activeTab: 'general' | 'curriculum';
  setActiveTab: (tab: 'general' | 'curriculum') => void;
  selectedProvider: AIAgentProvider;
  setSelectedProvider: (provider: AIAgentProvider) => void;
  onOpenUserGuide: () => void;
  onOpenInstallationGuide: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  selectedProvider,
  setSelectedProvider,
  onOpenUserGuide,
  onOpenInstallationGuide
}) => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [showProviderDropdown, setShowProviderDropdown] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // PWA BeforeInstallPrompt handler
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredInstallPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredInstallPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallPWA = async () => {
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    const { outcome } = await deferredInstallPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredInstallPrompt(null);
  };

  const currentConfig = AI_PROVIDERS[selectedProvider];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
          
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-400 p-0.5 shadow-lg shadow-purple-900/30 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg sm:text-xl tracking-tight text-white font-heading">
                  KayBiT<span className="text-purple-400">_AIprompts</span>
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono font-semibold border border-purple-500/30 hidden sm:inline">
                  v2.4
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">Advanced Computer Science Prompting & 19-Lang Studio</p>
            </div>
          </div>

          {/* Component Switcher Tabs */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 shadow-inner">
            <button
              onClick={() => setActiveTab('general')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition ${
                activeTab === 'general'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Cpu className="w-4 h-4" />
              <span className="hidden md:inline">Comp 1:</span> General Agent
            </button>
            <button
              onClick={() => setActiveTab('curriculum')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition ${
                activeTab === 'curriculum'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span className="hidden md:inline">Comp 2:</span> 19-Lang Curriculum
            </button>
          </div>

          {/* Right Actions: Provider, User Guide, Install, Status */}
          <div className="flex items-center gap-2">
            
            {/* AI Provider Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowProviderDropdown(!showProviderDropdown)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-850 text-slate-200 text-xs rounded-lg border border-slate-800 transition"
                title="Select active AI Assistant Engine"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-medium hidden sm:inline">{selectedProvider}</span>
                <span className="font-medium sm:hidden">{selectedProvider.split(' ')[0]}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showProviderDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-2 z-50 text-xs">
                  <div className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Select AI Service Engine
                  </div>
                  {(Object.keys(AI_PROVIDERS) as AIAgentProvider[]).map((provKey) => {
                    const prov = AI_PROVIDERS[provKey];
                    const isSelected = selectedProvider === provKey;
                    return (
                      <button
                        key={provKey}
                        onClick={() => {
                          setSelectedProvider(provKey);
                          setShowProviderDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-2 flex items-center justify-between transition ${
                          isSelected ? 'bg-purple-600/20 text-purple-300 font-semibold' : 'text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <div>
                          <div className="font-medium text-white">{prov.name}</div>
                          <div className="text-[10px] text-slate-400">{prov.models[0]?.name}</div>
                        </div>
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* User Guide Button */}
            <button
              onClick={onOpenUserGuide}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-medium rounded-lg border border-slate-800 transition"
              title="Open Comprehensive User Guide (USER_GUIDE.md)"
            >
              <BookOpen className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden sm:inline">User Guide</span>
            </button>

            {/* Native Installation Guide Button */}
            <button
              onClick={onOpenInstallationGuide}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-medium rounded-lg border border-slate-800 transition"
              title="Native Apps Packaging (Android APK, Windows .exe, macOS .dmg, Capacitor, Tauri)"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden md:inline">Install Native</span>
            </button>

            {/* PWA In-App Install Button */}
            {deferredInstallPrompt && !isInstalled && (
              <button
                onClick={handleInstallPWA}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium rounded-lg transition shadow-sm"
                title="Install PWA onto desktop or mobile device"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Install App</span>
              </button>
            )}

            {/* Network / Offline Pill */}
            <div
              className={`p-1.5 rounded-lg text-xs ${
                isOnline ? 'text-slate-400' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}
              title={isOnline ? 'Online mode active' : 'Offline mode active (Local Cache)'}
            >
              {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
