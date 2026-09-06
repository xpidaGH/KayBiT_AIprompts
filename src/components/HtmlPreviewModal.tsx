import React, { useState, useMemo } from 'react';
import { X, Globe, Download, Copy, Code, Eye, ExternalLink, Check, Search, Filter } from 'lucide-react';
import { CurriculumDocument, BreadcrumbItem } from '../types';
import { generateLanguageHtmlDocument } from '../services/htmlGenerator';
import { SUPPORTED_LANGUAGES } from '../services/aiGateway';

interface HtmlPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: CurriculumDocument | null;
  allBreadcrumbs: BreadcrumbItem[];
  initialLang?: string;
}

export const HtmlPreviewModal: React.FC<HtmlPreviewModalProps> = ({
  isOpen,
  onClose,
  document,
  allBreadcrumbs,
  initialLang = 'en'
}) => {
  const [currentLang, setCurrentLang] = useState<string>(initialLang);
  const [viewMode, setViewMode] = useState<'preview' | 'source'>('preview');
  const [copiedSource, setCopiedSource] = useState(false);
  const [filterCategory, setFilterCategory] = useState<'all' | 'un' | 'european' | 'asian_indic' | 'rtl'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Sync initial language if opened with a specific language
  React.useEffect(() => {
    if (initialLang) {
      setCurrentLang(initialLang);
    }
  }, [initialLang, isOpen]);

  const currentLanguageInfo = useMemo(() => {
    return SUPPORTED_LANGUAGES.find(l => l.code === currentLang) || SUPPORTED_LANGUAGES[0];
  }, [currentLang]);

  const filteredLanguages = useMemo(() => {
    return SUPPORTED_LANGUAGES.filter(lang => {
      if (filterCategory === 'un' && !['en', 'fr', 'es', 'ru', 'zh', 'ar'].includes(lang.code)) {
        return false;
      }
      if (filterCategory === 'european' && !['en', 'fr', 'de', 'it', 'es', 'pt', 'ru', 'tr'].includes(lang.code)) {
        return false;
      }
      if (filterCategory === 'asian_indic' && !['en', 'zh', 'ja', 'hi', 'ur', 'bn', 'mr', 'ta', 'te', 'id'].includes(lang.code)) {
        return false;
      }
      if (filterCategory === 'rtl' && !['ar', 'ur'].includes(lang.code)) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return lang.code.toLowerCase().includes(q) ||
               lang.name.toLowerCase().includes(q) ||
               lang.native.toLowerCase().includes(q);
      }
      return true;
    });
  }, [filterCategory, searchQuery]);

  const generatedHtml = useMemo(() => {
    if (!document) return '';
    return generateLanguageHtmlDocument(document, currentLang, allBreadcrumbs);
  }, [document, currentLang, allBreadcrumbs]);

  if (!isOpen || !document) return null;

  const handleDownloadSingle = () => {
    const filename = `${document.subject}_${currentLang}.html`;
    const blob = new Blob([generatedHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopySource = () => {
    navigator.clipboard.writeText(generatedHtml);
    setCopiedSource(true);
    setTimeout(() => setCopiedSource(false), 2000);
  };

  const handleOpenNewTab = () => {
    const newWindow = window.open();
    if (newWindow) {
      newWindow.document.write(generatedHtml);
      newWindow.document.close();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-6xl h-[94vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Top Control Bar */}
        <div className="flex flex-wrap items-center justify-between px-4 sm:px-6 py-3 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 border border-purple-500/20 rounded-lg text-purple-400">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-wide">
                  {document.subject}_{currentLang}.html
                </h2>
                <span className="text-xs px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono">
                  {currentLanguageInfo.native} ({currentLanguageInfo.name})
                </span>
                {currentLanguageInfo.dir === 'rtl' && (
                  <span className="text-xs px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">RTL</span>
                )}
              </div>
              <p className="text-xs text-slate-400 truncate max-w-md">{document.title}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-2 sm:mt-0">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700 text-xs">
              <button
                onClick={() => setViewMode('preview')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition ${viewMode === 'preview' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
              >
                <Eye className="w-3.5 h-3.5" /> Rendered
              </button>
              <button
                onClick={() => setViewMode('source')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition ${viewMode === 'source' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
              >
                <Code className="w-3.5 h-3.5" /> HTML Code
              </button>
            </div>

            <button
              onClick={handleCopySource}
              className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg border border-slate-700 transition"
              title="Copy raw HTML"
            >
              {copiedSource ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedSource ? 'Copied' : 'Copy HTML'}
            </button>

            <button
              onClick={handleDownloadSingle}
              className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium rounded-lg transition shadow"
              title="Download HTML file"
            >
              <Download className="w-3.5 h-3.5" /> Download
            </button>

            <button
              onClick={handleOpenNewTab}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
              title="Open in new window"
            >
              <ExternalLink className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 19-Language Switcher Ribbon with Filtering */}
        <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-thin">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap flex items-center gap-1 mr-1">
              <Filter className="w-3 h-3 text-purple-400" /> Filter:
            </span>
            {(['all', 'un', 'european', 'asian_indic', 'rtl'] as const).map((cat) => {
              const labels: Record<string, string> = {
                all: 'All 19',
                un: 'UN (6)',
                european: 'European (8)',
                asian_indic: 'Asian & Indic (10)',
                rtl: 'RTL (2)'
              };
              const isActive = filterCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-2 py-0.5 rounded-full text-[11px] transition whitespace-nowrap ${
                    isActive
                      ? 'bg-purple-600 text-white font-semibold'
                      : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700/50'
                  }`}
                >
                  {labels[cat]}
                </button>
              );
            })}
          </div>

          <div className="relative">
            <Search className="w-3 h-3 text-slate-500 absolute left-2 top-1.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search language..."
              className="pl-6 pr-6 py-0.5 bg-slate-950 border border-slate-800 rounded text-[11px] text-slate-300 placeholder-slate-500 focus:border-purple-500 focus:outline-none w-28 sm:w-36"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-1 top-1 text-slate-500 hover:text-slate-300"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Filtered Language Tabs */}
        <div className="px-4 py-1.5 bg-slate-900/60 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto text-xs scrollbar-thin">
          {filteredLanguages.length === 0 ? (
            <div className="text-[11px] text-slate-500 italic py-0.5">
              No languages match current filter.
            </div>
          ) : (
            filteredLanguages.map((lang) => {
              const isCurrent = lang.code === currentLang;
              return (
                <button
                  key={lang.code}
                  onClick={() => setCurrentLang(lang.code)}
                  title={`${lang.native} (${lang.name})`}
                  className={`px-2.5 py-1 rounded-md text-xs font-mono transition whitespace-nowrap flex items-center gap-1 ${
                    isCurrent
                      ? 'bg-purple-600 text-white font-bold shadow-sm'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/50'
                  }`}
                >
                  <span>{lang.code.toUpperCase()}</span>
                  <span className="text-[10px] opacity-75 font-sans hidden sm:inline">
                    {lang.code === 'zh' ? '中文' : lang.code === 'ja' ? '日本語' : lang.code === 'ar' ? 'العربية' : lang.code === 'ur' ? 'اردو' : lang.code === 'hi' ? 'हिन्दी' : lang.code === 'bn' ? 'বাংলা' : lang.native.slice(0, 5)}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Body Area */}
        <div className="flex-1 overflow-hidden bg-slate-950 relative">
          {viewMode === 'preview' ? (
            <iframe
              title={`Preview of ${document.subject}_${currentLang}.html`}
              srcDoc={generatedHtml}
              sandbox="allow-scripts allow-same-origin"
              className="w-full h-full border-none bg-white"
            />
          ) : (
            <div className="w-full h-full overflow-auto p-4 font-mono text-xs text-slate-300 leading-relaxed bg-slate-950">
              <pre className="whitespace-pre-wrap">{generatedHtml}</pre>
            </div>
          )}
        </div>

        {/* Bottom Status Bar */}
        <div className="px-6 py-2.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <span>Chapters: {document.chapters.length}</span>
            <span>•</span>
            <span>Encoding: UTF-8</span>
            <span>•</span>
            <span>Direction: {currentLanguageInfo.dir.toUpperCase()}</span>
            <span>•</span>
            <span className="text-emerald-400">Interactive Copy Buttons Active</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
};
