import React, { useState } from 'react';
import { 
  Tag, 
  X, 
  Plus, 
  Check, 
  Code, 
  GraduationCap, 
  Sparkles,
  Layers
} from 'lucide-react';
import { CurriculumDocument, DifficultyLevel } from '../types';
import { PROGRAMMING_LANGUAGES } from '../services/aiGateway';

interface CurriculumTagModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: CurriculumDocument | null;
  onSave: (updatedDoc: CurriculumDocument) => void;
}

const DIFFICULTY_OPTIONS: { level: DifficultyLevel; label: string; desc: string; color: string; icon: string }[] = [
  { level: 'Beginner', label: 'Beginner', desc: 'Foundational syntax, concepts, & basic scripts', color: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300', icon: '🌱' },
  { level: 'Intermediate', label: 'Intermediate', desc: 'Full-stack apps, async patterns, & APIs', color: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300', icon: '🎓' },
  { level: 'Advanced', label: 'Advanced', desc: 'System architecture, concurrency, & security', color: 'border-purple-500/40 bg-purple-500/10 text-purple-300', icon: '⚡' },
  { level: 'Expert', label: 'Expert', desc: 'Enterprise distributed systems & kernel tuning', color: 'border-rose-500/40 bg-rose-500/10 text-rose-300', icon: '🔥' }
];

const SUGGESTED_TAGS = [
  'Security', 'DevOps', 'Cloud', 'FullStack', 'Microservices', 
  'Concurrency', 'MachineLearning', 'CTF', 'WebSockets', 
  'Docker', 'SQL', 'FinTech', 'Hardening', 'DistributedSystems',
  'AutomatedTesting', 'API Design', 'Capstone'
];

export const CurriculumTagModal: React.FC<CurriculumTagModalProps> = ({
  isOpen,
  onClose,
  document: doc,
  onSave
}) => {
  if (!isOpen || !doc) return null;

  const [difficulty, setDifficulty] = useState<DifficultyLevel>(doc.difficulty || 'Intermediate');
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(doc.programmingLanguages || []);
  const [tags, setTags] = useState<string[]>(doc.tags || []);
  const [tagInput, setTagInput] = useState<string>('');
  const [langSearch, setLangSearch] = useState<string>('');

  const handleAddTag = (newTag: string) => {
    const clean = newTag.trim().replace(/^#/, '');
    if (clean && !tags.some(t => t.toLowerCase() === clean.toLowerCase())) {
      setTags([...tags, clean]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleToggleLanguage = (lang: string) => {
    if (selectedLanguages.includes(lang)) {
      setSelectedLanguages(selectedLanguages.filter(l => l !== lang));
    } else {
      setSelectedLanguages([...selectedLanguages, lang]);
    }
  };

  const handleSave = () => {
    const updated: CurriculumDocument = {
      ...doc,
      difficulty,
      programmingLanguages: selectedLanguages,
      tags
    };
    onSave(updated);
    onClose();
  };

  const filteredProgrammingLangs = PROGRAMMING_LANGUAGES.filter(lang => 
    lang.toLowerCase().includes(langSearch.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Categorize Curriculum Project
              </h3>
              <p className="text-xs text-slate-400 truncate max-w-md">
                {doc.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 space-y-5 overflow-y-auto scrollbar-thin">
          
          {/* Difficulty Level Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-purple-400" />
              <span>Target Difficulty Level</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {DIFFICULTY_OPTIONS.map((opt) => {
                const isSelected = difficulty === opt.level;
                return (
                  <button
                    key={opt.level}
                    type="button"
                    onClick={() => setDifficulty(opt.level)}
                    className={`p-2.5 rounded-xl border text-left transition flex items-start gap-2.5 select-none ${
                      isSelected
                        ? `${opt.color} ring-1 ring-purple-500 shadow-sm`
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <span className="text-lg shrink-0">{opt.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-white">
                          {opt.label}
                        </span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-purple-400" />}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">
                        {opt.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Programming Languages Multi-Select */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Code className="w-3.5 h-3.5 text-purple-400" />
                <span>Programming Languages ({selectedLanguages.length} tagged)</span>
              </label>
              <input
                type="text"
                placeholder="Quick find language..."
                value={langSearch}
                onChange={(e) => setLangSearch(e.target.value)}
                className="px-2 py-0.5 bg-slate-950 border border-slate-800 rounded text-[11px] text-slate-200 focus:border-purple-500 focus:outline-none w-36"
              />
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 bg-slate-950 rounded-xl border border-slate-800 scrollbar-thin">
              {filteredProgrammingLangs.map((lang) => {
                const isSelected = selectedLanguages.includes(lang);
                return (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => handleToggleLanguage(lang)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono transition flex items-center gap-1.5 select-none ${
                      isSelected
                        ? 'bg-purple-600 text-white font-semibold shadow-xs'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    <span>{lang}</span>
                    {isSelected && <Check className="w-3 h-3 text-purple-200" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Project Tags */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-purple-400" />
              <span>Project Topic Tags</span>
            </label>
            
            {/* Tag Input Field */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-xs">#</span>
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag(tagInput);
                    }
                  }}
                  placeholder="Add custom tag (e.g. Microservices, DevOps) and press Enter"
                  className="w-full pl-6 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder:text-slate-500 focus:border-purple-500 focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={() => handleAddTag(tagInput)}
                disabled={!tagInput.trim()}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white text-xs font-semibold rounded-lg transition flex items-center gap-1 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Tag</span>
              </button>
            </div>

            {/* Current Active Tags */}
            {tags.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-500/15 border border-purple-500/30 text-purple-300"
                  >
                    <span>#{t}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(t)}
                      className="hover:text-white rounded-full p-0.5 hover:bg-purple-500/30 transition"
                      title={`Remove tag #${t}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-slate-500 italic">No custom tags added yet.</p>
            )}

            {/* Suggested Tags Quick-Add */}
            <div className="pt-2 border-t border-slate-800/80">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1.5 tracking-wider">
                Quick-Add Suggestions
              </span>
              <div className="flex flex-wrap gap-1">
                {SUGGESTED_TAGS.filter(st => !tags.includes(st)).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => handleAddTag(st)}
                    className="px-2 py-0.5 rounded text-[11px] bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-purple-300 border border-slate-800 transition"
                  >
                    + #{st}
                  </button>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-t border-slate-800 bg-slate-950/80">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-xl transition shadow-lg shadow-purple-900/40"
          >
            <Check className="w-4 h-4" />
            <span>Save Category Tags</span>
          </button>
        </div>

      </div>
    </div>
  );
};
