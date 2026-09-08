import React, { useState, useEffect, useRef } from 'react';
import { 
  Download, 
  FileCode, 
  FileText, 
  Globe, 
  X, 
  Check, 
  Layers, 
  ChevronUp,
  FileArchive,
  Sparkles
} from 'lucide-react';
import { CurriculumDocument, BreadcrumbItem } from '../types';
import { 
  exportCurriculumAsJson, 
  exportCurriculumAsMarkdown, 
  exportCurriculumAsHtml 
} from '../services/curriculumExporters';
import { SUPPORTED_LANGUAGES } from '../services/aiGateway';

interface CurriculumFloatingExportMenuProps {
  document: CurriculumDocument | null;
  currentLang?: string;
  breadcrumbs?: BreadcrumbItem[];
  onExportPdf?: (lang: string) => void;
  onExportZip?: () => void;
}

export const CurriculumFloatingExportMenu: React.FC<CurriculumFloatingExportMenuProps> = ({
  document: doc,
  currentLang = 'en',
  breadcrumbs = [],
  onExportPdf,
  onExportZip
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [lastExported, setLastExported] = useState<{ name: string; format: string } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      window.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!doc) return null;

  const currentLangInfo = SUPPORTED_LANGUAGES.find((l) => l.code === currentLang) || SUPPORTED_LANGUAGES[0];

  const handleExport = (format: 'json' | 'markdown' | 'html' | 'pdf' | 'zip') => {
    if (!doc) return;

    try {
      let filename = '';
      if (format === 'json') {
        filename = exportCurriculumAsJson(doc);
      } else if (format === 'markdown') {
        filename = exportCurriculumAsMarkdown(doc, currentLang, breadcrumbs);
      } else if (format === 'html') {
        filename = exportCurriculumAsHtml(doc, currentLang, breadcrumbs);
      } else if (format === 'pdf' && onExportPdf) {
        onExportPdf(currentLang);
        filename = `${doc.subject}_${currentLang}.pdf`;
      } else if (format === 'zip' && onExportZip) {
        onExportZip();
        filename = `${doc.subject}_bundle.zip`;
      }

      setLastExported({ name: filename, format: format.toUpperCase() });
      setTimeout(() => setLastExported(null), 4500);
      setIsOpen(false);
    } catch (err: any) {
      console.error('Export error:', err);
    }
  };

  return (
    <div ref={menuRef} className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
      {/* Toast Notification upon Export */}
      {lastExported && (
        <div className="mb-3 px-3.5 py-2 rounded-xl bg-slate-900/95 border border-emerald-500/40 text-emerald-300 text-xs shadow-2xl flex items-center gap-2 backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
            <Check className="w-3 h-3 text-emerald-400" />
          </div>
          <div>
            <span className="font-semibold text-white">{lastExported.format} Exported:</span>{' '}
            <span className="font-mono text-[11px] text-emerald-200">{lastExported.name}</span>
          </div>
        </div>
      )}

      {/* Floating Action Menu Popover */}
      {isOpen && (
        <div className="mb-3 w-80 sm:w-88 rounded-2xl bg-slate-900/95 border border-purple-500/30 shadow-2xl shadow-purple-950/80 backdrop-blur-xl p-4 text-slate-200 space-y-3 animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
                <Download className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-semibold text-xs text-white">Export Curriculum</h4>
                <p className="text-[10px] text-slate-400 truncate max-w-[170px]">
                  {doc.title}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Close menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Target Language Note */}
          <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-950/60 border border-slate-800 text-[11px]">
            <span className="text-slate-400">Export Language:</span>
            <span className="font-medium text-purple-300 flex items-center gap-1">
              <Globe className="w-3 h-3" /> {currentLangInfo.name} ({currentLang.toUpperCase()})
            </span>
          </div>

          {/* Primary 3 Export Options: JSON, Markdown, HTML */}
          <div className="space-y-1.5 pt-1">
            {/* 1. Export JSON */}
            <button
              onClick={() => handleExport('json')}
              className="w-full text-left p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-amber-500/50 transition group flex items-start gap-3"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-105 transition shrink-0 mt-0.5">
                <FileCode className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white group-hover:text-amber-300 transition">
                    JSON Data File
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 font-semibold">
                    .json
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                  Raw document object with all 19 translations & chapter prompts
                </p>
              </div>
            </button>

            {/* 2. Export Markdown */}
            <button
              onClick={() => handleExport('markdown')}
              className="w-full text-left p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-sky-500/50 transition group flex items-start gap-3"
            >
              <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 group-hover:scale-105 transition shrink-0 mt-0.5">
                <FileText className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white group-hover:text-sky-300 transition">
                    Markdown Document
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-500/15 text-sky-300 font-semibold">
                    .md
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                  Formatted GitHub-flavored document with TOC & code blocks
                </p>
              </div>
            </button>

            {/* 3. Export HTML */}
            <button
              onClick={() => handleExport('html')}
              className="w-full text-left p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-emerald-500/50 transition group flex items-start gap-3"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition shrink-0 mt-0.5">
                <Globe className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white group-hover:text-emerald-300 transition">
                    Standalone HTML File
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 font-semibold">
                    .html
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                  Self-contained interactive page with copy buttons & sticky nav
                </p>
              </div>
            </button>
          </div>

          {/* Secondary Options: PDF & ZIP */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            {onExportPdf && (
              <button
                onClick={() => handleExport('pdf')}
                className="hover:text-purple-300 transition flex items-center gap-1"
              >
                <FileText className="w-3 h-3 text-rose-400" /> Export PDF
              </button>
            )}
            {onExportZip && (
              <button
                onClick={() => handleExport('zip')}
                className="hover:text-purple-300 transition flex items-center gap-1"
              >
                <FileArchive className="w-3 h-3 text-amber-400" /> Full ZIP Archive
              </button>
            )}
          </div>
        </div>
      )}

      {/* Primary Floating Action Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={`group flex items-center gap-2.5 px-4 py-3 rounded-full text-white font-semibold text-xs sm:text-sm shadow-2xl transition-all duration-200 border ${
          isOpen
            ? 'bg-slate-900 border-purple-400 text-purple-300 shadow-purple-900/50'
            : 'bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 border-purple-400/40 shadow-purple-950/70 hover:shadow-purple-700/40 hover:scale-102'
        }`}
        title="Open curriculum export menu (JSON, Markdown, HTML)"
      >
        <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
          {isOpen ? (
            <X className="w-3.5 h-3.5 text-white" />
          ) : (
            <Download className="w-3.5 h-3.5 text-white group-hover:translate-y-0.5 transition-transform" />
          )}
        </div>
        <span>{isOpen ? 'Close Exporter' : 'Export Document'}</span>
        <span className="hidden sm:inline-block text-[10px] font-mono px-2 py-0.5 rounded-full bg-black/20 text-purple-200 border border-white/10">
          JSON • MD • HTML
        </span>
      </button>
    </div>
  );
};
