import React, { useState, useRef } from 'react';
import { 
  Sparkles, 
  FileText, 
  Copy, 
  Check, 
  Download, 
  Eye, 
  FolderPlus, 
  Layers, 
  Globe, 
  Upload, 
  ArrowRight,
  Code2,
  Trash2,
  BookOpen,
  FileArchive,
  RefreshCw,
  CheckCircle2,
  X,
  SlidersHorizontal,
  Archive,
  Search,
  Filter
} from 'lucide-react';
import { 
  CurriculumDocument, 
  BreadcrumbItem, 
  CurriculumChapter, 
  AIAgentProvider 
} from '../types';
import { 
  PROGRAMMING_LANGUAGES, 
  SUPPORTED_LANGUAGES,
  generateCurriculumWithAI,
  mergeExternalBreadcrumbs
} from '../services/aiGateway';
import { 
  generateLanguageHtmlDocument, 
  generateSubjectReadme, 
  generateConsolidatedReadme,
  downloadZipArchive
} from '../services/htmlGenerator';
import { PRESET_CURRICULA } from '../services/sampleCurricula';

interface CurriculumGeneratorComponentProps {
  onTransmitToAgent: (prompt: string) => void;
  onOpenPreview: (doc: CurriculumDocument, lang: string) => void;
  incomingTopicText?: string;
}

