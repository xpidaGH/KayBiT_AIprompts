import React, { useState } from 'react';
import { X, BookOpen, Search, Copy, Check } from 'lucide-react';

interface UserGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  guideContent: string;
}

export const UserGuideModal: React.FC<UserGuideModalProps> = ({ isOpen, onClose, guideContent }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyGuide = () => {
    navigator.clipboard.writeText(guideContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredLines = searchTerm
    ? guideContent.split('\n').filter(line => line.toLowerCase().includes(searchTerm.toLowerCase())).join('\n')
    : guideContent;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 border border-purple-500/20 rounded-lg text-purple-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                KayBiT_AIprompts User Guide
                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono">USER_GUIDE.md</span>
              </h2>
              <p className="text-xs text-slate-400">Complete documentation for AI Prompting and Multilingual Curriculum Generation</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyGuide}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
              title="Copy markdown text"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy Guide'}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-6 py-2.5 bg-slate-900/90 border-b border-slate-800 flex items-center gap-2">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search keywords in User Guide (e.g., Component 2, 19 languages, Claude Code, Capacitor)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent text-sm text-slate-200 placeholder-slate-500 focus:outline-none"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="text-xs text-slate-400 hover:text-white">
              Clear
            </button>
          )}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 text-slate-300 text-sm leading-relaxed space-y-4 font-mono bg-slate-950/40">
          <pre className="whitespace-pre-wrap font-sans text-sm text-slate-200 leading-relaxed break-words">
            {filteredLines}
          </pre>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
          <span>Press ESC or click close to return to the studio</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-lg transition"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
