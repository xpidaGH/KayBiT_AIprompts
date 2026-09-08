import React, { useState, useMemo } from 'react';
import { 
  Keyboard, 
  X, 
  Search, 
  Compass, 
  Bot, 
  BookOpen, 
  Sliders, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { 
  KEYBOARD_SHORTCUTS, 
  SHORTCUT_CATEGORIES, 
  ShortcutDefinition 
} from '../data';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerAction?: (shortcutId: string) => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
  onTriggerAction
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Filtered shortcuts based on category and search query
  const filteredShortcuts = useMemo(() => {
    return KEYBOARD_SHORTCUTS.filter((sc) => {
      const matchesCategory = activeCategory === 'all' || sc.category === activeCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        sc.label.toLowerCase().includes(q) ||
        sc.description.toLowerCase().includes(q) ||
        sc.displayKeys.some(k => k.toLowerCase().includes(q)) ||
        sc.keys.some(k => k.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  if (!isOpen) return null;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'navigation':
        return <Compass className="w-4 h-4 text-cyan-400" />;
      case 'agent':
        return <Bot className="w-4 h-4 text-purple-400" />;
      case 'curriculum':
        return <BookOpen className="w-4 h-4 text-emerald-400" />;
      case 'studio':
      default:
        return <Sliders className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-modal-title"
      onClick={onClose}
    >
      <div 
        className="bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[88vh] flex flex-col overflow-hidden animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shadow-md shadow-amber-950/20">
              <Keyboard className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="shortcuts-modal-title" className="text-base sm:text-lg font-bold text-white font-heading">
                  Keyboard Shortcuts
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-semibold font-mono">
                  Pro Workflow
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Speed up navigation, prompt transmissions, and curriculum exports
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            aria-label="Close shortcuts dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Category Filter Toolbar */}
        <div className="p-4 border-b border-slate-800/80 bg-slate-900/90 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search shortcuts by action, key (e.g., '1', 'Ctrl', 'export'), or category..."
              className="w-full pl-9 pr-4 py-2 bg-slate-950 rounded-xl border border-slate-700/80 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition"
              autoFocus
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          {/* Categories Pill Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            {SHORTCUT_CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              const count = cat.id === 'all' 
                ? KEYBOARD_SHORTCUTS.length 
                : KEYBOARD_SHORTCUTS.filter(s => s.category === cat.id).length;

              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap flex items-center gap-1.5 transition ${
                    isActive
                      ? 'bg-purple-600 text-white font-semibold shadow-sm'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800/80'
                  }`}
                >
                  <span>{cat.label}</span>
                  <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                    isActive ? 'bg-purple-700 text-purple-100' : 'bg-slate-900 text-slate-500'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Shortcuts List Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-2.5">
          {filteredShortcuts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {filteredShortcuts.map((sc: ShortcutDefinition) => (
                <div
                  key={sc.id}
                  className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition flex items-start justify-between gap-3 group"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="shrink-0">{getCategoryIcon(sc.category)}</span>
                      <h4 className="text-xs sm:text-sm font-semibold text-slate-200 group-hover:text-white truncate">
                        {sc.label}
                      </h4>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
                      {sc.description}
                    </p>
                  </div>

                  {/* Keyboard Key Combination Display */}
                  <div className="flex items-center gap-1 shrink-0 pt-0.5">
                    {sc.displayKeys.map((k, idx) => (
                      <React.Fragment key={idx}>
                        <kbd className="px-2 py-1 bg-slate-900 border border-slate-700 text-slate-200 font-mono text-[11px] rounded-md shadow-sm font-semibold min-w-[24px] text-center">
                          {k}
                        </kbd>
                        {idx < sc.displayKeys.length - 1 && (
                          <span className="text-slate-500 text-[10px] font-mono">+</span>
                        )}
                      </React.Fragment>
                    ))}

                    {/* Quick Trigger Button (if parent handler supported) */}
                    {onTriggerAction && (
                      <button
                        type="button"
                        onClick={() => {
                          onTriggerAction(sc.id);
                          onClose();
                        }}
                        className="ml-1 p-1 rounded-md text-slate-500 hover:text-purple-300 hover:bg-purple-950/50 transition opacity-0 group-hover:opacity-100"
                        title="Execute this action now"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 space-y-2">
              <Sparkles className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-sm text-slate-400 font-medium">No shortcuts matching "{searchQuery}"</p>
              <button
                onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
                className="text-xs text-purple-400 hover:underline"
              >
                Reset filters
              </button>
            </div>
          )}
        </div>

        {/* Footer Tip */}
        <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-950/70 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>
              Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[10px] text-slate-200">?</kbd> anywhere to toggle this cheat sheet.
            </span>
          </div>
          <div className="text-[11px] text-slate-500">
            Single-key shortcuts are suspended while typing inside input fields.
          </div>
        </div>
      </div>
    </div>
  );
};
