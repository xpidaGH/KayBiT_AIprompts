import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { SplashScreen } from './components/SplashScreen';
import { GeneralAgentComponent } from './components/GeneralAgentComponent';
import { CurriculumGeneratorComponent } from './components/CurriculumGeneratorComponent';
import { HtmlPreviewModal } from './components/HtmlPreviewModal';
import { UserGuideModal } from './components/UserGuideModal';
import { InstallationModal } from './components/InstallationModal';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { ThemeSettingsModal } from './components/ThemeSettingsModal';
import { AIAgentProvider, CurriculumDocument, BreadcrumbItem } from './types';
import { PRESET_CURRICULA } from './services/sampleCurricula';
import { USER_GUIDE_TEXT, INSTALLATION_GUIDE_TEXT } from './services/docsContent';
import { getStoredLanguage, setStoredLanguage } from './services/i18n';
import { ThemeId, getStoredTheme, applyTheme } from './data/themes';

export default function App() {
  // Navigation & View State
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'general' | 'curriculum'>('general');
  const [selectedProvider, setSelectedProvider] = useState<AIAgentProvider>('Google AI Studio');

  // Persistent Global UI Language (Synchronized across all components)
  const [uiLanguage, setUiLanguageState] = useState<string>(() => getStoredLanguage());

  const handleSetUiLanguage = (lang: string) => {
    setUiLanguageState(lang);
    setStoredLanguage(lang);
  };

  // Cross-Component Messaging State
  const [transmittedPrompt, setTransmittedPrompt] = useState<string>('');
  const [curriculumTopicText, setCurriculumTopicText] = useState<string>('');

  // Persistent UI Theme
  const [currentTheme, setCurrentTheme] = useState<ThemeId>(() => getStoredTheme());
  const [isThemeModalOpen, setIsThemeModalOpen] = useState<boolean>(false);

  useEffect(() => {
    applyTheme(currentTheme);
  }, [currentTheme]);

  // Modals State
  const [isUserGuideOpen, setIsUserGuideOpen] = useState<boolean>(false);
  const [isInstallationOpen, setIsInstallationOpen] = useState<boolean>(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState<boolean>(false);
  const [previewDoc, setPreviewDoc] = useState<CurriculumDocument | null>(null);
  const [previewLang, setPreviewLang] = useState<string>(() => getStoredLanguage());

  // Master Breadcrumb List across Curricula
  const masterBreadcrumbs: BreadcrumbItem[] = PRESET_CURRICULA.map(c => ({
    id: c.id,
    subject: c.subject,
    title: c.title,
    label: c.subject,
    href: `${c.subject}_en.html`
  }));

  // Handlers for cross-component routing
  const handleTransmitFromCurriculumToAgent = (promptText: string) => {
    setTransmittedPrompt(promptText);
    setActiveTab('general');
    setShowSplash(false);
  };

  const handleSendFromAgentToCurriculum = (topicText: string) => {
    setCurriculumTopicText(topicText);
    setActiveTab('curriculum');
    setShowSplash(false);
  };

  const handleOpenPreviewModal = (doc: CurriculumDocument, lang?: string) => {
    setPreviewDoc(doc);
    setPreviewLang(lang || uiLanguage);
  };

  // Synchronize previewLang when uiLanguage changes
  useEffect(() => {
    setPreviewLang(uiLanguage);
  }, [uiLanguage]);

  // Global Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target && (
        target.tagName === 'INPUT' || 
        target.tagName === 'TEXTAREA' || 
        target.isContentEditable
      );

      // Escape key closes any open modal immediately
      if (e.key === 'Escape') {
        if (isThemeModalOpen) { setIsThemeModalOpen(false); return; }
        if (isShortcutsOpen) { setIsShortcutsOpen(false); return; }
        if (isUserGuideOpen) { setIsUserGuideOpen(false); return; }
        if (isInstallationOpen) { setIsInstallationOpen(false); return; }
        if (previewDoc) { setPreviewDoc(null); return; }
      }

      // Modifier-based global shortcuts
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowSplash(false);
        setActiveTab('general');
        const promptArea = document.querySelector('textarea') as HTMLTextAreaElement | null;
        if (promptArea) {
          promptArea.focus();
          promptArea.select();
        }
        return;
      }

      if ((e.ctrlKey || e.metaKey || e.altKey) && e.key === '1') {
        e.preventDefault();
        setShowSplash(false);
        setActiveTab('general');
        return;
      }

      if ((e.ctrlKey || e.metaKey || e.altKey) && e.key === '2') {
        e.preventDefault();
        setShowSplash(false);
        setActiveTab('curriculum');
        return;
      }

      if (e.altKey && (e.key === 'm' || e.key === 'M')) {
        e.preventDefault();
        setIsThemeModalOpen(prev => !prev);
        return;
      }

      // Single-key navigation shortcuts (disabled while typing in text inputs)
      if (!isInput && !e.ctrlKey && !e.metaKey && !e.altKey) {
        if (e.key === '?' || (e.shiftKey && e.key === '/')) {
          e.preventDefault();
          setIsShortcutsOpen(prev => !prev);
          return;
        }
        if (e.key === '1') {
          e.preventDefault();
          setShowSplash(false);
          setActiveTab('general');
          return;
        }
        if (e.key === '2') {
          e.preventDefault();
          setShowSplash(false);
          setActiveTab('curriculum');
          return;
        }
        if (e.key === 'h' || e.key === 'H') {
          e.preventDefault();
          setShowSplash(true);
          return;
        }
        if (e.key === 'u' || e.key === 'U') {
          e.preventDefault();
          setIsUserGuideOpen(true);
          return;
        }
        if (e.key === 'i' || e.key === 'I') {
          e.preventDefault();
          setIsInstallationOpen(true);
          return;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isShortcutsOpen, isUserGuideOpen, isInstallationOpen, previewDoc]);

  // Execute shortcut action directly from the modal trigger
  const handleTriggerShortcutAction = (shortcutId: string) => {
    switch (shortcutId) {
      case 'nav-agent':
        setShowSplash(false);
        setActiveTab('general');
        break;
      case 'nav-curriculum':
        setShowSplash(false);
        setActiveTab('curriculum');
        break;
      case 'nav-splash':
        setShowSplash(true);
        break;
      case 'studio-user-guide':
        setIsUserGuideOpen(true);
        break;
      case 'studio-install-guide':
        setIsInstallationOpen(true);
        break;
      case 'curr-preview':
        if (PRESET_CURRICULA.length > 0) {
          handleOpenPreviewModal(PRESET_CURRICULA[0]);
        }
        break;
      case 'agent-focus-prompt':
        setShowSplash(false);
        setActiveTab('general');
        setTimeout(() => {
          const area = document.querySelector('textarea') as HTMLTextAreaElement | null;
          if (area) area.focus();
        }, 100);
        break;
      case 'studio-theme':
        setIsThemeModalOpen(true);
        break;
      default:
        break;
    }
  };

  // If on splash screen, display it with options to enter Component 1 or 2
  if (showSplash) {
    return (
      <div className="min-h-screen bg-slate-950 font-sans selection:bg-purple-500 selection:text-white">
        <SplashScreen
          onEnterApp={(tab) => {
            if (tab) setActiveTab(tab);
            setShowSplash(false);
          }}
          onOpenUserGuide={() => setIsUserGuideOpen(true)}
          onOpenInstallationGuide={() => setIsInstallationOpen(true)}
          onOpenShortcuts={() => setIsShortcutsOpen(true)}
        />

        {/* Global Modals on Splash Screen */}
        <KeyboardShortcutsModal
          isOpen={isShortcutsOpen}
          onClose={() => setIsShortcutsOpen(false)}
          onTriggerAction={handleTriggerShortcutAction}
        />

        <UserGuideModal
          isOpen={isUserGuideOpen}
          onClose={() => setIsUserGuideOpen(false)}
          guideContent={USER_GUIDE_TEXT}
        />

        <InstallationModal
          isOpen={isInstallationOpen}
          onClose={() => setIsInstallationOpen(false)}
          installationContent={INSTALLATION_GUIDE_TEXT}
        />

        <ThemeSettingsModal
          isOpen={isThemeModalOpen}
          onClose={() => setIsThemeModalOpen(false)}
          currentTheme={currentTheme}
          onSelectTheme={setCurrentTheme}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-purple-500 selection:text-white">
      {/* Persistent Global Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedProvider={selectedProvider}
        setSelectedProvider={setSelectedProvider}
        uiLanguage={uiLanguage}
        setUiLanguage={handleSetUiLanguage}
        onOpenUserGuide={() => setIsUserGuideOpen(true)}
        onOpenInstallationGuide={() => setIsInstallationOpen(true)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onOpenThemeSettings={() => setIsThemeModalOpen(true)}
        onOpenSplash={() => setShowSplash(true)}
      />

      {/* Main Studio Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'general' ? (
          <GeneralAgentComponent
            selectedProvider={selectedProvider}
            setSelectedProvider={setSelectedProvider}
            onSendToCurriculum={handleSendFromAgentToCurriculum}
            initialPrompt={transmittedPrompt}
            uiLanguage={uiLanguage}
            setUiLanguage={handleSetUiLanguage}
          />
        ) : (
          <CurriculumGeneratorComponent
            onTransmitToAgent={handleTransmitFromCurriculumToAgent}
            onOpenPreview={handleOpenPreviewModal}
            incomingTopicText={curriculumTopicText}
            uiLanguage={uiLanguage}
            setUiLanguage={handleSetUiLanguage}
          />
        )}
      </main>

      {/* Global Footer */}
      <footer className="border-t border-slate-800 bg-slate-950/80 py-4 px-4 sm:px-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSplash(true)}
              className="font-bold text-slate-300 hover:text-purple-400 transition"
            >
              KayBiT_AIprompts
            </button>
            <span>•</span>
            <span>19 Languages Linked HTML Generator</span>
            <span>•</span>
            <button
              onClick={() => setIsShortcutsOpen(true)}
              className="text-amber-400 hover:underline flex items-center gap-1"
            >
              <span>Shortcuts</span>
              <kbd className="px-1 py-0.2 rounded bg-slate-900 border border-slate-800 text-[10px] text-amber-300 font-mono">?</kbd>
            </button>
            <span>•</span>
            <button
              onClick={() => setIsUserGuideOpen(true)}
              className="text-purple-400 hover:underline"
            >
              User Guide
            </button>
            <span>•</span>
            <button
              onClick={() => setIsInstallationOpen(true)}
              className="text-cyan-400 hover:underline"
            >
              Native Packages
            </button>
            <span>•</span>
            <button
              onClick={() => setIsThemeModalOpen(true)}
              className="text-pink-400 hover:underline flex items-center gap-1"
            >
              <span>Themes</span>
            </button>
          </div>
          <div className="text-slate-400">
            For Advanced CS Students (Python, JS/TS, Rust, Go, Java, C#, C++, SQL, R, Flutter, etc.)
          </div>
        </div>
      </footer>

      {/* Modals */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
        onTriggerAction={handleTriggerShortcutAction}
      />

      <HtmlPreviewModal
        isOpen={!!previewDoc}
        onClose={() => setPreviewDoc(null)}
        document={previewDoc}
        allBreadcrumbs={masterBreadcrumbs}
        initialLang={previewLang}
      />

      <UserGuideModal
        isOpen={isUserGuideOpen}
        onClose={() => setIsUserGuideOpen(false)}
        guideContent={USER_GUIDE_TEXT}
      />

      <InstallationModal
        isOpen={isInstallationOpen}
        onClose={() => setIsInstallationOpen(false)}
        installationContent={INSTALLATION_GUIDE_TEXT}
      />

      <ThemeSettingsModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
        currentTheme={currentTheme}
        onSelectTheme={setCurrentTheme}
      />
    </div>
  );
}
