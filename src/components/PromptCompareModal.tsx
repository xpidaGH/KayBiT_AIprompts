import React, { useState, useMemo, useEffect } from 'react';
import { 
  GitCompare, 
  X, 
  ArrowLeftRight, 
  Copy, 
  Check, 
  RotateCcw, 
  Columns, 
  Rows, 
  Sparkles, 
  FileText, 
  Layers, 
  ArrowRight,
  Info,
  ChevronDown
} from 'lucide-react';
import { 
  computeSideBySideDiff, 
  computeUnifiedDiff, 
  generateGitDiffText, 
  WordToken 
} from '../utils/diffUtils';

export interface PromptVersionItem {
  id: string;
  label: string;
  text: string;
  timestamp?: string;
  isCurrentDraft?: boolean;
}

interface PromptCompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  promptHistory: string[];
  currentPrompt: string;
  onApplyPrompt: (newPrompt: string) => void;
}

export const PromptCompareModal: React.FC<PromptCompareModalProps> = ({
  isOpen,
  onClose,
  promptHistory,
  currentPrompt,
  onApplyPrompt
}) => {
  // Assemble all available versions
  const versions: PromptVersionItem[] = useMemo(() => {
    const list: PromptVersionItem[] = [];

    // Current draft (if non-empty or if user is actively editing)
    if (currentPrompt.trim()) {
      list.push({
        id: 'current_draft',
        label: 'Current Editor Draft',
        text: currentPrompt,
        isCurrentDraft: true
      });
    }

    // Saved history entries
    promptHistory.forEach((item, idx) => {
      list.push({
        id: `history_${idx}`,
        label: `Version #${idx + 1}${idx === 0 ? ' (Latest Saved)' : ''}`,
        text: item
      });
    });

    return list;
  }, [promptHistory, currentPrompt]);

  // Selected version IDs for Left (A) and Right (B)
  const [versionAId, setVersionAId] = useState<string>('');
  const [versionBId, setVersionBId] = useState<string>('');
  const [viewMode, setViewMode] = useState<'split' | 'unified'>('split');
  const [showWordDiff, setShowWordDiff] = useState<boolean>(true);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  // Initialize or reset selections when modal opens or versions change
  useEffect(() => {
    if (isOpen && versions.length >= 2) {
      // Default: Compare Version 2 (previous) with Version 1 (latest)
      // Or if current draft exists, compare Latest Saved with Current Draft
      if (versions[0]?.isCurrentDraft && versions.length > 1) {
        setVersionAId(versions[1].id); // Latest saved
        setVersionBId(versions[0].id); // Current draft
      } else {
        setVersionAId(versions[1]?.id || versions[0]?.id || '');
        setVersionBId(versions[0]?.id || '');
      }
    } else if (isOpen && versions.length === 1) {
      setVersionAId(versions[0].id);
      setVersionBId(versions[0].id);
    }
  }, [isOpen, versions]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const versionA = useMemo(() => versions.find(v => v.id === versionAId) || versions[0] || { id: '', label: '', text: '' }, [versions, versionAId]);
  const versionB = useMemo(() => versions.find(v => v.id === versionBId) || versions[1] || versions[0] || { id: '', label: '', text: '' }, [versions, versionBId]);

  // Compute diffs
  const { rows, stats } = useMemo(() => {
    return computeSideBySideDiff(versionA.text, versionB.text);
  }, [versionA.text, versionB.text]);

  const unifiedLines = useMemo(() => {
    return computeUnifiedDiff(versionA.text, versionB.text);
  }, [versionA.text, versionB.text]);

  if (!isOpen) return null;

  const handleSwap = () => {
    const temp = versionAId;
    setVersionAId(versionBId);
    setVersionBId(temp);
  };

  const handleCopyText = (text: string, sectionKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionKey);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const handleCopyUnifiedDiff = () => {
    const diffText = generateGitDiffText(versionA.label, versionB.label, versionA.text, versionB.text);
    handleCopyText(diffText, 'unified_diff');
  };

  const handleApply = (text: string) => {
    onApplyPrompt(text);
    onClose();
  };

  const isIdentical = versionA.text === versionB.text;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-6xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/80 flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 shrink-0">
              <GitCompare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Prompt Version Diff & History Comparison
                </h2>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30 font-semibold">
                  Side-by-Side
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Inspect side-by-side textual additions, removals, and word-level edits across your saved prompt versions.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-center">
            {/* View Mode Switcher: Split vs Unified */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setViewMode('split')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                  viewMode === 'split'
                    ? 'bg-purple-600 text-white font-semibold shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Split Side-by-Side View"
              >
                <Columns className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Side-by-Side</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('unified')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                  viewMode === 'unified'
                    ? 'bg-purple-600 text-white font-semibold shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Unified Inline View"
              >
                <Rows className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Unified</span>
              </button>
            </div>

            {/* Word Diff Toggle */}
            <button
              type="button"
              onClick={() => setShowWordDiff(!showWordDiff)}
              className={`px-2.5 py-1.5 rounded-xl border text-xs font-medium transition flex items-center gap-1.5 ${
                showWordDiff 
                  ? 'bg-purple-950/50 border-purple-500/40 text-purple-300' 
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
              title="Toggle inline word-level diff highlighting"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Word Diff</span>
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition ml-1"
              title="Close diff comparison (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Version Pickers & Control Bar */}
        <div className="p-3 sm:p-4 bg-slate-950/60 border-b border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shrink-0">
          {/* Version A Dropdown (Left / Original) */}
          <div className="flex-1 flex items-center gap-2">
            <span className="text-xs font-semibold text-rose-400 shrink-0 font-mono flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500 inline-block"></span>
              Base (A):
            </span>
            <div className="relative flex-1">
              <select
                value={versionAId}
                onChange={(e) => setVersionAId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:border-purple-500 cursor-pointer font-medium"
              >
                {versions.map((v) => (
                  <option key={v.id} value={v.id} className="bg-slate-900 text-slate-200">
                    {v.label} — &ldquo;{v.text.slice(0, 45)}{v.text.length > 45 ? '...' : ''}&rdquo;
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Swap Button */}
          <button
            type="button"
            onClick={handleSwap}
            className="p-1.5 self-center rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-purple-300 hover:border-purple-500/40 hover:bg-slate-850 transition shadow-xs"
            title="Swap Version A and Version B"
          >
            <ArrowLeftRight className="w-4 h-4" />
          </button>

          {/* Version B Dropdown (Right / Comparison) */}
          <div className="flex-1 flex items-center gap-2">
            <span className="text-xs font-semibold text-emerald-400 shrink-0 font-mono flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
              Target (B):
            </span>
            <div className="relative flex-1">
              <select
                value={versionBId}
                onChange={(e) => setVersionBId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:border-purple-500 cursor-pointer font-medium"
              >
                {versions.map((v) => (
                  <option key={v.id} value={v.id} className="bg-slate-900 text-slate-200">
                    {v.label} — &ldquo;{v.text.slice(0, 45)}{v.text.length > 45 ? '...' : ''}&rdquo;
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Diff Stats Banner */}
        <div className="px-4 py-2 bg-slate-950/90 border-b border-slate-800/80 flex items-center justify-between gap-3 text-xs shrink-0 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap font-mono text-[11px]">
            <span className="text-slate-400">Diff Stats:</span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-semibold">
              +{stats.additions} {stats.additions === 1 ? 'addition' : 'additions'}
            </span>
            <span className="px-2 py-0.5 rounded bg-rose-500/15 border border-rose-500/30 text-rose-300 font-semibold">
              -{stats.deletions} {stats.deletions === 1 ? 'deletion' : 'deletions'}
            </span>
            <span className="px-2 py-0.5 rounded bg-purple-500/15 border border-purple-500/30 text-purple-300 font-semibold">
              ~{stats.modifications} {stats.modifications === 1 ? 'modified line' : 'modified lines'}
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400">
              {stats.unchanged} unchanged
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-[11px]">Similarity:</span>
            <div className="flex items-center gap-1.5">
              <div className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all ${
                    stats.similarityScore >= 80 
                      ? 'bg-emerald-500' 
                      : stats.similarityScore >= 50 
                      ? 'bg-purple-500' 
                      : 'bg-amber-500'
                  }`}
                  style={{ width: `${stats.similarityScore}%` }}
                />
              </div>
              <span className="font-mono text-xs font-semibold text-slate-200">
                {stats.similarityScore}%
              </span>
            </div>
          </div>
        </div>

        {/* Content Diff Body */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 scrollbar-thin">
          
          {/* Identical Warning Notice */}
          {isIdentical && (
            <div className="mb-4 p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-xl flex items-center gap-2.5 text-xs text-cyan-200">
              <Info className="w-4 h-4 shrink-0 text-cyan-400" />
              <span>
                Both selected versions are identical. No textual differences were found. Select another version from dropdowns above to compare revisions.
              </span>
            </div>
          )}

          {/* VIEW MODE 1: SPLIT (SIDE-BY-SIDE) */}
          {viewMode === 'split' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 min-w-full">
              
              {/* Left Column: Version A */}
              <div className="flex flex-col bg-slate-950/70 border border-slate-800 rounded-xl overflow-hidden shadow-inner">
                {/* Column A Header */}
                <div className="px-3 py-2 bg-rose-950/30 border-b border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 truncate mr-2">
                    <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                    <span className="font-semibold text-rose-300 truncate">
                      {versionA.label}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      ({stats.totalWordsA} words)
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleCopyText(versionA.text, 'copy_a')}
                      className="px-2 py-0.5 rounded text-[10px] bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800 transition flex items-center gap-1"
                      title="Copy Version A text"
                    >
                      {copiedSection === 'copy_a' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedSection === 'copy_a' ? 'Copied' : 'Copy'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApply(versionA.text)}
                      className="px-2 py-0.5 rounded text-[10px] bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/30 font-medium transition"
                      title="Load Version A into Prompt Editor"
                    >
                      Use in Prompt
                    </button>
                  </div>
                </div>

                {/* Column A Lines Table */}
                <div className="font-mono text-xs divide-y divide-slate-800/40 select-text overflow-x-auto">
                  {rows.map((row, idx) => {
                    const isRemoved = row.leftType === 'deleted' || row.leftType === 'modified';
                    const isEmpty = row.leftType === 'empty';

                    return (
                      <div 
                        key={idx} 
                        className={`flex min-h-[26px] items-start transition-colors ${
                          isEmpty
                            ? 'bg-slate-950/40 text-transparent opacity-40 select-none'
                            : isRemoved
                            ? 'bg-rose-950/25 hover:bg-rose-950/35 text-rose-200 border-l-2 border-rose-500'
                            : 'hover:bg-slate-900/50 text-slate-300'
                        }`}
                      >
                        {/* Line Number */}
                        <div className="w-10 shrink-0 text-right pr-2 py-1 text-[11px] text-slate-500 select-none border-r border-slate-800/60 bg-slate-950/50">
                          {row.leftLineNumber ?? ''}
                        </div>

                        {/* Diff Indicator */}
                        <div className="w-5 shrink-0 text-center py-1 text-[11px] select-none text-rose-400 font-bold">
                          {isRemoved ? '-' : ''}
                        </div>

                        {/* Line Content */}
                        <div className="flex-1 px-2 py-1 whitespace-pre-wrap break-words leading-relaxed">
                          {isEmpty ? (
                            <span className="italic select-none text-slate-800 font-sans text-[11px]">&mdash;</span>
                          ) : showWordDiff && row.leftWords && row.leftWords.length > 0 ? (
                            <span>
                              {row.leftWords.map((token, wIdx) => {
                                if (token.type === 'deleted') {
                                  return (
                                    <span 
                                      key={wIdx} 
                                      className="bg-rose-500/30 text-rose-100 line-through decoration-rose-400/80 rounded px-0.5 font-semibold"
                                    >
                                      {token.text}
                                    </span>
                                  );
                                }
                                return <span key={wIdx}>{token.text}</span>;
                              })}
                            </span>
                          ) : (
                            row.leftText
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Version B */}
              <div className="flex flex-col bg-slate-950/70 border border-slate-800 rounded-xl overflow-hidden shadow-inner">
                {/* Column B Header */}
                <div className="px-3 py-2 bg-emerald-950/30 border-b border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 truncate mr-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span className="font-semibold text-emerald-300 truncate">
                      {versionB.label}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      ({stats.totalWordsB} words)
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleCopyText(versionB.text, 'copy_b')}
                      className="px-2 py-0.5 rounded text-[10px] bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800 transition flex items-center gap-1"
                      title="Copy Version B text"
                    >
                      {copiedSection === 'copy_b' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedSection === 'copy_b' ? 'Copied' : 'Copy'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApply(versionB.text)}
                      className="px-2 py-0.5 rounded text-[10px] bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/30 font-medium transition"
                      title="Load Version B into Prompt Editor"
                    >
                      Use in Prompt
                    </button>
                  </div>
                </div>

                {/* Column B Lines Table */}
                <div className="font-mono text-xs divide-y divide-slate-800/40 select-text overflow-x-auto">
                  {rows.map((row, idx) => {
                    const isAdded = row.rightType === 'added' || row.rightType === 'modified';
                    const isEmpty = row.rightType === 'empty';

                    return (
                      <div 
                        key={idx} 
                        className={`flex min-h-[26px] items-start transition-colors ${
                          isEmpty
                            ? 'bg-slate-950/40 text-transparent opacity-40 select-none'
                            : isAdded
                            ? 'bg-emerald-950/25 hover:bg-emerald-950/35 text-emerald-200 border-l-2 border-emerald-500'
                            : 'hover:bg-slate-900/50 text-slate-300'
                        }`}
                      >
                        {/* Line Number */}
                        <div className="w-10 shrink-0 text-right pr-2 py-1 text-[11px] text-slate-500 select-none border-r border-slate-800/60 bg-slate-950/50">
                          {row.rightLineNumber ?? ''}
                        </div>

                        {/* Diff Indicator */}
                        <div className="w-5 shrink-0 text-center py-1 text-[11px] select-none text-emerald-400 font-bold">
                          {isAdded ? '+' : ''}
                        </div>

                        {/* Line Content */}
                        <div className="flex-1 px-2 py-1 whitespace-pre-wrap break-words leading-relaxed">
                          {isEmpty ? (
                            <span className="italic select-none text-slate-800 font-sans text-[11px]">&mdash;</span>
                          ) : showWordDiff && row.rightWords && row.rightWords.length > 0 ? (
                            <span>
                              {row.rightWords.map((token, wIdx) => {
                                if (token.type === 'added') {
                                  return (
                                    <span 
                                      key={wIdx} 
                                      className="bg-emerald-500/30 text-emerald-100 underline decoration-emerald-400/80 rounded px-0.5 font-semibold"
                                    >
                                      {token.text}
                                    </span>
                                  );
                                }
                                return <span key={wIdx}>{token.text}</span>;
                              })}
                            </span>
                          ) : (
                            row.rightText
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          ) : (
            /* VIEW MODE 2: UNIFIED (INLINE) */
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl overflow-hidden font-mono text-xs divide-y divide-slate-800/40 shadow-inner">
              <div className="px-3 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">
                  Unified Git Format: <span className="text-rose-400">--- {versionA.label}</span> vs <span className="text-emerald-400">+++ {versionB.label}</span>
                </span>
                <button
                  type="button"
                  onClick={handleCopyUnifiedDiff}
                  className="px-2.5 py-1 rounded bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs transition flex items-center gap-1"
                >
                  {copiedSection === 'unified_diff' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSection === 'unified_diff' ? 'Diff Copied' : 'Copy Unified Patch'}</span>
                </button>
              </div>

              {unifiedLines.map((line, idx) => {
                const isAdded = line.type === 'added';
                const isDeleted = line.type === 'deleted';

                return (
                  <div
                    key={idx}
                    className={`flex items-start min-h-[26px] ${
                      isAdded
                        ? 'bg-emerald-950/30 text-emerald-200'
                        : isDeleted
                        ? 'bg-rose-950/30 text-rose-200'
                        : 'text-slate-300 hover:bg-slate-900/40'
                    }`}
                  >
                    <div className="w-12 shrink-0 text-right pr-2 py-1 text-[10px] text-slate-500 border-r border-slate-800/60 select-none">
                      {line.oldLineNumber ?? ''}
                    </div>
                    <div className="w-12 shrink-0 text-right pr-2 py-1 text-[10px] text-slate-500 border-r border-slate-800/60 select-none">
                      {line.newLineNumber ?? ''}
                    </div>
                    <div className={`w-6 shrink-0 text-center py-1 font-bold select-none ${
                      isAdded ? 'text-emerald-400' : isDeleted ? 'text-rose-400' : 'text-slate-600'
                    }`}>
                      {isAdded ? '+' : isDeleted ? '-' : ' '}
                    </div>
                    <div className="flex-1 px-2 py-1 whitespace-pre-wrap break-words leading-relaxed">
                      {line.text}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-950/80 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleCopyUnifiedDiff}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-300 text-xs font-medium border border-slate-800 transition"
              title="Copy unified git diff format to clipboard"
            >
              {copiedSection === 'unified_diff' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy Git Diff Patch</span>
            </button>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-medium text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => handleApply(versionB.text)}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-xl transition shadow-md shadow-purple-900/30"
              title="Apply Target Version (B) to the current prompt editor"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Apply {versionB.label} to Editor</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
