import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  X, 
  Globe, 
  Download, 
  Copy, 
  Code, 
  Eye, 
  ExternalLink, 
  Check, 
  Search, 
  Filter, 
  FileText, 
  ChevronDown, 
  Terminal,
  Sparkles,
  Volume2,
  VolumeX
} from 'lucide-react';
import { CurriculumDocument, BreadcrumbItem } from '../types';
import { 
  generateLanguageHtmlDocument, 
  generateCurriculumIdeContent, 
  generateCurriculumPromptsOnly 
} from '../services/htmlGenerator';
import { SUPPORTED_LANGUAGES } from '../services/aiGateway';
import { PrismCodeBlock } from './PrismCodeBlock';
import { CurriculumTtsPlayer } from './CurriculumTtsPlayer';

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
  const [viewMode, setViewMode] = useState<'preview' | 'ide' | 'source'>('preview');
  const [copiedFormat, setCopiedFormat] = useState<'ide' | 'html' | 'prompts' | null>(null);
  const [showCopyMenu, setShowCopyMenu] = useState<boolean>(false);
  const [copyFeedback, setCopyFeedback] = useState<{ text: string; details?: string } | null>(null);
  const [showTtsPlayer, setShowTtsPlayer] = useState<boolean>(false);
  const [filterCategory, setFilterCategory] = useState<'all' | 'un' | 'european' | 'asian_indic' | 'rtl'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const copyMenuRef = useRef<HTMLDivElement>(null);

  // Stop speech when modal is closed or unmounted
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isOpen]);

  // Close copy menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (copyMenuRef.current && !copyMenuRef.current.contains(e.target as Node)) {
        setShowCopyMenu(false);
      }
    };
    if (showCopyMenu) {
      window.addEventListener('mousedown', handleClickOutside);
    }
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, [showCopyMenu]);

  // Sync initial language if opened with a specific language
  useEffect(() => {
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

  const ideContent = useMemo(() => {
    if (!document) return '';
    return generateCurriculumIdeContent(document, currentLang);
  }, [document, currentLang]);

  const promptsOnlyContent = useMemo(() => {
    if (!document) return '';
    return generateCurriculumPromptsOnly(document);
  }, [document]);

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

  const handleCopyToClipboard = async (format: 'ide' | 'html' | 'prompts') => {
    let contentToCopy = '';
    let formatLabel = '';

    if (format === 'ide') {
      contentToCopy = ideContent;
      formatLabel = 'IDE Markdown';
    } else if (format === 'html') {
      contentToCopy = generatedHtml;
      formatLabel = 'HTML Source';
    } else {
      contentToCopy = promptsOnlyContent;
      formatLabel = 'AI Prompts';
    }

    try {
      await navigator.clipboard.writeText(contentToCopy);
      setCopiedFormat(format);
      setShowCopyMenu(false);
      setCopyFeedback({
        text: `Copied ${formatLabel} to Clipboard!`,
        details: `${contentToCopy.length.toLocaleString()} chars, ${document.chapters.length} chapters`
      });

      setTimeout(() => {
        setCopiedFormat(null);
        setCopyFeedback(null);
      }, 2500);
    } catch {
      // Fallback
      const textArea = window.document.createElement('textarea');
      textArea.value = contentToCopy;
      window.document.body.appendChild(textArea);
      textArea.select();
      window.document.execCommand('copy');
      window.document.body.removeChild(textArea);

      setCopiedFormat(format);
      setShowCopyMenu(false);
      setCopyFeedback({
        text: `Copied ${formatLabel} to Clipboard!`,
        details: 'Ready for external IDEs'
      });
      setTimeout(() => {
        setCopiedFormat(null);
        setCopyFeedback(null);
      }, 2500);
    }
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
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-6xl h-[94vh] flex flex-col shadow-2xl overflow-hidden relative">
        
        {/* Floating Toast Feedback for Copy to Clipboard */}
        {copyFeedback && (
          <div className="absolute top-16 right-6 z-50 bg-emerald-950/95 border border-emerald-500/50 text-emerald-200 px-4 py-2 rounded-xl shadow-2xl text-xs flex items-center gap-2.5 backdrop-blur-md animate-in slide-in-from-top-2 duration-150">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <div className="font-semibold">{copyFeedback.text}</div>
              {copyFeedback.details && (
                <div className="text-[11px] text-emerald-300/80 font-mono">
                  {copyFeedback.details} — Ready to paste in Cursor, VS Code, or Windsurf
                </div>
              )}
            </div>
          </div>
        )}

        {/* Top Control Bar */}
        <div className="flex flex-wrap items-center justify-between px-4 sm:px-6 py-3 border-b border-slate-800 bg-slate-950 gap-2">
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

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700 text-xs">
              <button
                onClick={() => setViewMode('preview')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition ${viewMode === 'preview' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                title="View interactive rendered document"
              >
                <Eye className="w-3.5 h-3.5" /> Rendered
              </button>
              <button
                onClick={() => setViewMode('ide')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition ${viewMode === 'ide' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                title="View clean Markdown formatted for external IDEs"
              >
                <FileText className="w-3.5 h-3.5" /> IDE Format
              </button>
              <button
                onClick={() => setViewMode('source')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition ${viewMode === 'source' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                title="View raw HTML markup"
              >
                <Code className="w-3.5 h-3.5" /> HTML Code
              </button>
            </div>

            {/* Copy to Clipboard Split Button */}
            <div className="relative flex items-center" ref={copyMenuRef}>
              <button
                onClick={() => handleCopyToClipboard(viewMode === 'source' ? 'html' : 'ide')}
                className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 text-xs font-semibold rounded-l-lg transition shadow-md ${
                  copiedFormat 
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white' 
                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white'
                }`}
                title="Copy curriculum content to clipboard for external IDEs (Cursor, VS Code, Windsurf)"
              >
                {copiedFormat ? (
                  <Check className="w-3.5 h-3.5 text-emerald-200" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>{copiedFormat ? 'Copied to Clipboard!' : 'Copy to Clipboard'}</span>
              </button>
              <button
                onClick={() => setShowCopyMenu(prev => !prev)}
                className={`px-1.5 py-1.5 text-xs border-l border-white/20 rounded-r-lg transition shadow-md ${
                  copiedFormat
                    ? 'bg-emerald-700 hover:bg-emerald-600 text-white'
                    : 'bg-indigo-700 hover:bg-indigo-600 text-white'
                }`}
                title="Select clipboard copy format (IDE Markdown, Raw HTML, or AI Prompts)"
              >
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showCopyMenu ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {showCopyMenu && (
                <div 
                  className="absolute right-0 top-full mt-1.5 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-1.5 z-50 text-xs backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150"
                  onClick={() => setShowCopyMenu(false)}
                >
                  <div className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                    Copy Format for External IDE
                  </div>
                  <button
                    onClick={() => handleCopyToClipboard('ide')}
                    className="w-full px-3 py-2 text-left hover:bg-purple-950/60 hover:text-purple-300 flex items-start gap-2.5 transition"
                  >
                    <FileText className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-slate-200">IDE Markdown (.md)</div>
                      <div className="text-[10px] text-slate-400">Chapters, topics & code blocks for Cursor / VS Code</div>
                    </div>
                  </button>
                  <button
                    onClick={() => handleCopyToClipboard('html')}
                    className="w-full px-3 py-2 text-left hover:bg-purple-950/60 hover:text-purple-300 flex items-start gap-2.5 transition"
                  >
                    <Code className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-slate-200">Raw HTML Document</div>
                      <div className="text-[10px] text-slate-400">Standalone .html file with embedded CSS</div>
                    </div>
                  </button>
                  <button
                    onClick={() => handleCopyToClipboard('prompts')}
                    className="w-full px-3 py-2 text-left hover:bg-purple-950/60 hover:text-purple-300 flex items-start gap-2.5 transition"
                  >
                    <Terminal className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-slate-200">AI Prompts Only</div>
                      <div className="text-[10px] text-slate-400">Numbered prompt text for AI chat windows</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={handleDownloadSingle}
              className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition"
              title="Download HTML file"
            >
              <Download className="w-3.5 h-3.5" /> Download
            </button>

            {/* Listen (TTS) Toggle Button */}
            <button
              onClick={() => setShowTtsPlayer(prev => !prev)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition shadow-md border ${
                showTtsPlayer
                  ? 'bg-cyan-600 border-cyan-400 text-white shadow-cyan-900/30'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
              title="Listen to curriculum content read aloud with Text-to-Speech (Web Speech API)"
            >
              <Volume2 className={`w-3.5 h-3.5 ${showTtsPlayer ? 'text-cyan-100 animate-pulse' : 'text-cyan-400'}`} />
              <span>{showTtsPlayer ? 'Audio Active' : 'Listen (TTS)'}</span>
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
              title="Close modal (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Text-to-Speech Audio Player Ribbon */}
        {showTtsPlayer && (
          <CurriculumTtsPlayer
            document={document}
            currentLang={currentLang}
            onClose={() => setShowTtsPlayer(false)}
          />
        )}

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
          ) : viewMode === 'ide' ? (
            <div className="w-full h-full overflow-auto p-4 bg-slate-950">
              <PrismCodeBlock
                code={ideContent}
                language="markdown"
                filename={`${document.subject}_${currentLang}_ide.md`}
                maxHeightClass="max-h-[calc(85vh-160px)]"
              />
            </div>
          ) : (
            <div className="w-full h-full overflow-auto p-4 bg-slate-950">
              <PrismCodeBlock
                code={generatedHtml}
                language="markup"
                filename={`${document.subject}_${currentLang}.html`}
                maxHeightClass="max-h-[calc(85vh-160px)]"
              />
            </div>
          )}
        </div>

        {/* Bottom Status Bar */}
        <div className="px-6 py-2.5 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
          <div className="flex items-center gap-3">
            <span>Chapters: {document.chapters.length}</span>
            <span>•</span>
            <span>Encoding: UTF-8</span>
            <span>•</span>
            <span>Direction: {currentLanguageInfo.dir.toUpperCase()}</span>
            <span>•</span>
            <span className="text-emerald-400">Interactive Copy Buttons Active</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowTtsPlayer(prev => !prev)}
              className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 font-medium transition group"
              title="Toggle Text-to-Speech audio reader"
            >
              <Volume2 className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
              <span>{showTtsPlayer ? 'Hide Audio Bar' : 'Listen (TTS)'}</span>
            </button>
            <span>•</span>
            <button
              onClick={() => handleCopyToClipboard('ide')}
              className="flex items-center gap-1.5 text-purple-400 hover:text-purple-300 font-medium transition group"
              title="Copy formatted curriculum markdown to clipboard for external IDE"
            >
              <Copy className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
              <span>Copy for External IDE</span>
            </button>
            <span>•</span>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition"
            >
              Close Preview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

