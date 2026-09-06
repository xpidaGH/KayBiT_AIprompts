import React from 'react';
import { 
  Sparkles, 
  Cpu, 
  Layers, 
  BookOpen, 
  Download, 
  ArrowRight, 
  CheckCircle2, 
  Globe, 
  ShieldCheck,
  Code2
} from 'lucide-react';
import { AIAgentProvider } from '../types';

interface SplashScreenProps {
  onEnterApp: (tab?: 'general' | 'curriculum') => void;
  onOpenUserGuide: () => void;
  onOpenInstallationGuide: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onEnterApp,
  onOpenUserGuide,
  onOpenInstallationGuide
}) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-8 relative overflow-hidden">
      {/* Subtle Background Glow Elements */}
      <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[20%] w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Bar */}
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-400 p-0.5 shadow-lg shadow-purple-900/40 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-purple-400" />
            </div>
          </div>
          <span className="font-bold text-lg text-white font-heading">
            KayBiT<span className="text-purple-400">_AIprompts</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* User Guide Button on Splash Screen */}
          <button
            onClick={onOpenUserGuide}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700/80 transition shadow-sm"
          >
            <BookOpen className="w-3.5 h-3.5 text-purple-400" />
            <span>User Guide</span>
          </button>

          {/* Installation Guide Button on Splash Screen */}
          <button
            onClick={onOpenInstallationGuide}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700/80 transition shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Install Native</span>
          </button>
        </div>
      </div>

      {/* Hero Content */}
      <div className="max-w-5xl w-full mx-auto text-center my-auto py-8 sm:py-12 z-10 space-y-6">
        
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-medium">
          <Sparkles className="w-3.5 h-3.5" />
          <span>All-in-One Cross-Platform Engineering Suite</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight">
          Next-Gen AI Prompting & <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-300 to-cyan-400">
            19-Language Curriculum Studio
          </span>
        </h1>

        {/* Subtitle */}
        <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-300 leading-relaxed font-sans">
          Built for advanced computer science students mastering 20 programming languages.
          Interface directly with leading AI coding assistants or transform syllabi into linked HTML documents with clickable copy buttons in 19 languages.
        </p>

        {/* Two Core Components Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 text-left pt-6 max-w-4xl mx-auto">
          
          {/* Card 1: Component 1 */}
          <div 
            onClick={() => onEnterApp('general')}
            className="group p-6 rounded-2xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-purple-500/40 cursor-pointer transition shadow-xl space-y-3 relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                <Cpu className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono">
                Component 1
              </span>
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition">
              General AI Assistant & Transmitter
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Transmit prompts, test attachments, and query Claude Code, Cursor, Copilot, Google AI Studio, and Windsurf with code syntax and real-time execution.
            </p>
            <div className="pt-2 flex items-center gap-1 text-xs font-semibold text-purple-400 group-hover:translate-x-1 transition">
              <span>Open General Agent</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 2: Component 2 */}
          <div 
            onClick={() => onEnterApp('curriculum')}
            className="group p-6 rounded-2xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/40 cursor-pointer transition shadow-xl space-y-3 relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                <Layers className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono">
                Component 2
              </span>
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition">
              Topics, Objectives & 19-Language HTML
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Generate structured chapters from Topics/Objectives outlines with ready-to-copy prompts in 19 languages, linked HTML documents, and breadcrumb navigation.
            </p>
            <div className="pt-2 flex items-center gap-1 text-xs font-semibold text-cyan-400 group-hover:translate-x-1 transition">
              <span>Open Curriculum Generator</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

        </div>

        {/* Launch Button & Secondary Guide */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => onEnterApp('general')}
            className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm transition shadow-lg shadow-purple-900/30 flex items-center justify-center gap-2"
          >
            <span>Launch KayBiT Studio</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenUserGuide}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold text-sm border border-slate-800 transition flex items-center justify-center gap-2"
          >
            <BookOpen className="w-4 h-4 text-purple-400" />
            <span>Read User Guide</span>
          </button>
        </div>

      </div>

      {/* Footer Info */}
      <div className="max-w-6xl w-full mx-auto flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 border-t border-slate-800/60 pt-4 z-10 gap-2">
        <div className="flex items-center gap-4">
          <span>KayBiT Byte Technologies</span>
          <span>•</span>
          <span>19 Languages (EN, FR, DE, ES, ZH, JA, AR, HI, etc.)</span>
          <span>•</span>
          <span>PWA & Offline Ready</span>
        </div>
        <div>
          <span>Cross-Platform Web, Desktop & Mobile</span>
        </div>
      </div>
    </div>
  );
};
