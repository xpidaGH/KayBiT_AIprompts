import React, { useState, useMemo } from 'react';
import { 
  FolderGit2, 
  Search, 
  Filter, 
  Tag, 
  Code, 
  GraduationCap, 
  Sparkles, 
  X, 
  Edit3, 
  Trash2, 
  Check, 
  ChevronDown, 
  ChevronUp,
  Layers
} from 'lucide-react';
import { CurriculumDocument, DifficultyLevel } from '../types';
import { DIFFICULTY_BADGES } from '../data';
export { DIFFICULTY_BADGES };

interface CurriculumProjectFilterBarProps {
  curricula: CurriculumDocument[];
  activeCurriculumId: string;
  onSelectCurriculum: (id: string) => void;
  onOpenTagModal: (doc: CurriculumDocument) => void;
  onDeleteCurriculum?: (id: string) => void;
}

export const CurriculumProjectFilterBar: React.FC<CurriculumProjectFilterBarProps> = ({
  curricula,
  activeCurriculumId,
  onSelectCurriculum,
  onOpenTagModal,
  onDeleteCurriculum
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  // Extract all unique programming languages available across saved curricula
  const allLanguages = useMemo(() => {
    const langSet = new Set<string>();
    curricula.forEach((c) => {
      if (c.programmingLanguages && Array.isArray(c.programmingLanguages)) {
        c.programmingLanguages.forEach((l) => langSet.add(l));
      }
    });
    return Array.from(langSet).sort();
  }, [curricula]);

  // Extract all unique tags available across saved curricula
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    curricula.forEach((c) => {
      if (c.tags && Array.isArray(c.tags)) {
        c.tags.forEach((t) => tagSet.add(t));
      }
    });
    return Array.from(tagSet).sort();
  }, [curricula]);

  // Counts per difficulty
  const difficultyCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: curricula.length,
      Beginner: 0,
      Intermediate: 0,
      Advanced: 0,
      Expert: 0
    };
    curricula.forEach((c) => {
      const diff = c.difficulty || 'Intermediate';
      if (counts[diff] !== undefined) {
        counts[diff]++;
      }
    });
    return counts;
  }, [curricula]);

  // Filtered Curricula
  const filteredCurricula = useMemo(() => {
    return curricula.filter((doc) => {
      // Difficulty filter
      if (selectedDifficulty !== 'all') {
        const docDiff = doc.difficulty || 'Intermediate';
        if (docDiff !== selectedDifficulty) return false;
      }

      // Language filter
      if (selectedLanguage !== 'all') {
        if (!doc.programmingLanguages || !doc.programmingLanguages.includes(selectedLanguage)) {
          return false;
        }
      }

      // Tag filter
      if (selectedTag !== 'all') {
        if (!doc.tags || !doc.tags.includes(selectedTag)) {
          return false;
        }
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = doc.title.toLowerCase().includes(q);
        const matchesSubject = doc.subject.toLowerCase().includes(q);
        const matchesSubtitle = doc.subtitle?.toLowerCase().includes(q) || false;
        const matchesLang = doc.programmingLanguages?.some(l => l.toLowerCase().includes(q)) || false;
        const matchesTag = doc.tags?.some(t => t.toLowerCase().includes(q)) || false;
        return matchesTitle || matchesSubject || matchesSubtitle || matchesLang || matchesTag;
      }

      return true;
    });
  }, [curricula, selectedDifficulty, selectedLanguage, selectedTag, searchQuery]);

  const hasActiveFilters = selectedDifficulty !== 'all' || selectedLanguage !== 'all' || selectedTag !== 'all' || searchQuery.trim() !== '';

  const handleClearFilters = () => {
    setSelectedDifficulty('all');
    setSelectedLanguage('all');
    setSelectedTag('all');
    setSearchQuery('');
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
      {/* Top Banner / Bar Header */}
      <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/70 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <FolderGit2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight">
                Saved Curriculum Projects & Tags Hub
              </h2>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-purple-300 font-semibold border border-slate-700">
                {filteredCurricula.length} of {curricula.length}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Filter student projects by programming language, difficulty level, and custom tags.
            </p>
          </div>
        </div>

        {/* Toggle Collapse & Filter Reset Actions */}
        <div className="flex items-center gap-2 self-end md:self-center">
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="text-xs px-2.5 py-1 text-purple-400 hover:text-purple-300 hover:bg-purple-950/40 rounded-lg border border-purple-800/40 transition flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear Filters</span>
            </button>
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            title={isExpanded ? 'Collapse Projects Hub' : 'Expand Projects Hub'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 sm:p-5 space-y-4">
          
          {/* Filter Controls Row */}
          <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
            
            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search projects by title, language, or #tag..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder:text-slate-500 focus:border-purple-500 focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Dropdown Filters: Programming Language & Tags */}
            <div className="flex items-center gap-2 flex-wrap">
              
              {/* Programming Language Filter Dropdown */}
              <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800 text-xs">
                <Code className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-slate-400 text-[11px]">Language:</span>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer font-mono"
                >
                  <option value="all" className="bg-slate-900 text-slate-200">All Languages ({allLanguages.length})</option>
                  {allLanguages.map((lang) => (
                    <option key={lang} value={lang} className="bg-slate-900 text-slate-200">
                      {lang}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tag Filter Dropdown */}
              {allTags.length > 0 && (
                <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800 text-xs">
                  <Tag className="w-3.5 h-3.5 text-purple-400" />
                  <span className="text-slate-400 text-[11px]">Tag:</span>
                  <select
                    value={selectedTag}
                    onChange={(e) => setSelectedTag(e.target.value)}
                    className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer"
                  >
                    <option value="all" className="bg-slate-900 text-slate-200">All Tags ({allTags.length})</option>
                    {allTags.map((t) => (
                      <option key={t} value={t} className="bg-slate-900 text-slate-200">
                        #{t}
                      </option>
                    ))}
                  </select>
                </div>
              )}

            </div>
          </div>

          {/* Difficulty Level Filter Chips */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <GraduationCap className="w-3 h-3 text-purple-400" />
                <span>Difficulty Level Filter</span>
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                Click level to isolate projects
              </span>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
              {/* All Levels Chip */}
              <button
                type="button"
                onClick={() => setSelectedDifficulty('all')}
                className={`px-3 py-1 rounded-xl text-xs font-medium transition whitespace-nowrap flex items-center gap-1.5 ${
                  selectedDifficulty === 'all'
                    ? 'bg-purple-600 text-white font-semibold shadow-xs'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                <span>All Levels</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  selectedDifficulty === 'all' ? 'bg-purple-800 text-white' : 'bg-slate-900 text-slate-400'
                }`}>
                  {difficultyCounts.all}
                </span>
              </button>

              {/* Individual Difficulty Level Chips */}
              {(['Beginner', 'Intermediate', 'Advanced', 'Expert'] as DifficultyLevel[]).map((level) => {
                const config = DIFFICULTY_BADGES[level];
                const isSelected = selectedDifficulty === level;
                const count = difficultyCounts[level] || 0;
                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setSelectedDifficulty(isSelected ? 'all' : level)}
                    className={`px-3 py-1 rounded-xl text-xs font-medium transition whitespace-nowrap flex items-center gap-1.5 border select-none ${
                      isSelected
                        ? `${config.badgeClass} ring-1 ring-purple-400/80 font-bold shadow-sm`
                        : 'bg-slate-950 text-slate-400 hover:text-slate-200 border-slate-800'
                    }`}
                  >
                    <span>{config.icon}</span>
                    <span>{config.label}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isSelected ? 'bg-slate-900/60' : 'bg-slate-900 text-slate-400'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Projects Cards Grid */}
          <div className="pt-2">
            {filteredCurricula.length === 0 ? (
              <div className="p-8 text-center bg-slate-950/60 rounded-xl border border-dashed border-slate-800 space-y-2">
                <FolderGit2 className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-300 font-medium">No curriculum projects match the selected filters.</p>
                <p className="text-[11px] text-slate-500">
                  Try clearing your search query, changing the difficulty level, or selecting another language.
                </p>
                <button
                  onClick={handleClearFilters}
                  className="mt-2 text-xs px-3 py-1 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 rounded-lg border border-purple-500/30 transition inline-flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Reset All Filters</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredCurricula.map((doc) => {
                  const isActive = activeCurriculumId === doc.id;
                  const diff = doc.difficulty || 'Intermediate';
                  const diffConfig = DIFFICULTY_BADGES[diff];

                  return (
                    <div
                      key={doc.id}
                      onClick={() => onSelectCurriculum(doc.id)}
                      className={`p-3.5 rounded-xl border transition flex flex-col justify-between gap-3 cursor-pointer group select-none relative ${
                        isActive
                          ? 'bg-purple-950/30 border-purple-500 shadow-md ring-1 ring-purple-500/40'
                          : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                      }`}
                    >
                      {/* Card Header */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-[10px] uppercase font-semibold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20 truncate">
                            {doc.subject}_*.html
                          </span>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {/* Difficulty Badge */}
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border flex items-center gap-1 ${diffConfig.badgeClass}`}>
                              <span>{diffConfig.icon}</span>
                              <span>{diffConfig.label}</span>
                            </span>

                            {/* Active Indicator */}
                            {isActive && (
                              <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" title="Active Project" />
                            )}
                          </div>
                        </div>

                        <h3 className="text-xs font-bold text-white group-hover:text-purple-300 transition line-clamp-1">
                          {doc.title}
                        </h3>

                        <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                          {doc.subtitle || `${doc.chapters?.length || 0} Chapters`}
                        </p>
                      </div>

                      {/* Card Footer: Programming Languages & Tags */}
                      <div className="space-y-2 pt-2 border-t border-slate-800/80 text-[11px]">
                        
                        {/* Programming Languages */}
                        {doc.programmingLanguages && doc.programmingLanguages.length > 0 && (
                          <div className="flex items-center gap-1 flex-wrap">
                            <Code className="w-3 h-3 text-slate-500 shrink-0" />
                            {doc.programmingLanguages.slice(0, 3).map((l) => (
                              <span
                                key={l}
                                className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-slate-900 text-slate-300 border border-slate-800"
                              >
                                {l}
                              </span>
                            ))}
                            {doc.programmingLanguages.length > 3 && (
                              <span className="text-[10px] text-slate-500 font-mono">
                                +{doc.programmingLanguages.length - 3}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Custom Topic Tags */}
                        {doc.tags && doc.tags.length > 0 && (
                          <div className="flex items-center gap-1 flex-wrap">
                            <Tag className="w-3 h-3 text-purple-400/70 shrink-0" />
                            {doc.tags.slice(0, 2).map((t) => (
                              <span
                                key={t}
                                className="text-[10px] px-1.5 py-0.2 rounded bg-purple-950/50 text-purple-300 border border-purple-800/30"
                              >
                                #{t}
                              </span>
                            ))}
                            {doc.tags.length > 2 && (
                              <span className="text-[10px] text-purple-400/80 font-mono">
                                +{doc.tags.length - 2}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Card Actions */}
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[10px] text-slate-500 font-mono">
                            {doc.sourceType === 'preset' ? 'Built-in Academy' : 'Generated Project'}
                          </span>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onOpenTagModal(doc);
                              }}
                              className="p-1 text-slate-400 hover:text-purple-300 hover:bg-slate-800 rounded transition"
                              title="Edit Tags & Difficulty Level"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            {doc.sourceType !== 'preset' && onDeleteCurriculum && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (confirm(`Remove saved curriculum "${doc.title}"?`)) {
                                    onDeleteCurriculum(doc.id);
                                  }
                                }}
                                className="p-1 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded transition"
                                title="Delete Project"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
};
