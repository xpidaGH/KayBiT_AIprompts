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
  Terminal
} from 'lucide-react';
import { AIAgentProvider, AIAttachment, ChatMessage } from '../types';
import { AI_PROVIDERS, transmitPromptToAgent } from '../services/aiGateway';

interface GeneralAgentComponentProps {
  selectedProvider: AIAgentProvider;
  setSelectedProvider: (provider: AIAgentProvider) => void;
  onSendToCurriculum: (topicText: string) => void;
  initialPrompt?: string;
}

const SYSTEM_PRESETS = [
  { id: 'architect', label: 'Architecture & Design', prompt: 'You are a principal software architect. Provide clean, modular, scalable solutions with clear trade-offs, architecture patterns, and type definitions.' },
  { id: 'security', label: 'Security & Audit', prompt: 'You are an offensive and defensive cybersecurity engineer. Audit code for OWASP Top 10, memory safety, privilege escalation, and supply chain threats.' },
  { id: 'concurrency', label: 'Concurrency & Performance', prompt: 'You are a low-level systems specialist in Go, Rust, C++, and Java. Focus on non-blocking I/O, race conditions, memory allocators, and thread safety.' },
  { id: 'general', label: 'General CS Tutor', prompt: 'You are an advanced programming mentor. Guide computer science students with production-grade code, comments, and unit tests.' }
];

const PROMPT_STARTERS = [
  'Build an asynchronous rate-limited token bucket algorithm in Go and Rust.',
  'Analyze this C++ struct for memory alignment, padding, and cache-line false sharing.',
  'Implement an offline-first SQLite sync engine with conflict-free replicated data types (CRDTs).',
  'Write an audit script verifying Windows Defender exclusion paths without compromising security.'
];

export const GeneralAgentComponent: React.FC<GeneralAgentComponentProps> = ({
  selectedProvider,
  setSelectedProvider,
  onSendToCurriculum,
  initialPrompt = ''
}) => {
  const [prompt, setPrompt] = useState<string>(initialPrompt);
  const [attachments, setAttachments] = useState<AIAttachment[]>([]);
  const [selectedPreset, setSelectedPreset] = useState<string>('architect');
  const [customSystemPrompt, setCustomSystemPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

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
              messages.map((msg) => (
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
                    className={`rounded-2xl p-4 text-sm leading-relaxed max-w-[92%] sm:max-w-[85%] shadow-md ${
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

                    <div className="whitespace-pre-wrap font-sans break-words text-sm">
                      {msg.content}
                    </div>

                    {/* Assistant Action Buttons */}
                    {msg.role === 'assistant' && (
                      <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-2 text-xs">
                        <button
                          onClick={() => handleCopy(msg.content, msg.id)}
                          className="flex items-center gap-1 text-slate-400 hover:text-white transition"
                        >
                          {copiedMsgId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          {copiedMsgId === msg.id ? 'Copied to Clipboard' : 'Copy Output'}
                        </button>

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
              ))
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

            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask a technical question, paste code, or instruct the selected AI assistant..."
              className="w-full bg-transparent text-sm text-slate-200 placeholder-slate-500 focus:outline-none resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  handleTransmit();
                }
              }}
            />

            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
              <div className="flex items-center gap-2">
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
                  <Paperclip className="w-3.5 h-3.5 text-slate-400" /> Attach Files
                </button>
                <span className="text-[11px] text-slate-500 hidden sm:inline">
                  (Press Ctrl+Enter to Send)
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
    </div>
  );
};
