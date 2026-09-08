import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Cpu, 
  BookOpen, 
  Download, 
  Wifi, 
  WifiOff, 
  Layers, 
  FileText,
  ChevronDown,
  Globe,
  Check,
  Search,
  Keyboard
} from 'lucide-react';
import { AIAgentProvider } from '../types';
import { AI_PROVIDERS, SUPPORTED_LANGUAGES } from '../services/aiGateway';
import { LANGUAGE_FLAGS, getUiTranslations } from '../services/i18n';
import { KaybitLogoIcon } from '../data';

interface HeaderProps {
  activeTab: 'general' | 'curriculum';
  setActiveTab: (tab: 'general' | 'curriculum') => void;
  selectedProvider: AIAgentProvider;
  setSelectedProvider: (provider: AIAgentProvider) => void;
  uiLanguage: string;
  setUiLanguage: (lang: string) => void;
  onOpenUserGuide: () => void;
  onOpenInstallationGuide: () => void;
  onOpenShortcuts: () => void;
  onOpenSplash?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  selectedProvider,
  setSelectedProvider,
  uiLanguage,
  setUiLanguage,
  onOpenUserGuide,
  onOpenInstallationGuide,
  onOpenShortcuts,
  onOpenSplash
}) => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [showProviderDropdown, setShowProviderDropdown] = useState<boolean>(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState<boolean>(false);
  const [langSearchQuery, setLangSearchQuery] = useState<string>('');
  const [langCategory, setLangCategory] = useState<'all' | 'un' | 'european' | 'asian_indic' | 'rtl'>('all');

  const providerRef = useRef<HTMLDivElement>(null);
  const languageRef = useRef<HTMLDivElement>(null);

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

    const handleClickOutside = (event: MouseEvent) => {
      if (providerRef.current && !providerRef.current.contains(event.target as Node)) {
        setShowProviderDropdown(false);
      }
      if (languageRef.current && !languageRef.current.contains(event.target as Node)) {
        setShowLanguageDropdown(false);
      }
    };

    window.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('mousedown', handleClickOutside);
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

  const currentLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === uiLanguage) || SUPPORTED_LANGUAGES[0];
  const currentFlag = LANGUAGE_FLAGS[uiLanguage] || '🌐';
  const t = getUiTranslations(uiLanguage);

  // Filter languages based on search query and category
  const filteredLanguages = SUPPORTED_LANGUAGES.filter((lang) => {
    const matchesSearch = 
      lang.name.toLowerCase().includes(langSearchQuery.toLowerCase()) ||
      lang.native.toLowerCase().includes(langSearchQuery.toLowerCase()) ||
      lang.code.toLowerCase().includes(langSearchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (langCategory === 'un') {
      return ['en', 'fr', 'es', 'ru', 'zh', 'ar'].includes(lang.code);
    }
    if (langCategory === 'european') {
      return ['en', 'fr', 'de', 'it', 'es', 'pt', 'ru', 'tr'].includes(lang.code);
    }
    if (langCategory === 'asian_indic') {
      return ['zh', 'ja', 'hi', 'mr', 'bn', 'ta', 'te', 'id'].includes(lang.code);
    }
    if (langCategory === 'rtl') {
      return lang.dir === 'rtl';
    }
    return true;
  });

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
          
          {/* Brand Logo & Name */}
          <div 
            onClick={onOpenSplash}
            className={`flex items-center gap-2.5 sm:gap-3 ${onOpenSplash ? 'cursor-pointer' : ''} group`}
            title="KayBiT AI Studio (Click to view Welcome Splash)"
          >
            <div className="relative">
              <KaybitLogoIcon size={38} className="shadow-md shadow-purple-950/40 rounded-xl transition transform group-hover:scale-105" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-cyan-400 rounded-full animate-ping opacity-75 pointer-events-none" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg sm:text-xl tracking-tight text-white font-heading group-hover:text-purple-300 transition">
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

          {/* Right Actions: Provider, Language, User Guide, Install, Status */}
          <div className="flex items-center gap-2">
            
            {/* Persistent Global Language Toggle Dropdown */}
            <div className="relative" ref={languageRef}>
              <button
                onClick={() => {
                  setShowLanguageDropdown(!showLanguageDropdown);
                  setShowProviderDropdown(false);
                }}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-slate-900 hover:bg-slate-850 text-slate-200 text-xs rounded-lg border border-slate-800 hover:border-purple-500/40 transition shadow-xs"
                title="Change global UI & Curriculum language (Persists to local storage & synchronizes all components)"
              >
                <Globe className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-xs">{currentFlag}</span>
                <span className="font-medium hidden md:inline">{currentLangObj?.native || currentLangObj?.name}</span>
                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-purple-950/80 text-purple-300 font-semibold border border-purple-800/40 uppercase">
                  {uiLanguage}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showLanguageDropdown && (
                <div className="absolute right-0 mt-2 w-72 sm:w-84 bg-slate-900 border border-purple-500/30 rounded-2xl shadow-2xl py-3 px-3 z-50 text-xs space-y-2.5 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                    <div className="flex items-center gap-1.5 text-white font-semibold">
                      <Globe className="w-3.5 h-3.5 text-purple-400" />
                      <span>Studio Language Preference</span>
                    </div>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      19 Langs
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-snug">
                    Synchronizes UI controls, speech dictation locale, and curriculum translation views across all components.
                  </p>

                  {/* Search Input */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      value={langSearchQuery}
                      onChange={(e) => setLangSearchQuery(e.target.value)}
                      placeholder="Search language (e.g., Spanish, es, 日本語)..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  {/* Quick Category Filter Pills */}
                  <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5">
                    {(
                      [
                        { id: 'all', label: 'All' },
                        { id: 'un', label: 'UN (6)' },
                        { id: 'european', label: 'Euro' },
                        { id: 'asian_indic', label: 'Asian/Indic' },
                        { id: 'rtl', label: 'RTL (2)' }
                      ] as const
                    ).map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setLangCategory(cat.id)}
                        className={`px-2 py-0.5 rounded text-[10px] font-medium whitespace-nowrap transition ${
                          langCategory === cat.id
                            ? 'bg-purple-600 text-white font-semibold'
                            : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  {/* Language Options List */}
                  <div className="max-h-60 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
                    {filteredLanguages.map((lang) => {
                      const isSelected = uiLanguage === lang.code;
                      const flag = LANGUAGE_FLAGS[lang.code] || '🌐';
                      return (
                        <button
                          key={lang.code}
                          onClick={() => {
                            setUiLanguage(lang.code);
                            setShowLanguageDropdown(false);
                          }}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between transition ${
                            isSelected
                              ? 'bg-purple-600/25 text-white border border-purple-500/40 font-semibold'
                              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-sm shrink-0">{flag}</span>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-medium truncate">{lang.native}</span>
                                {lang.native !== lang.name && (
                                  <span className="text-[10px] text-slate-400">({lang.name})</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {lang.dir === 'rtl' && (
                              <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono">
                                RTL
                              </span>
                            )}
                            <span className="font-mono text-[10px] text-slate-400 uppercase">
                              {lang.code}
                            </span>
                            {isSelected && (
                              <Check className="w-3.5 h-3.5 text-purple-400" />
                            )}
                          </div>
                        </button>
                      );
                    })}

                    {filteredLanguages.length === 0 && (
                      <div className="py-4 text-center text-xs text-slate-500">
                        No languages found matching "{langSearchQuery}"
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* AI Provider Selector Dropdown */}
            <div className="relative" ref={providerRef}>
              <button
                onClick={() => {
                  setShowProviderDropdown(!showProviderDropdown);
                  setShowLanguageDropdown(false);
                }}
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

            {/* Keyboard Shortcuts Button */}
            <button
              onClick={onOpenShortcuts}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-medium rounded-lg border border-slate-800 hover:border-amber-500/40 transition group"
              title="View Global Keyboard Shortcuts (?)"
              aria-label="View Keyboard Shortcuts"
            >
              <Keyboard className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-12 transition-transform" />
              <span className="hidden lg:inline">Shortcuts</span>
              <kbd className="hidden sm:inline-block px-1 py-0.2 rounded bg-slate-950 border border-slate-700 font-mono text-[9px] text-amber-300">
                ?
              </kbd>
            </button>

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
