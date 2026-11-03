import React, { useEffect, useRef } from 'react';
import { 
  X, 
  Palette, 
  Check, 
  Sparkles, 
  Terminal, 
  BookOpen, 
  Heart, 
  Moon, 
  Zap,
  Layers
} from 'lucide-react';
import { THEMES, ThemeId, ThemeConfig, applyTheme, setStoredTheme } from '../data/themes';

interface ThemeSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: ThemeId;
  onSelectTheme: (themeId: ThemeId) => void;
}

const THEME_ICONS: Record<ThemeId, React.ComponentType<{ className?: string }>> = {
  'editorial': BookOpen,
  'technical': Terminal,
  'warm': Heart,
  'elegant-dark': Moon,
  'vibrant': Zap
};

export const ThemeSettingsModal: React.FC<ThemeSettingsModalProps> = ({
  isOpen,
  onClose,
  currentTheme,
  onSelectTheme
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on Escape or click outside
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node) && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleChoose = (themeId: ThemeId) => {
    applyTheme(themeId);
    setStoredTheme(themeId);
    onSelectTheme(themeId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div 
        ref={modalRef}
        className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="theme-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl text-purple-400">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 id="theme-modal-title" className="text-lg font-bold text-white flex items-center gap-2">
                Theme Settings
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono font-normal">
                  5 Variations
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Choose a visual theme. Your choice dynamically updates colors, fonts, borders, and persists across reloads.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            aria-label="Close theme modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Themes List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3.5 bg-slate-950/40">
          {THEMES.map((theme: ThemeConfig) => {
            const isSelected = currentTheme === theme.id;
            const Icon = THEME_ICONS[theme.id] || Sparkles;

            return (
              <div
                key={theme.id}
                onClick={() => handleChoose(theme.id)}
                className={`group relative p-4 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isSelected
                    ? 'bg-slate-850 border-purple-500 shadow-lg shadow-purple-950/50 ring-1 ring-purple-500/50'
                    : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 hover:bg-slate-850/80'
                }`}
              >
                {/* Left: Icon, Title, Description */}
                <div className="flex items-start gap-3.5 flex-1">
                  <div 
                    className="p-2.5 rounded-xl border shrink-0 transition-transform group-hover:scale-105"
                    style={{
                      backgroundColor: theme.colors.card,
                      borderColor: theme.colors.border,
                      color: theme.colors.accent
                    }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                        {theme.name}
                      </h3>
                      <span 
                        className="text-[10px] px-2 py-0.5 rounded font-mono font-medium border"
                        style={{
                          backgroundColor: `${theme.colors.accent}15`,
                          borderColor: `${theme.colors.accent}40`,
                          color: theme.isDark ? '#e2e8f0' : theme.colors.accent
                        }}
                      >
                        {theme.fontBadge}
                      </span>
                      {isSelected && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold flex items-center gap-1">
                          <Check className="w-3 h-3" /> Active
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      {theme.description}
                    </p>
                    {/* Features list */}
                    <div className="flex items-center gap-2 mt-2 flex-wrap text-[11px] text-slate-400">
                      {theme.features.map((feat, i) => (
                        <span key={i} className="flex items-center gap-1">
                          {i > 0 && <span className="text-slate-600">•</span>}
                          <span>{feat}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right: Color Swatches & Action Button */}
                <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                  <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-slate-950 border border-slate-800">
                    <div 
                      className="w-4 h-4 rounded-full border border-black/20"
                      style={{ backgroundColor: theme.colors.bg }}
                      title={`Background: ${theme.colors.bg}`}
                    />
                    <div 
                      className="w-4 h-4 rounded-full border border-black/20"
                      style={{ backgroundColor: theme.colors.card }}
                      title={`Card: ${theme.colors.card}`}
                    />
                    <div 
                      className="w-4 h-4 rounded-full border border-black/20"
                      style={{ backgroundColor: theme.colors.accent }}
                      title={`Accent: ${theme.colors.accent}`}
                    />
                    <div 
                      className="w-4 h-4 rounded-full border border-black/20"
                      style={{ backgroundColor: theme.colors.text }}
                      title={`Text: ${theme.colors.text}`}
                    />
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleChoose(theme.id);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      isSelected
                        ? 'bg-purple-600 text-white shadow'
                        : 'bg-slate-800 hover:bg-purple-600 hover:text-white text-slate-300 border border-slate-700'
                    }`}
                  >
                    {isSelected ? 'Selected' : 'Apply Theme'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-800 bg-slate-950 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-purple-400" />
            <span>Theme choice automatically saved to local storage</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
