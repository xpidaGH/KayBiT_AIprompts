import React, { useState, useRef } from 'react';
import { 
  Send, 
  Paperclip, 
  Trash2, 
  FileCode, 
  Sparkles, 
  Copy, 
  Check, 
  Clock, 
  RotateCcw, 
  ArrowRight,
  ShieldCheck,
  Code2,
  Terminal,
  Mic,
  MicOff,
  Volume2,
  AlertCircle,
  X,
  History,
  ChevronLeft,
  ChevronRight,
  Globe,
  GitCompare
} from 'lucide-react';
import { AIAgentProvider, AIAttachment, ChatMessage } from '../types';
import { AI_PROVIDERS, SUPPORTED_LANGUAGES, transmitPromptToAgent } from '../services/aiGateway';
import { getSpeechLocaleForLanguage, LANGUAGE_FLAGS, getUiTranslations } from '../services/i18n';
import { PromptCompareModal } from './PromptCompareModal';
import { PrismContentRenderer } from './PrismContentRenderer';
import { 
  SYSTEM_PRESETS, 
  PROMPT_STARTERS, 
  SPEECH_LANGUAGES, 
  INITIAL_PROMPT_HISTORY 
} from '../data';

interface GeneralAgentComponentProps {
  selectedProvider: AIAgentProvider;
  setSelectedProvider: (provider: AIAgentProvider) => void;
  onSendToCurriculum: (topicText: string) => void;
  initialPrompt?: string;
  uiLanguage?: string;
  setUiLanguage?: (lang: string) => void;
}

