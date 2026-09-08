import React, { useState, useMemo } from 'react';
import { Check, Copy, Terminal, Code2, Hash, WrapText } from 'lucide-react';
import { 
  highlightCode, 
  getLanguageDisplayName, 
  getLanguageBadgeTheme,
  normalizeLanguage 
} from '../utils/prismHelper';

interface PrismCodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  showLineNumbersDefault?: boolean;
  maxHeightClass?: string;
  compact?: boolean;
}

export const PrismCodeBlock: React.FC<PrismCodeBlockProps> = ({
  code,
  language = 'plaintext',
  filename,
  showLineNumbersDefault = true,
  maxHeightClass = 'max-h-[500px]',
  compact = false
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [showLineNumbers, setShowLineNumbers] = useState<boolean>(showLineNumbersDefault);
  const [wrapLines, setWrapLines] = useState<boolean>(false);

  const cleanCode = useMemo(() => {
    return code.replace(/\r\n/g, '\n').trimEnd();
  }, [code]);

  const normLang = useMemo(() => normalizeLanguage(language), [language]);
  const langDisplay = useMemo(() => getLanguageDisplayName(normLang), [normLang]);
  const badgeTheme = useMemo(() => getLanguageBadgeTheme(normLang), [normLang]);

  // Syntax highlighted HTML via Prism.js
  const highlightedHtml = useMemo(() => {
    return highlightCode(cleanCode, normLang);
  }, [cleanCode, normLang]);

  // Split lines for line numbers
  const lines = useMemo(() => {
    return cleanCode.split('\n');
  }, [cleanCode]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(cleanCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = cleanCode;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isShell = normLang === 'bash' || normLang === 'powershell';

  return (
    <div className="my-3 rounded-xl border border-slate-800/90 bg-slate-950 overflow-hidden shadow-xl text-left">
      {/* Code Block Header */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-slate-900/90 border-b border-slate-800/80 text-xs select-none">
        <div className="flex items-center gap-2 min-w-0">
          {/* Language / Shell Icon */}
          <div className="flex items-center gap-1.5 font-mono text-[11px]">
            {isShell ? (
              <Terminal className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            ) : (
              <Code2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
            )}
            <span
              className={`px-2 py-0.5 rounded-md font-semibold border text-[10px] tracking-wide uppercase flex items-center gap-1.5 ${badgeTheme.bg} ${badgeTheme.text} ${badgeTheme.border}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${badgeTheme.dot}`} />
              {langDisplay}
            </span>
          </div>

          {/* Optional Filename */}
          {filename && (
            <span className="text-slate-400 font-mono text-[11px] truncate hidden sm:inline" title={filename}>
              {filename}
            </span>
          )}

          {/* Line count badge */}
          <span className="text-[10px] text-slate-500 font-mono hidden md:inline">
            {lines.length} {lines.length === 1 ? 'line' : 'lines'}
          </span>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Toggle Line Numbers */}
          {!compact && lines.length > 3 && (
            <button
              type="button"
              onClick={() => setShowLineNumbers(prev => !prev)}
              className={`p-1 rounded-md text-[11px] flex items-center gap-1 transition ${
                showLineNumbers
                  ? 'text-purple-300 bg-purple-950/40 border border-purple-800/40'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
              title={showLineNumbers ? 'Hide line numbers' : 'Show line numbers'}
            >
              <Hash className="w-3 h-3" />
            </button>
          )}

          {/* Toggle Wrap */}
          {!compact && (
            <button
              type="button"
              onClick={() => setWrapLines(prev => !prev)}
              className={`p-1 rounded-md text-[11px] flex items-center gap-1 transition ${
                wrapLines
                  ? 'text-purple-300 bg-purple-950/40 border border-purple-800/40'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
              title={wrapLines ? 'Disable line wrap' : 'Enable line wrap'}
            >
              <WrapText className="w-3 h-3" />
            </button>
          )}

          {/* One-Click Copy Button */}
          <button
            type="button"
            onClick={handleCopy}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium transition border ${
              copied
                ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                : 'bg-slate-800 hover:bg-slate-700/80 border-slate-700 text-slate-300 hover:text-white'
            }`}
            title="Copy code snippet to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 text-slate-400" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Viewer Container */}
      <div className={`relative overflow-x-auto ${maxHeightClass} scrollbar-thin`}>
        <div className="flex font-mono text-[12.5px] leading-relaxed">
          {/* Line Numbers Column */}
          {showLineNumbers && (
            <div
              className="py-3 px-3 select-none text-right font-mono text-[11px] text-slate-600 bg-slate-950/80 border-r border-slate-850 shrink-0"
              style={{ minWidth: lines.length > 99 ? '3.5rem' : '2.5rem' }}
            >
              {lines.map((_, idx) => (
                <div key={idx} className="h-5 flex items-center justify-end">
                  {idx + 1}
                </div>
              ))}
            </div>
          )}

          {/* Syntax-Highlighted Code Pre/Code */}
          <pre
            className={`p-3 text-slate-200 overflow-x-auto w-full font-mono text-[12.5px] leading-5 ${
              wrapLines ? 'whitespace-pre-wrap break-all' : 'whitespace-pre'
            }`}
          >
            <code
              className={`language-${normLang}`}
              dangerouslySetInnerHTML={{ __html: highlightedHtml }}
            />
          </pre>
        </div>
      </div>
    </div>
  );
};
