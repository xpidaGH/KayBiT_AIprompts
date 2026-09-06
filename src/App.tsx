import React, { useState } from 'react';
import { Header } from './components/Header';
import { SplashScreen } from './components/SplashScreen';
import { GeneralAgentComponent } from './components/GeneralAgentComponent';
import { CurriculumGeneratorComponent } from './components/CurriculumGeneratorComponent';
import { HtmlPreviewModal } from './components/HtmlPreviewModal';
import { UserGuideModal } from './components/UserGuideModal';
import { InstallationModal } from './components/InstallationModal';
import { AIAgentProvider, CurriculumDocument, BreadcrumbItem } from './types';
import { PRESET_CURRICULA } from './services/sampleCurricula';
import { USER_GUIDE_TEXT, INSTALLATION_GUIDE_TEXT } from './services/docsContent';

export default function App() {
  // Navigation & View State
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'general' | 'curriculum'>('general');
  const [selectedProvider, setSelectedProvider] = useState<AIAgentProvider>('Google AI Studio');

  // Cross-Component Messaging State
  const [transmittedPrompt, setTransmittedPrompt] = useState<string>('');
  const [curriculumTopicText, setCurriculumTopicText] = useState<string>('');

  // Modals State
  const [isUserGuideOpen, setIsUserGuideOpen] = useState<boolean>(false);
  const [isInstallationOpen, setIsInstallationOpen] = useState<boolean>(false);
  const [previewDoc, setPreviewDoc] = useState<CurriculumDocument | null>(null);
  const [previewLang, setPreviewLang] = useState<string>('en');

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

  const handleOpenPreviewModal = (doc: CurriculumDocument, lang: string = 'en') => {
    setPreviewDoc(doc);
    setPreviewLang(lang);
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
        />

        {/* Global Modals on Splash Screen */}
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
        onOpenUserGuide={() => setIsUserGuideOpen(true)}
        onOpenInstallationGuide={() => setIsInstallationOpen(true)}
      />

      {/* Main Studio Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'general' ? (
          <GeneralAgentComponent
            selectedProvider={selectedProvider}
            setSelectedProvider={setSelectedProvider}
            onSendToCurriculum={handleSendFromAgentToCurriculum}
            initialPrompt={transmittedPrompt}
          />
        ) : (
          <CurriculumGeneratorComponent
            onTransmitToAgent={handleTransmitFromCurriculumToAgent}
            onOpenPreview={handleOpenPreviewModal}
            incomingTopicText={curriculumTopicText}
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
          </div>
          <div className="text-slate-400">
            For Advanced CS Students (Python, JS/TS, Rust, Go, Java, C#, C++, SQL, R, Flutter, etc.)
          </div>
        </div>
      </footer>

      {/* Modals */}
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
    </div>
  );
}