export const GeneralAgentComponent: React.FC<GeneralAgentComponentProps> = ({
  selectedProvider,
  setSelectedProvider,
  onSendToCurriculum,
  initialPrompt = '',
  uiLanguage = 'en',
  setUiLanguage
}) => {
  const [prompt, setPrompt] = useState<string>(initialPrompt);
  const [attachments, setAttachments] = useState<AIAttachment[]>([]);
  const [selectedPreset, setSelectedPreset] = useState<string>('architect');
  const [customSystemPrompt, setCustomSystemPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Local state history for previous generated prompts (up to 10 versions for rich comparison)
  const [promptHistory, setPromptHistory] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('kaybit_prompt_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.slice(0, 10);
        }
      }
    } catch {
      // fallback
    }
    return INITIAL_PROMPT_HISTORY;
  });
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [isCompareOpen, setIsCompareOpen] = useState<boolean>(false);
  const [useSyntaxHighlighting, setUseSyntaxHighlighting] = useState<boolean>(true);

  // Toggle through the previous 5 generated prompts
  const toggleHistory = (direction: 'prev' | 'next') => {
    if (promptHistory.length === 0) return;

    if (direction === 'prev') {
      const nextIdx = historyIndex === -1 ? 0 : Math.min(historyIndex + 1, promptHistory.length - 1);
      setHistoryIndex(nextIdx);
      setPrompt(promptHistory[nextIdx]);
    } else {
      if (historyIndex <= 0) {
        setHistoryIndex(-1);
        setPrompt('');
      } else {
        const nextIdx = historyIndex - 1;
        setHistoryIndex(nextIdx);
        setPrompt(promptHistory[nextIdx]);
      }
    }
  };

  const selectHistoryPrompt = (idx: number) => {
    if (idx >= 0 && idx < promptHistory.length) {
      setHistoryIndex(idx);
      setPrompt(promptHistory[idx]);
    }
  };

  // Web Speech API Voice Dictation State
  const [isListening, setIsListening] = useState<boolean>(false);
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [speechLang, setSpeechLang] = useState<string>('en-US');
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [isSpeechSupported, setIsSpeechSupported] = useState<boolean>(true);
  const recognitionRef = useRef<any>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeLangInfo = SUPPORTED_LANGUAGES.find((l) => l.code === uiLanguage) || SUPPORTED_LANGUAGES[0];
  const activeFlag = LANGUAGE_FLAGS[uiLanguage] || '🌐';
  const t = getUiTranslations(uiLanguage);

  // Synchronize speech dictation language with persistent UI language preference
  React.useEffect(() => {
    if (uiLanguage) {
      const targetLocale = getSpeechLocaleForLanguage(uiLanguage);
      setSpeechLang(targetLocale);
    }
  }, [uiLanguage]);

  // Check Web Speech API support on mount and cleanup on unmount
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setIsSpeechSupported(false);
      }
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore cleanup error
        }
      }
    };
  }, []);

  // Voice Dictation Toggle Handler using Web Speech API
  const toggleSpeechRecognition = () => {
    setSpeechError(null);

    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
      setIsListening(false);
      setInterimTranscript('');
      return;
    }

    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechError('Web Speech API is not supported in this browser. Please use Chrome, Edge, Brave, or Safari to dictate prompts.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = speechLang;

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechError(null);
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const res = event.results[i];
          if (res.isFinal) {
            const transcript = res[0].transcript.trim();
            if (transcript) {
              setPrompt((prev) => {
                const clean = prev.trim();
                return clean ? `${clean} ${transcript}` : transcript;
              });
            }
          } else {
            interim += res[0].transcript;
          }
        }
        setInterimTranscript(interim);
      };

      recognition.onerror = (event: any) => {
        if (event.error === 'not-allowed') {
          setSpeechError('Microphone permission was denied. Please allow microphone access in your browser settings to dictate prompts.');
        } else if (event.error === 'no-speech') {
          // benign pause in speech
        } else if (event.error === 'audio-capture') {
          setSpeechError('No microphone detected on your system. Please connect an input device.');
        } else if (event.error === 'network') {
          setSpeechError('Network error occurred with speech recognition service.');
        } else {
          setSpeechError(`Dictation error: ${event.error}`);
        }
        setIsListening(false);
        setInterimTranscript('');
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimTranscript('');
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (err: any) {
      setSpeechError(err?.message || 'Failed to start microphone voice recognition.');
      setIsListening(false);
    }
  };

  // Sync initialPrompt if passed from Component 2
  React.useEffect(() => {
    if (initialPrompt) {
      setPrompt(initialPrompt);
    }
  }, [initialPrompt]);

  const providerConfig = AI_PROVIDERS[selectedProvider];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        const newAttachment: AIAttachment = {
          id: Math.random().toString(36).substring(2, 9),
          name: file.name,
          size: file.size,
          type: file.type || 'text/plain',
          data: content,
          isBase64: false
        };
        setAttachments((prev) => [...prev, newAttachment]);
      };
      reader.readAsText(file);
    });

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleTransmit = async () => {
    if (!prompt.trim() && attachments.length === 0) return;

    setErrorMsg(null);
    setIsLoading(true);

    const userMessage: ChatMessage = {
      id: Math.random().toString(36).substring(2, 9),
      role: 'user',
      content: prompt,
      timestamp: new Date().toLocaleTimeString(),
      provider: selectedProvider,
      model: providerConfig.models[0]?.id,
      attachments: [...attachments]
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentPrompt = prompt;
    const currentAttachments = [...attachments];
    setPrompt('');
    setAttachments([]);

    // Save prompt to local state history (up to 10 items)
    if (currentPrompt.trim()) {
      const cleanPrompt = currentPrompt.trim();
      setPromptHistory((prev) => {
        const nextHistory = [cleanPrompt, ...prev.filter((p) => p !== cleanPrompt)].slice(0, 10);
        try {
          localStorage.setItem('kaybit_prompt_history', JSON.stringify(nextHistory));
        } catch {
          // ignore
        }
        return nextHistory;
      });
      setHistoryIndex(-1);
    }

    const activeSystemPrompt = customSystemPrompt || SYSTEM_PRESETS.find(p => p.id === selectedPreset)?.prompt;

    try {
      const response = await transmitPromptToAgent(
        selectedProvider,
        providerConfig.models[0]?.id || 'gemini-3.8-flash',
        currentPrompt,
        currentAttachments,
        activeSystemPrompt
      );

      const assistantMessage: ChatMessage = {
        id: Math.random().toString(36).substring(2, 9),
        role: 'assistant',
        content: response.text,
        timestamp: new Date().toLocaleTimeString(),
        provider: selectedProvider,
        model: providerConfig.models[0]?.id,
        executionTimeMs: response.executionTimeMs
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error occurred while contacting the AI agent.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(id);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Component Title & Agent Overview */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Component 1
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                General AI Assistant & Prompt Transmitter
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Transmit prompts, test attachments, and query <strong className="text-slate-200">{selectedProvider}</strong> across any of the 20 programming languages.
            </p>
          </div>

          {/* Quick Engine Selector */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {(Object.keys(AI_PROVIDERS) as AIAgentProvider[]).map((prov) => (
              <button
                key={prov}
                onClick={() => setSelectedProvider(prov)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  selectedProvider === prov
                    ? 'bg-purple-600 text-white font-semibold shadow'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-750'
                }`}
              >
                {prov}
              </button>
            ))}
          </div>
        </div>

        {/* System Persona Presets */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center gap-2 flex-wrap text-xs">
          <span className="text-slate-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" /> Persona:
          </span>
          {SYSTEM_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => {
                setSelectedPreset(preset.id);
                setCustomSystemPrompt('');
              }}
              className={`px-2.5 py-1 rounded-md transition ${
                selectedPreset === preset.id
                  ? 'bg-slate-800 text-purple-300 font-medium border border-purple-500/30'
                  : 'text-slate-400 hover:text-slate-300 bg-slate-950/40'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Two-Column Layout: Chat History & Input Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 Cols on lg): Chat & Transmission Console */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Conversation Feed */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 min-h-[420px] max-h-[640px] overflow-y-auto space-y-6">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 text-slate-500">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-3">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-base font-semibold text-slate-300">Ready for Execution</h3>
                <p className="text-xs text-slate-400 max-w-sm mt-1">
                  Type a prompt below, attach your code or curriculum notes, or pick one of the quick starters below.
                </p>

                {/* Prompt Starters */}
                <div className="mt-6 w-full max-w-lg space-y-2 text-left">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Sample Advanced Prompts:</span>
                  {PROMPT_STARTERS.map((sample, idx) => (
                    <button
                      key={idx}
                      onClick={() => setPrompt(sample)}
                      className="w-full text-left p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 hover:border-purple-500/40 hover:bg-slate-850 text-xs text-slate-300 transition"
                    >
                      &ldquo;{sample}&rdquo;
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {/* Conversation Header Toolbar */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-300">Execution Transcript</span>
                    <span className="text-[11px] text-slate-500 font-mono">({messages.length} {messages.length === 1 ? 'message' : 'messages'})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setUseSyntaxHighlighting(prev => !prev)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono border transition ${
                        useSyntaxHighlighting
                          ? 'bg-purple-950/60 border-purple-500/40 text-purple-300 shadow-xs'
                          : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300'
                      }`}
                      title="Toggle automatic Prism.js syntax highlighting for generated code blocks"
                    >
                      <Code2 className="w-3.5 h-3.5 text-purple-400" />
                      <span>Prism.js Highlight: <strong className={useSyntaxHighlighting ? 'text-purple-200' : 'text-slate-400'}>{useSyntaxHighlighting ? 'ON' : 'OFF'}</strong></span>
                    </button>
                  </div>
                </div>

                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-2 mb-1.5 px-1">
                      <span className="text-[11px] font-semibold text-slate-400">
                        {msg.role === 'user' ? 'Student' : `${msg.provider || 'AI'} (${msg.model || 'Model'})`}
                      </span>
                      <span className="text-[10px] text-slate-500">{msg.timestamp}</span>
                      {msg.executionTimeMs && (
                        <span className="text-[10px] text-emerald-400 flex items-center gap-0.5">
                          <Clock className="w-2.5 h-2.5" /> {(msg.executionTimeMs / 1000).toFixed(2)}s
                        </span>
                      )}
                    </div>

                    <div
                      className={`rounded-2xl p-4 text-sm leading-relaxed max-w-[92%] sm:max-w-[88%] shadow-md ${
                        msg.role === 'user'
                          ? 'bg-purple-600 text-white rounded-tr-sm'
                          : 'bg-slate-950 text-slate-200 border border-slate-800 rounded-tl-sm'
                      }`}
                    >
                      {/* Render Attachments if any */}
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="mb-3 pb-3 border-b border-purple-500/30 space-y-1.5">
                          <span className="text-[10px] font-semibold uppercase tracking-wider opacity-75">
                            Attached Files ({msg.attachments.length}):
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {msg.attachments.map((att) => (
                              <span
                                key={att.id}
                                className="px-2 py-0.5 rounded bg-black/20 text-xs font-mono flex items-center gap-1"
                              >
                                <FileCode className="w-3 h-3" /> {att.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Message Content with Automatic Prism.js Syntax Highlighting */}
                      {useSyntaxHighlighting ? (
                        <PrismContentRenderer
                          content={msg.content}
                          className={msg.role === 'user' ? 'text-white' : 'text-slate-200'}
                        />
                      ) : (
                        <div className="whitespace-pre-wrap font-sans break-words text-sm">
                          {msg.content}
                        </div>
                      )}

                      {/* Assistant Action Buttons */}
                      {msg.role === 'assistant' && (
                        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-2 text-xs">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleCopy(msg.content, msg.id)}
                              className="flex items-center gap-1 text-slate-400 hover:text-white transition"
                            >
                              {copiedMsgId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                              {copiedMsgId === msg.id ? 'Copied to Clipboard' : 'Copy Full Output'}
                            </button>

                            {useSyntaxHighlighting && (
                              <span className="text-[10px] text-purple-400/80 font-mono hidden sm:inline-flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                Prism.js Active
                              </span>
                            )}
                          </div>

                          <button
                            onClick={() => onSendToCurriculum(msg.content)}
                            className="flex items-center gap-1 text-purple-400 hover:text-purple-300 transition font-medium"
                            title="Extract topics and send to Component 2"
                          >
                            Send to 19-Lang Generator <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300">
                {errorMsg}
              </div>
            )}
          </div>

          {/* Input Box & Attachment Tray */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-xl">
            {/* Attachment Chips */}
            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 pb-2 border-b border-slate-800">
                {attachments.map((att) => (
                  <span
                    key={att.id}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs font-mono text-purple-300"
                  >
                    <FileCode className="w-3 h-3 text-purple-400" />
                    <span className="truncate max-w-[140px]">{att.name}</span>
                    <button
                      onClick={() => removeAttachment(att.id)}
                      className="text-slate-400 hover:text-rose-400 transition"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Real-time Voice Dictation Banner */}
            {(isListening || interimTranscript) && (
              <div className="flex items-center justify-between p-2.5 bg-purple-950/60 border border-purple-500/40 rounded-xl text-xs animate-in fade-in duration-200">
                <div className="flex items-center gap-2 overflow-hidden flex-1 mr-2">
                  <div className="flex items-center gap-1.5 shrink-0 text-purple-300">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                    </span>
                    <Volume2 className="w-3.5 h-3.5 text-purple-300 animate-pulse" />
                    <span className="font-semibold uppercase tracking-wider text-[10px]">Listening:</span>
                  </div>
                  <p className="text-purple-100 italic truncate font-sans text-xs">
                    {interimTranscript || 'Dictate your programming prompt... Speak clearly'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={toggleSpeechRecognition}
                  className="shrink-0 px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-semibold transition flex items-center gap-1 shadow-xs"
                >
                  <MicOff className="w-3 h-3" /> Stop
                </button>
              </div>
            )}

            {/* Speech Recognition Error Banner */}
            {speechError && (
              <div className="flex items-center justify-between p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{speechError}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSpeechError(null)}
                  className="text-rose-400 hover:text-rose-200 ml-2"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

              {/* Prompt History Bar (Toggle through previous 5 generated prompts) */}
              {promptHistory.length > 0 && (
                <div className="flex items-center justify-between p-2 bg-slate-950/80 rounded-xl border border-slate-800 text-xs gap-2">
                  <div className="flex items-center gap-2 overflow-hidden flex-1">
                    <div className="flex items-center gap-1.5 text-slate-300 font-medium shrink-0">
                      <History className="w-3.5 h-3.5 text-purple-400" />
                      <span className="text-[11px] hidden xs:inline">{t.historyPromptLabel || 'History'}:</span>
                    </div>

                    {/* Toggle Previous / Next Controls */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => toggleHistory('prev')}
                        disabled={historyIndex >= promptHistory.length - 1}
                        className="flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed border border-slate-800 text-[11px] font-medium transition"
                        title="Toggle older prompt (or Press ArrowUp)"
                      >
                        <ChevronLeft className="w-3 h-3" />
                        <span>Prev</span>
                      </button>

                      <span className="font-mono text-[10px] text-purple-300 px-1.5 py-0.5 rounded bg-purple-950/80 border border-purple-800/40 shrink-0 font-semibold">
                        {historyIndex === -1 ? `0/${promptHistory.length}` : `${historyIndex + 1}/${promptHistory.length}`}
                      </span>

                      <button
                        type="button"
                        onClick={() => toggleHistory('next')}
                        disabled={historyIndex === -1}
                        className="flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed border border-slate-800 text-[11px] font-medium transition"
                        title="Toggle newer prompt (or Press ArrowDown)"
                      >
                        <span>Next</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Quick Select Pill Buttons for the 5 Prompts */}
                    <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5">
                      {promptHistory.map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => selectHistoryPrompt(idx)}
                          className={`px-2 py-0.5 rounded text-[10px] truncate max-w-[120px] transition border font-mono shrink-0 ${
                            historyIndex === idx
                              ? 'bg-purple-600 text-white border-purple-500 font-semibold shadow-xs'
                              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
                          }`}
                          title={`Prompt #${idx + 1}: ${item}`}
                        >
                          #{idx + 1}: {item}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Compare Versions Button */}
                    <button
                      type="button"
                      onClick={() => setIsCompareOpen(true)}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-600/20 hover:bg-purple-600/35 text-purple-300 hover:text-white border border-purple-500/30 hover:border-purple-400 text-[11px] font-semibold transition shrink-0 shadow-xs"
                      title="Compare side-by-side diffs between saved prompt history versions"
                    >
                      <GitCompare className="w-3.5 h-3.5 text-purple-400" />
                      <span>{t.comparePrompts || 'Compare'}</span>
                      <span className="hidden sm:inline text-[9px] font-mono px-1 py-0.2 rounded bg-purple-950 text-purple-200 border border-purple-800/40">
                        Diff
                      </span>
                    </button>

                    {historyIndex !== -1 && (
                      <button
                        type="button"
                        onClick={() => {
                          setHistoryIndex(-1);
                          setPrompt('');
                        }}
                        className="text-[11px] text-purple-400 hover:text-purple-300 underline font-medium whitespace-nowrap px-1"
                      >
                        Clear Draft
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Synchronized Global UI & Dictation Language Banner */}
              <div className="flex items-center justify-between px-3 py-1.5 bg-slate-950/70 rounded-xl border border-purple-500/20 text-xs">
                <div className="flex items-center gap-2 overflow-hidden">
                  <Globe className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span className="text-[11px] text-slate-400 shrink-0">UI Language:</span>
                  <span className="font-medium text-white flex items-center gap-1.5 shrink-0">
                    <span>{activeFlag}</span>
                    <span>{activeLangInfo.native}</span>
                    <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-purple-950 text-purple-300 border border-purple-800/40 uppercase font-semibold">
                      {uiLanguage}
                    </span>
                  </span>
                  <span className="text-slate-700 hidden sm:inline">•</span>
                  <span className="text-[11px] text-slate-400 hidden sm:inline truncate">
                    Speech Locale: <span className="text-cyan-400 font-mono">{speechLang}</span>
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-medium bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Header Synced
                  </span>
                </div>
              </div>

              <textarea
                rows={3}
                value={prompt}
                onChange={(e) => {
                  setPrompt(e.target.value);
                  if (historyIndex !== -1 && e.target.value !== promptHistory[historyIndex]) {
                    setHistoryIndex(-1);
                  }
                }}
                placeholder={t.promptPlaceholder || "Ask a technical question, paste code, or click 'Dictate Prompt' to speak via microphone..."}
                className="w-full bg-transparent text-sm text-slate-200 placeholder-slate-500 focus:outline-none resize-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    handleTransmit();
                  } else if (e.key === 'ArrowUp' && (prompt === '' || e.currentTarget.selectionStart === 0)) {
                    if (promptHistory.length > 0) {
                      e.preventDefault();
                      toggleHistory('prev');
                    }
                  } else if (e.key === 'ArrowDown' && historyIndex !== -1) {
                    e.preventDefault();
                    toggleHistory('next');
                  }
                }}
              />

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 flex-wrap gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    multiple
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs transition border border-slate-700"
                    title="Attach code files, logs, or notes"
                  >
                    <Paperclip className="w-3.5 h-3.5 text-slate-400" /> {t.attachFiles || 'Attach Files'}
                  </button>

                  {/* Web Speech API Microphone Dictation Button */}
                  <button
                    type="button"
                    onClick={toggleSpeechRecognition}
                    disabled={!isSpeechSupported}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition border font-medium ${
                      !isSpeechSupported
                        ? 'bg-slate-800/50 text-slate-500 border-slate-800 cursor-not-allowed'
                        : isListening
                        ? 'bg-rose-600 hover:bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-900/40'
                        : 'bg-slate-800 hover:bg-slate-750 text-slate-300 border-slate-700 hover:text-white'
                    }`}
                    title={
                      !isSpeechSupported
                        ? 'Web Speech API is not supported in this browser'
                        : isListening
                        ? 'Microphone active. Click to stop dictation'
                        : 'Dictate complex programming prompt using microphone (Web Speech API)'
                    }
                  >
                    {isListening ? (
                      <>
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-200 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                        </span>
                        <MicOff className="w-3.5 h-3.5" />
                        <span>Stop Dictation</span>
                      </>
                    ) : (
                      <>
                        <Mic className="w-3.5 h-3.5 text-purple-400" />
                        <span>{t.dictateButton || 'Dictate Prompt'}</span>
                      </>
                    )}
                  </button>

                  {/* Speech Dictation Language Selector */}
                  {isSpeechSupported && (
                    <div className="flex items-center">
                      <select
                        value={speechLang}
                        onChange={(e) => {
                          const newSpeech = e.target.value;
                          setSpeechLang(newSpeech);
                          if (isListening && recognitionRef.current) {
                            recognitionRef.current.stop();
                          }
                          const baseCode = newSpeech.split('-')[0];
                          if (setUiLanguage && SUPPORTED_LANGUAGES.some((l) => l.code === baseCode)) {
                            setUiLanguage(baseCode);
                          }
                        }}
                        disabled={isListening}
                        className="bg-slate-800 border border-slate-700 text-[11px] text-slate-300 hover:text-white rounded-lg px-2 py-1.5 focus:outline-none focus:border-purple-500 cursor-pointer disabled:opacity-50"
                        title="Dictation speech recognition language (Synchronized with global language toggle)"
                      >
                        {SPEECH_LANGUAGES.map((l) => (
                          <option key={l.code} value={l.code} className="bg-slate-900 text-slate-200">
                            {l.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <span className="text-[11px] text-slate-500 hidden sm:inline">
                    (Ctrl+Enter to Send)
                  </span>
                </div>

              <div className="flex items-center gap-2">
                {messages.length > 0 && (
                  <button
                    onClick={() => setMessages([])}
                    className="p-2 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition"
                    title="Clear history"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={handleTransmit}
                  disabled={isLoading || (!prompt.trim() && attachments.length === 0)}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs sm:text-sm font-semibold transition shadow-md shadow-purple-900/30"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Transmitting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Transmit</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: AI Gateway Specs & Provider Details */}
        <div className="space-y-4">
          
          {/* Active Provider Info Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-purple-400" />
                <h3 className="font-semibold text-sm text-white">Gateway Endpoint Info</h3>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                Active
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Provider:</span>
                <span className="font-medium text-white">{providerConfig.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Base URL:</span>
                <span className="font-mono text-slate-300 truncate max-w-[170px]">{providerConfig.baseUrl}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Model:</span>
                <span className="font-mono text-purple-300">{providerConfig.models[0]?.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Context Window:</span>
                <span className="font-mono text-slate-300">{(providerConfig.models[0]?.contextWindow || 0).toLocaleString()} tokens</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Auth Header:</span>
                <span className="font-mono text-slate-300">{providerConfig.authHeader}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Secret Variable:</span>
                <span className="font-mono text-amber-300">{providerConfig.envKey}</span>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 leading-normal">
              Requests to Google AI Studio are securely proxied via server-side Gemini 3.8 Flash SDK endpoints. API keys remain protected in the backend container.
            </div>
          </div>

          {/* Quick Bridge to Component 2 */}
          <div className="bg-gradient-to-br from-purple-950/30 via-slate-900 to-indigo-950/30 border border-purple-500/20 rounded-2xl p-4 sm:p-5 space-y-3 shadow-xl">
            <h3 className="font-semibold text-sm text-purple-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Ready to Generate Curricula?
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Transform any response or syllabus outline into a full 19-language HTML curriculum package with one click.
            </p>
            <button
              onClick={() => onSendToCurriculum(prompt || 'Topics: Advanced Systems Architecture\nObjectives: Build high-throughput microservices in Rust & Go.')}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/30 rounded-xl text-xs font-semibold transition"
            >
              Switch to 19-Lang Generator <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>

      {/* Side-by-Side Prompt History Diff & Version Comparison Modal */}
      <PromptCompareModal
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        promptHistory={promptHistory}
        currentPrompt={prompt}
        onApplyPrompt={(newPrompt) => {
          setPrompt(newPrompt);
          const foundIdx = promptHistory.indexOf(newPrompt);
          setHistoryIndex(foundIdx);
        }}
      />
    </div>
  );
};