export const CurriculumGeneratorComponent: React.FC<CurriculumGeneratorComponentProps> = ({
  onTransmitToAgent,
  onOpenPreview,
  incomingTopicText = ''
}) => {
  // Input State
  const [subject, setSubject] = useState<string>('cloud_devops');
  const [rawInput, setRawInput] = useState<string>(
    incomingTopicText ||
    `Topics: High-Throughput Distributed Message Streaming Engine\nObjectives: Build a concurrent, distributed event streaming engine in Go and Rust with persistent write-ahead logs (WAL), zero-copy network sockets via splice/sendfile, and client SDKs in TypeScript and Python.`
  );
  const [selectedLangs, setSelectedLangs] = useState<string[]>(['Go', 'Rust', 'TypeScript', 'Python']);
  const [selectedTargetAI, setSelectedTargetAI] = useState<AIAgentProvider>('Google AI Studio');

  // Curricula Collection State (initialized with presets)
  const [curricula, setCurricula] = useState<CurriculumDocument[]>(PRESET_CURRICULA);
  const [activeCurriculumId, setActiveCurriculumId] = useState<string>(PRESET_CURRICULA[0].id);

  // Target Curriculum Languages Selection for Generation (19 Languages) - Default to English only rather than all by default
  const [selectedGenLangs, setSelectedGenLangs] = useState<string[]>(['en']);
  const [genLangSearch, setGenLangSearch] = useState<string>('');

  // Status & UI State
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedPromptId, setCopiedPromptId] = useState<number | null>(null);
  const [previewLang, setPreviewLang] = useState<string>('en');

  // Preview Language Filter State
  const [previewCategoryFilter, setPreviewCategoryFilter] = useState<'all' | 'available' | 'un' | 'european' | 'asian_indic' | 'rtl'>('all');
  const [previewSearchQuery, setPreviewSearchQuery] = useState<string>('');

  // ZIP Export State
  const [isExportingZip, setIsExportingZip] = useState<boolean>(false);
  const [zipProgress, setZipProgress] = useState<number>(0);
  const [zipCurrentFile, setZipCurrentFile] = useState<string | null>(null);
  const [zipExportResult, setZipExportResult] = useState<{ filename: string; totalFiles: number; sizeBytes: number } | null>(null);
  const [zipStatus, setZipStatus] = useState<string | null>(null);
  const [showZipModal, setShowZipModal] = useState<boolean>(false);
  const [selectedExportLangs, setSelectedExportLangs] = useState<string[]>(SUPPORTED_LANGUAGES.map(l => l.code));

  // File Upload Ref
  const outlineFileInputRef = useRef<HTMLInputElement>(null);
  const folderUploadRef = useRef<HTMLInputElement>(null);

  // Sync incomingTopicText if sent from Component 1
  React.useEffect(() => {
    if (incomingTopicText) {
      setRawInput(incomingTopicText);
    }
  }, [incomingTopicText]);

  const activeDocument = curricula.find(c => c.id === activeCurriculumId) || curricula[0];

  // Derive master breadcrumb list across all curricula
  const masterBreadcrumbs: BreadcrumbItem[] = curricula.map(c => ({
    id: c.id,
    subject: c.subject,
    title: c.title,
    href: `${c.subject}_en.html`
  }));

  const toggleLanguage = (lang: string) => {
    setSelectedLangs(prev => 
      prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]
    );
  };

  // Target Generation Language Handlers
  const toggleGenLanguage = (code: string) => {
    setSelectedGenLangs(prev => 
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  const setGenLangsPreset = (preset: 'all' | 'en' | 'un' | 'european' | 'asian_indic' | 'rtl') => {
    switch (preset) {
      case 'all':
        setSelectedGenLangs(SUPPORTED_LANGUAGES.map(l => l.code));
        break;
      case 'en':
        setSelectedGenLangs(['en']);
        break;
      case 'un':
        setSelectedGenLangs(['en', 'fr', 'es', 'ru', 'zh', 'ar']);
        break;
      case 'european':
        setSelectedGenLangs(['en', 'fr', 'de', 'it', 'es', 'pt', 'ru', 'tr']);
        break;
      case 'asian_indic':
        setSelectedGenLangs(['en', 'zh', 'ja', 'hi', 'ur', 'bn', 'mr', 'ta', 'te', 'id']);
        break;
      case 'rtl':
        setSelectedGenLangs(['en', 'ar', 'ur']);
        break;
    }
  };

  // Filtered languages for generation selection grid
  const filteredGenLanguages = React.useMemo(() => {
    if (!genLangSearch.trim()) return SUPPORTED_LANGUAGES;
    const q = genLangSearch.toLowerCase();
    return SUPPORTED_LANGUAGES.filter(lang => 
      lang.code.toLowerCase().includes(q) ||
      lang.name.toLowerCase().includes(q) ||
      lang.native.toLowerCase().includes(q)
    );
  }, [genLangSearch]);

  // Derived available translated languages in the active document
  const availableLanguagesInDoc = React.useMemo(() => {
    const set = new Set<string>(['en']);
    if (activeDocument && activeDocument.chapters) {
      activeDocument.chapters.forEach(ch => {
        if (ch.translations) {
          Object.keys(ch.translations).forEach(k => set.add(k));
        }
      });
    }
    return set;
  }, [activeDocument]);

  // Filtered languages for preview ribbon
  const filteredPreviewLanguages = React.useMemo(() => {
    return SUPPORTED_LANGUAGES.filter(lang => {
      // Category filter
      if (previewCategoryFilter === 'available' && !availableLanguagesInDoc.has(lang.code)) {
        return false;
      }
      if (previewCategoryFilter === 'un' && !['en', 'fr', 'es', 'ru', 'zh', 'ar'].includes(lang.code)) {
        return false;
      }
      if (previewCategoryFilter === 'european' && !['en', 'fr', 'de', 'it', 'es', 'pt', 'ru', 'tr'].includes(lang.code)) {
        return false;
      }
      if (previewCategoryFilter === 'asian_indic' && !['en', 'zh', 'ja', 'hi', 'ur', 'bn', 'mr', 'ta', 'te', 'id'].includes(lang.code)) {
        return false;
      }
      if (previewCategoryFilter === 'rtl' && !['ar', 'ur'].includes(lang.code)) {
        return false;
      }

      // Search filter
      if (previewSearchQuery.trim()) {
        const q = previewSearchQuery.toLowerCase();
        const matchesCode = lang.code.toLowerCase().includes(q);
        const matchesName = lang.name.toLowerCase().includes(q);
        const matchesNative = lang.native.toLowerCase().includes(q);
        return matchesCode || matchesName || matchesNative;
      }

      return true;
    });
  }, [previewCategoryFilter, previewSearchQuery, availableLanguagesInDoc]);

  const handleOutlineFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setRawInput(text);
      // Infer subject if file name is meaningful
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
      if (cleanName && cleanName !== 'untitled') {
        setSubject(cleanName);
      }
    };
    reader.readAsText(file);
  };

  const handleFolderUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      const detectedFiles: { name: string; content: string }[] = [];
      const subjectsFound = new Set<string>();

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.name.endsWith('.html')) {
          const text = await file.text();
          detectedFiles.push({ name: file.name, content: text });
          const parts = file.name.replace('.html', '').split('_');
          if (parts.length >= 2) {
            subjectsFound.add(parts[0]);
          }
        }
      }

      if (detectedFiles.length > 0) {
        alert(`Successfully scanned ${detectedFiles.length} HTML files from ${subjectsFound.size} subjects! They have been merged into the breadcrumb index.`);
      }
    } catch (err: any) {
      alert('Error parsing uploaded folder: ' + err.message);
    }
  };

  const handleGenerateCurriculum = async () => {
    if (!rawInput.trim()) {
      setErrorMsg('Please input at least one Topic or Objective.');
      return;
    }

    setErrorMsg(null);
    setIsGenerating(true);

    try {
      const newDoc = await generateCurriculumWithAI(
        subject || 'student_curriculum',
        rawInput,
        selectedLangs,
        selectedTargetAI,
        selectedGenLangs
      );

      // Add to state and make active
      setCurricula(prev => [newDoc, ...prev.filter(c => c.id !== newDoc.id)]);
      setActiveCurriculumId(newDoc.id);

      // Update export langs default to match generation selection
      setSelectedExportLangs(selectedGenLangs);

      // Focus on active preview language if in selection, otherwise first selected language
      if (!selectedGenLangs.includes(previewLang)) {
        setPreviewLang(selectedGenLangs[0] || 'en');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to generate curriculum. Please retry.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyPrompt = (promptText: string, chapterId: number) => {
    navigator.clipboard.writeText(promptText);
    setCopiedPromptId(chapterId);
    setTimeout(() => setCopiedPromptId(null), 2000);
  };

  const handleExportZip = async (customLangs?: string[]) => {
    if (!activeDocument) return;
    const langsToExport = customLangs || selectedExportLangs;
    setIsExportingZip(true);
    setZipProgress(0);
    setZipCurrentFile(null);
    setZipExportResult(null);
    setZipStatus(`Packaging ${langsToExport.length} HTML variants + READMEs into compressed ZIP...`);

    try {
      const result = await downloadZipArchive(activeDocument, masterBreadcrumbs, {
        languages: langsToExport,
        includeReadmes: true,
        includeManifest: true,
        onProgress: (percent, currentFile) => {
          setZipProgress(percent);
          if (currentFile) setZipCurrentFile(currentFile);
        }
      });

      setZipExportResult(result);
      setZipStatus(`Successfully exported ${result.filename} (${result.totalFiles} files, ${(result.sizeBytes / 1024).toFixed(1)} KB)`);
      setTimeout(() => {
        setZipStatus(null);
      }, 5000);
    } catch (err: any) {
      setZipStatus('Export failed: ' + err.message);
      setTimeout(() => setZipStatus(null), 5000);
    } finally {
      setIsExportingZip(false);
    }
  };

  const handleToggleAllExportLangs = () => {
    if (selectedExportLangs.length === SUPPORTED_LANGUAGES.length) {
      setSelectedExportLangs(['en']);
    } else {
      setSelectedExportLangs(SUPPORTED_LANGUAGES.map(l => l.code));
    }
  };

  const handleToggleSingleExportLang = (code: string) => {
    setSelectedExportLangs(prev => 
      prev.includes(code)
        ? (prev.length > 1 ? prev.filter(c => c !== code) : prev)
        : [...prev, code]
    );
  };

  const handleDownloadSingleLang = (langCode: string) => {
    if (!activeDocument) return;
    const htmlContent = generateLanguageHtmlDocument(activeDocument, langCode, masterBreadcrumbs);
    const filename = `${activeDocument.subject}_${langCode}.html`;
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      
      {/* Component Title & Breadcrumb Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Component 2
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Topics, Objectives & 19-Language HTML Generator
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Input Topics or Objectives to generate linked HTML curriculum documents in 19 languages with clickable &ldquo;Copy&rdquo; buttons.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Upload Previous Work Folder */}
            <input
              type="file"
              // @ts-ignore
              webkitdirectory=""
              directory=""
              multiple
              ref={folderUploadRef}
              onChange={handleFolderUpload}
              className="hidden"
            />
            <button
              onClick={() => folderUploadRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition"
              title="Upload previous folder containing AIprompt_*.html, Advanced_*.html, etc."
            >
              <FolderPlus className="w-3.5 h-3.5 text-purple-400" />
              <span>Merge Previous Folder</span>
            </button>

            {/* Quick Presets Dropdown */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
              <span className="text-slate-400 px-1 text-[11px]">Presets:</span>
              {PRESET_CURRICULA.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => {
                    setActiveCurriculumId(preset.id);
                    setSubject(preset.subject);
                  }}
                  className={`px-2 py-1 rounded text-xs transition font-mono ${
                    activeCurriculumId === preset.id
                      ? 'bg-purple-600 text-white font-semibold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {preset.subject}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Generation Workspace: Input Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Form: Topic / Objective Inputs (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-400" />
              1. Input Topics & Objectives
            </h2>

            {/* Subject Name Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Subject Name (determines filename prefix: [subject]_*.html)
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                placeholder="e.g. cloud_devops, cybersecurity, AIprompt"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-purple-300 focus:border-purple-500 focus:outline-none"
              />
            </div>

            {/* Target AI Engine */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Target AI for Prompts
              </label>
              <select
                value={selectedTargetAI}
                onChange={(e) => setSelectedTargetAI(e.target.value as AIAgentProvider)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:border-purple-500 focus:outline-none"
              >
                <option value="Google AI Studio">Google AI Studio (Gemini 3.8 Flash)</option>
                <option value="Claude Code">Claude Code (Anthropic)</option>
                <option value="Cursor">Cursor (Composer / Shadow)</option>
                <option value="GitHub Copilot">GitHub Copilot</option>
                <option value="Windsurf">Windsurf (Cascade)</option>
              </select>
            </div>

            {/* Programming Languages Multi-Select */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Target Programming Languages ({selectedLangs.length} selected)
              </label>
              <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto p-2 bg-slate-950 rounded-lg border border-slate-800">
                {PROGRAMMING_LANGUAGES.map((lang) => {
                  const isSelected = selectedLangs.includes(lang);
                  return (
                    <button
                      key={lang}
                      onClick={() => toggleLanguage(lang)}
                      className={`px-2 py-0.5 rounded text-[11px] font-mono transition ${
                        isSelected
                          ? 'bg-purple-600 text-white font-semibold'
                          : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {lang}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Target Curriculum Languages to Generate (Selective Checkbox Multi-Select Control) */}
            <div className="space-y-2.5 p-3.5 bg-slate-950/70 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-purple-400" />
                    <span>Selective Language Generation ({selectedGenLangs.length} of 19)</span>
                  </label>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Check which languages to synthesize. Defaults to English only to minimize token usage and generation time.
                  </p>
                </div>
                <span className={`text-[11px] font-mono px-2 py-0.5 rounded font-semibold border ${
                  selectedGenLangs.length === 1 && selectedGenLangs.includes('en')
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : selectedGenLangs.length === SUPPORTED_LANGUAGES.length
                    ? 'bg-purple-500/10 border-purple-500/30 text-purple-300'
                    : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300'
                }`}>
                  {selectedGenLangs.length === 1 && selectedGenLangs.includes('en')
                    ? '1 (English Only)'
                    : selectedGenLangs.length === SUPPORTED_LANGUAGES.length
                    ? 'All 19 Selected'
                    : `${selectedGenLangs.length} Selected`}
                </span>
              </div>

              {/* Master Checkbox Actions & Regional Presets */}
              <div className="flex items-center justify-between gap-2 flex-wrap pt-1 border-t border-slate-800/80">
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs text-slate-300 hover:text-white font-medium">
                    <input
                      type="checkbox"
                      checked={selectedGenLangs.length === SUPPORTED_LANGUAGES.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setGenLangsPreset('all');
                        } else {
                          setGenLangsPreset('en');
                        }
                      }}
                      className="w-3.5 h-3.5 accent-purple-500 rounded border-slate-700 bg-slate-900 cursor-pointer"
                    />
                    <span>Select All (19)</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => setGenLangsPreset('en')}
                    className={`text-[11px] px-2 py-0.5 rounded border transition ${
                      selectedGenLangs.length === 1 && selectedGenLangs.includes('en')
                        ? 'bg-purple-600 text-white border-purple-500 font-semibold'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    English Only (Default)
                  </button>
                </div>

                {/* Regional Group Quick Presets */}
                <div className="flex items-center gap-1 text-[11px] flex-wrap">
                  <span className="text-slate-500 text-[10px] uppercase font-semibold">Presets:</span>
                  <button
                    type="button"
                    onClick={() => setGenLangsPreset('un')}
                    className="px-1.5 py-0.5 rounded border text-[10px] bg-slate-900 text-slate-400 border-slate-800 hover:text-white transition"
                    title="UN Official: English, French, Spanish, Russian, Chinese, Arabic"
                  >
                    UN (6)
                  </button>
                  <button
                    type="button"
                    onClick={() => setGenLangsPreset('european')}
                    className="px-1.5 py-0.5 rounded border text-[10px] bg-slate-900 text-slate-400 border-slate-800 hover:text-white transition"
                    title="European: EN, FR, DE, IT, ES, PT, RU, TR"
                  >
                    European (8)
                  </button>
                  <button
                    type="button"
                    onClick={() => setGenLangsPreset('asian_indic')}
                    className="px-1.5 py-0.5 rounded border text-[10px] bg-slate-900 text-slate-400 border-slate-800 hover:text-white transition"
                    title="Asian & Indic: EN, ZH, JA, HI, UR, BN, MR, TA, TE, ID"
                  >
                    Asian & Indic (10)
                  </button>
                </div>
              </div>

              {/* Search filter for selection checkboxes */}
              <div className="relative">
                <Search className="w-3 h-3 text-slate-500 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={genLangSearch}
                  onChange={(e) => setGenLangSearch(e.target.value)}
                  placeholder="Filter 19 languages (e.g. Spanish, German, ja, Arabic)..."
                  className="w-full pl-7 pr-7 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-[11px] text-slate-300 placeholder-slate-500 focus:border-purple-500 focus:outline-none"
                />
                {genLangSearch && (
                  <button
                    type="button"
                    onClick={() => setGenLangSearch('')}
                    className="absolute right-2 top-2 text-slate-500 hover:text-slate-300"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Checkbox Multi-Select Grid for the 19 Supported Languages */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5 max-h-48 overflow-y-auto p-2 bg-slate-900/90 rounded-lg border border-slate-800/90 scrollbar-thin">
                {filteredGenLanguages.map((lang) => {
                  const isSelected = selectedGenLangs.includes(lang.code);
                  const isEnglish = lang.code === 'en';
                  return (
                    <label
                      key={lang.code}
                      htmlFor={`gen-lang-check-${lang.code}`}
                      className={`flex items-center gap-2 p-1.5 rounded-lg text-xs cursor-pointer transition border select-none ${
                        isSelected
                          ? 'bg-purple-950/40 border-purple-600/60 text-white font-medium shadow-xs'
                          : 'bg-slate-950/70 border-slate-800/70 text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                      }`}
                      title={`${lang.name} (${lang.native})`}
                    >
                      <input
                        type="checkbox"
                        id={`gen-lang-check-${lang.code}`}
                        checked={isSelected}
                        onChange={() => toggleGenLanguage(lang.code)}
                        className="w-3.5 h-3.5 accent-purple-500 rounded border-slate-700 bg-slate-900 cursor-pointer shrink-0"
                      />
                      <span className="font-mono text-[10px] text-purple-300 bg-purple-950/80 px-1 py-0.5 rounded uppercase shrink-0 border border-purple-800/40">
                        {lang.code}
                      </span>
                      <span className="text-[11px] truncate flex-1 font-medium">
                        {lang.name}
                        {isEnglish && <span className="text-[10px] text-emerald-400 ml-1 font-normal">(Primary)</span>}
                      </span>
                      <span className="text-[10px] text-slate-500 font-sans hidden sm:inline truncate max-w-[60px]">
                        {lang.native}
                      </span>
                    </label>
                  );
                })}
              </div>

              {selectedGenLangs.length === 0 && (
                <div className="text-[11px] text-amber-400 bg-amber-500/10 border border-amber-500/20 p-2 rounded-lg flex items-center gap-1.5">
                  <span>⚠️ Please check at least one language to generate your curriculum.</span>
                </div>
              )}
            </div>

            {/* Main Textarea for Topics/Objectives */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300">
                  Topics:/Objectives: or Objectives: only
                </label>
                <input
                  type="file"
                  ref={outlineFileInputRef}
                  onChange={handleOutlineFileUpload}
                  accept=".txt,.md,.mdx,.json"
                  className="hidden"
                />
                <button
                  onClick={() => outlineFileInputRef.current?.click()}
                  className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1"
                >
                  <Upload className="w-3 h-3" /> Upload .txt / .md
                </button>
              </div>
              <textarea
                rows={7}
                value={rawInput}
                onChange={(e) => setRawInput(e.target.value)}
                placeholder="Topics: Microservice Ingestion & Security
Objectives: Build a concurrent pipeline in Go or Rust processing ERP transaction streams into SQL and flagging irregularities under ISA 240."
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-200 focus:border-purple-500 focus:outline-none resize-y"
              />
            </div>

            {/* Action Buttons */}
            {errorMsg && (
              <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">
                {errorMsg}
              </div>
            )}

            <button
              onClick={handleGenerateCurriculum}
              disabled={isGenerating || !rawInput.trim() || selectedGenLangs.length === 0}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold rounded-xl text-xs sm:text-sm transition shadow-lg shadow-purple-900/30"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Generating Prompts & {selectedGenLangs.length} Language{selectedGenLangs.length > 1 ? 's' : ''}...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>
                    {selectedGenLangs.length === 0 ? (
                      'Select At Least 1 Language'
                    ) : selectedGenLangs.length === 1 ? (
                      `Generate Curriculum (${SUPPORTED_LANGUAGES.find(l => l.code === selectedGenLangs[0])?.name || selectedGenLangs[0]} Only)`
                    ) : selectedGenLangs.length === SUPPORTED_LANGUAGES.length ? (
                      'Generate All 19 Languages'
                    ) : (
                      `Generate Curriculum (${selectedGenLangs.length} Selected Languages)`
                    )}
                  </span>
                </>
              )}
            </button>
          </div>

          {/* Document Suite Export Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <FileArchive className="w-3.5 h-3.5 text-purple-400" />
                <span>Linked 19-Language HTML Suite</span>
              </h3>
              <span className="text-purple-400 font-mono text-[11px] bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                19 Files + README
              </span>
            </div>

            <p className="text-xs text-slate-400">
              Export standalone, linked HTML files for each language with clickable Copy buttons, breadcrumb navigation, and complete language translation into a single compressed ZIP.
            </p>

            {/* Real-time compression progress bar */}
            {isExportingZip && (
              <div className="space-y-1.5 p-3 rounded-xl bg-purple-950/40 border border-purple-800/40">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-purple-300 font-medium flex items-center gap-1.5">
                    <RefreshCw className="w-3 h-3 animate-spin text-purple-400" />
                    Compressing with JSZip...
                  </span>
                  <span className="font-mono text-purple-300 font-bold">{zipProgress}%</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-cyan-400 h-full transition-all duration-150 rounded-full"
                    style={{ width: `${zipProgress}%` }}
                  />
                </div>
                {zipCurrentFile && (
                  <div className="text-[10px] text-slate-400 font-mono truncate">
                    Adding: {zipCurrentFile}
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => handleExportZip()}
                disabled={isExportingZip}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition shadow-lg shadow-purple-900/30"
                title="Export current document and all 19 language variants as a compressed ZIP file"
              >
                {isExportingZip ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Compressing...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>Export ZIP Archive</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setShowZipModal(true)}
                disabled={isExportingZip}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-slate-800 hover:bg-slate-750 text-slate-200 rounded-xl text-xs font-medium border border-slate-700 transition"
                title="Configure custom language variants to include in ZIP"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-purple-400" />
                <span>Options & Variants</span>
              </button>
            </div>

            {/* Status & Confirmation Banner */}
            {zipStatus && (
              <div className="text-[11px] p-2.5 bg-purple-500/10 border border-purple-500/30 rounded-xl text-purple-200 flex items-start gap-2 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <span className="leading-snug">{zipStatus}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Area: Active Curriculum Viewer (7 cols on lg) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Active Document Header Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-3 shadow-xl">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div>
                <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 uppercase">
                  {activeDocument.subject}_*.html
                </span>
                <h2 className="text-lg sm:text-xl font-bold text-white mt-1.5">
                  {activeDocument.title}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {activeDocument.subtitle} • {activeDocument.chapters.length} Chapters
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => onOpenPreview(activeDocument, previewLang)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition"
                  title="Open in-browser responsive previewer"
                >
                  <Eye className="w-3.5 h-3.5 text-purple-400" /> Preview HTML
                </button>

                <button
                  onClick={() => handleExportZip()}
                  disabled={isExportingZip}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition shadow shadow-purple-900/40"
                  title="Export current document and all 19 language variants as a compressed ZIP file"
                >
                  {isExportingZip ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>{zipProgress}%</span>
                    </>
                  ) : (
                    <>
                      <FileArchive className="w-3.5 h-3.5" />
                      <span>Export ZIP Archive</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* 19-Language Selector Tabs for Live Preview with Filtering */}
            <div className="pt-3 border-t border-slate-800/80 space-y-2.5">
              {/* Filter bar and search controls */}
              <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-slate-400 flex items-center gap-1 text-xs font-semibold">
                    <Filter className="w-3.5 h-3.5 text-purple-400" />
                    <span>Filter Languages:</span>
                  </span>
                  {/* Category Filter Pills */}
                  {(['all', 'available', 'un', 'european', 'asian_indic', 'rtl'] as const).map((cat) => {
                    const labels: Record<string, string> = {
                      all: `All (19)`,
                      available: `In Doc (${availableLanguagesInDoc.size})`,
                      un: 'UN (6)',
                      european: 'European (8)',
                      asian_indic: 'Asian & Indic (10)',
                      rtl: 'RTL (2)'
                    };
                    const isActive = previewCategoryFilter === cat;
                    return (
                      <button
                        key={cat}
                        onClick={() => setPreviewCategoryFilter(cat)}
                        className={`px-2 py-0.5 rounded-full text-[11px] transition ${
                          isActive
                            ? 'bg-purple-600 text-white font-semibold shadow-xs'
                            : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                        }`}
                      >
                        {labels[cat]}
                      </button>
                    );
                  })}
                </div>

                {/* Search & Download single file button */}
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="relative">
                    <Search className="w-3 h-3 text-slate-500 absolute left-2 top-2" />
                    <input
                      type="text"
                      value={previewSearchQuery}
                      onChange={(e) => setPreviewSearchQuery(e.target.value)}
                      placeholder="Search language..."
                      className="pl-6 pr-6 py-1 bg-slate-950 border border-slate-800 rounded-lg text-[11px] text-slate-300 placeholder-slate-500 focus:border-purple-500 focus:outline-none w-32 sm:w-40"
                    />
                    {previewSearchQuery && (
                      <button
                        onClick={() => setPreviewSearchQuery('')}
                        className="absolute right-1.5 top-1.5 text-slate-500 hover:text-slate-300"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => handleDownloadSingleLang(previewLang)}
                    className="text-purple-400 hover:text-purple-300 text-[11px] flex items-center gap-1 font-mono whitespace-nowrap"
                    title={`Download standalone ${activeDocument.subject}_${previewLang}.html`}
                  >
                    <Download className="w-3 h-3" /> {activeDocument.subject}_{previewLang}.html
                  </button>
                </div>
              </div>

              {/* Filtered 19-Language Tabs Ribbon */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-thin">
                  {filteredPreviewLanguages.length === 0 ? (
                    <div className="text-[11px] text-slate-500 italic py-1 px-2">
                      No languages match your filter.
                      <button
                        onClick={() => { setPreviewCategoryFilter('all'); setPreviewSearchQuery(''); }}
                        className="ml-2 text-purple-400 hover:underline"
                      >
                        Reset filter
                      </button>
                    </div>
                  ) : (
                    filteredPreviewLanguages.map((lang) => {
                      const isSelected = previewLang === lang.code;
                      const isAvailable = availableLanguagesInDoc.has(lang.code);
                      return (
                        <button
                          key={lang.code}
                          onClick={() => setPreviewLang(lang.code)}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono transition whitespace-nowrap ${
                            isSelected
                              ? 'bg-purple-600 text-white font-bold shadow-sm'
                              : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                          }`}
                          title={`${lang.name} (${lang.native}) - ${isAvailable ? 'Translated in this document' : 'Falls back to English'}`}
                        >
                          <span>{lang.code.toUpperCase()}</span>
                          {isAvailable && (
                            <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-cyan-300' : 'bg-emerald-400'}`} />
                          )}
                        </button>
                      );
                    })
                  )}
                </div>

                {/* Current Active Language Banner Info */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 px-0.5">
                  <span className="flex items-center gap-2">
                    <span>
                      Active Preview: <strong className="text-purple-300">{SUPPORTED_LANGUAGES.find(l => l.code === previewLang)?.name || previewLang}</strong> ({previewLang.toUpperCase()})
                    </span>
                    {availableLanguagesInDoc.has(previewLang) ? (
                      <span className="text-emerald-400 text-[10px] flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        Full Translation
                      </span>
                    ) : (
                      <span className="text-amber-400 text-[10px] flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        English fallback
                      </span>
                    )}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Showing {filteredPreviewLanguages.length} of {SUPPORTED_LANGUAGES.length} languages
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Chapters List */}
          <div className="space-y-4">
            {activeDocument.chapters.map((chapter) => {
              const langData = previewLang !== 'en' ? chapter.translations?.[previewLang] : null;
              const displayTopic = langData?.topic || chapter.topic;
              const displayObjective = langData?.objective || chapter.objective;
              const displayTitle = langData?.title || chapter.title;

              return (
                <div
                  key={chapter.id}
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 sm:p-5 space-y-3 shadow-lg transition"
                >
                  {/* Chapter Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 font-mono text-xs font-bold flex items-center justify-center">
                        {chapter.numStr}
                      </span>
                      <h3 className="text-sm sm:text-base font-bold text-white">
                        {displayTitle}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* One-Click Copy Prompt Button */}
                      <button
                        onClick={() => handleCopyPrompt(chapter.prompt, chapter.id)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition"
                        title="Copy this prompt for your AI assistant"
                      >
                        {copiedPromptId === chapter.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400 font-semibold">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Prompt</span>
                          </>
                        )}
                      </button>

                      {/* Transmit to Component 1 Button */}
                      <button
                        onClick={() => onTransmitToAgent(chapter.prompt)}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 text-xs font-medium rounded-lg border border-purple-500/30 transition"
                        title="Open this prompt in Component 1 to transmit"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Transmit</span>
                      </button>
                    </div>
                  </div>

                  {/* Topic & Objective Display */}
                  <div className="space-y-1.5 text-xs">
                    <div className="text-slate-300">
                      <strong className="text-purple-300">Topic: </strong>
                      {displayTopic}
                    </div>
                    <div className="text-slate-300">
                      <strong className="text-indigo-300">Objective: </strong>
                      {displayObjective}
                    </div>
                  </div>

                  {/* Prompt Box */}
                  <div className="space-y-1 pt-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="font-semibold text-slate-300">AI Prompt (English):</span>
                      <span className="font-mono text-[10px] text-slate-500">Ready for Claude Code, Cursor, Copilot, Gemini</span>
                    </div>
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 font-mono text-xs text-slate-200 whitespace-pre-wrap max-h-48 overflow-y-auto leading-relaxed">
                      {chapter.prompt}
                    </div>
                  </div>

                  {/* Critique & Improved Prompt (if present) */}
                  {chapter.critique && (
                    <div className="pt-2 border-t border-slate-800/60 space-y-2 text-xs">
                      <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300/90 text-[11px] leading-relaxed">
                        <strong className="font-semibold text-amber-200">Critique: </strong>
                        {chapter.critique}
                      </div>
                      {chapter.improvedPrompt && (
                        <div className="space-y-1">
                          <span className="text-[11px] font-semibold text-emerald-400">Refined High-Precision Prompt:</span>
                          <div className="p-2.5 bg-slate-950 rounded-lg border border-emerald-500/20 text-emerald-200/90 text-xs font-mono whitespace-pre-wrap">
                            {chapter.improvedPrompt}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              );
            })}
          </div>

        </div>

      </div>

      {/* ZIP Export Options Modal */}
      {showZipModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-5 sm:p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <Archive className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">ZIP Archive Export Options</h3>
                  <p className="text-xs text-slate-400">{activeDocument.title} • {activeDocument.subject}</p>
                </div>
              </div>
              <button
                onClick={() => setShowZipModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Archive Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Target Archive</span>
                <span className="font-mono text-purple-300 font-semibold truncate block">KayBiT_{activeDocument.subject}.zip</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Chapters</span>
                <span className="font-bold text-white">{activeDocument.chapters.length} Modules</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 col-span-2 sm:col-span-1">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Compression</span>
                <span className="font-semibold text-emerald-400">DEFLATE Level 6</span>
              </div>
            </div>

            {/* Language Variants Selection */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">
                  Selected Language Variants ({selectedExportLangs.length} of {SUPPORTED_LANGUAGES.length})
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleToggleAllExportLangs}
                    className="text-[11px] text-purple-400 hover:underline"
                  >
                    {selectedExportLangs.length === SUPPORTED_LANGUAGES.length ? 'Select English Only' : 'Select All 19'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5 p-3 bg-slate-950 rounded-xl border border-slate-800 max-h-48 overflow-y-auto">
                {SUPPORTED_LANGUAGES.map((lang) => {
                  const isSelected = selectedExportLangs.includes(lang.code);
                  return (
                    <button
                      key={lang.code}
                      onClick={() => handleToggleSingleExportLang(lang.code)}
                      className={`flex items-center gap-2 p-1.5 rounded-lg text-xs text-left transition border ${
                        isSelected
                          ? 'bg-purple-950/40 border-purple-600/50 text-white font-medium'
                          : 'bg-slate-900 border-slate-800/80 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[9px] ${
                        isSelected ? 'bg-purple-600 text-white' : 'border border-slate-700'
                      }`}>
                        {isSelected && '✓'}
                      </div>
                      <span className="truncate">{lang.name} ({lang.code})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Inclusions */}
            <div className="space-y-1.5 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Companion Files Included</span>
              <ul className="space-y-1 text-slate-400 text-xs">
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span><strong className="text-slate-300">README-{activeDocument.subject}.md</strong> (Curriculum breakdown & language matrix)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span><strong className="text-slate-300">README.md</strong> (Root collection documentation)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span><strong className="text-slate-300">curriculum-manifest.json</strong> (Machine-readable metadata & chapter mapping)</span>
                </li>
              </ul>
            </div>

            {/* Modal Progress bar if actively exporting */}
            {isExportingZip && (
              <div className="space-y-1.5 p-3 rounded-xl bg-purple-950/40 border border-purple-800/40">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-purple-300 font-semibold flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-purple-400" />
                    Packaging ZIP Archive...
                  </span>
                  <span className="font-mono text-purple-300 font-bold">{zipProgress}%</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-cyan-400 h-full transition-all duration-150 rounded-full"
                    style={{ width: `${zipProgress}%` }}
                  />
                </div>
                {zipCurrentFile && (
                  <div className="text-[11px] text-slate-400 font-mono truncate">
                    {zipCurrentFile}
                  </div>
                )}
              </div>
            )}

            {/* Modal Footer */}
            <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-800">
              <span className="text-xs text-slate-400">
                Total Files: <strong className="text-white">{selectedExportLangs.length + 3}</strong>
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowZipModal(false)}
                  className="px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  Close
                </button>
                <button
                  onClick={async () => {
                    await handleExportZip();
                    setShowZipModal(false);
                  }}
                  disabled={isExportingZip || selectedExportLangs.length === 0}
                  className="flex items-center gap-1.5 py-2 px-4 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold rounded-xl text-xs transition shadow-lg shadow-purple-900/40"
                >
                  <Download className="w-4 h-4" />
                  <span>Download ZIP Now</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
