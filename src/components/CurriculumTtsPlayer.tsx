import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Play, 
  Pause, 
  Square, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  Sliders, 
  X, 
  Headphones, 
  Sparkles,
  Layers,
  Gauge
} from 'lucide-react';
import { CurriculumDocument } from '../types';
import { getSpeechLocaleForLanguage } from '../services/i18n';
import { SUPPORTED_LANGUAGES } from '../services/aiGateway';

interface CurriculumTtsPlayerProps {
  document: CurriculumDocument;
  currentLang: string;
  onClose?: () => void;
}

type SpeechScope = 'full' | 'topics_objectives' | 'prompts_only';

interface SpeechQueueItem {
  id: string;
  label: string;
  sublabel: string;
  chapterIndex: number;
  text: string;
}

export const CurriculumTtsPlayer: React.FC<CurriculumTtsPlayerProps> = ({
  document,
  currentLang,
  onClose
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [speechScope, setSpeechScope] = useState<SpeechScope>('full');
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState<boolean>(true);

  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const targetLocale = useMemo(() => getSpeechLocaleForLanguage(currentLang), [currentLang]);
  const langMeta = useMemo(() => SUPPORTED_LANGUAGES.find(l => l.code === currentLang), [currentLang]);

  // Check Web Speech API availability
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setIsSupported(false);
      setErrorMessage('Web Speech API is not supported in this browser. Use Chrome, Edge, Safari, or Firefox.');
      return;
    }

    const updateVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        setAvailableVoices(voices);
      }
    };

    updateVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }

    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Pick best matching voice whenever targetLocale or availableVoices change
  useEffect(() => {
    if (availableVoices.length === 0) return;

    // First try exact match (e.g., 'es-ES')
    let voice = availableVoices.find(v => v.lang.toLowerCase() === targetLocale.toLowerCase());
    
    // Second try prefix match (e.g., 'es')
    if (!voice) {
      const langPrefix = targetLocale.split('-')[0].toLowerCase();
      voice = availableVoices.find(v => v.lang.toLowerCase().startsWith(langPrefix));
    }

    // Default to first voice if no match
    if (!voice) {
      voice = availableVoices.find(v => v.default) || availableVoices[0];
    }

    setSelectedVoice(voice || null);
  }, [targetLocale, availableVoices]);

  // Build the playlist items based on the document and chosen scope
  const queueItems = useMemo<SpeechQueueItem[]>(() => {
    const items: SpeechQueueItem[] = [];

    // Item 0: Document Introduction
    items.push({
      id: 'intro',
      label: 'Curriculum Introduction',
      sublabel: `${document.subject} in ${langMeta?.name || 'English'}`,
      chapterIndex: -1,
      text: `${document.title || document.subject}. ${document.subtitle || ''}. Total of ${document.chapters.length} chapters. Prepared for advanced computer science students.`
    });

    // Chapter Items
    document.chapters.forEach((ch, idx) => {
      const tr = ch.translations?.[currentLang] || { topic: ch.topic, objective: ch.objective };
      const num = ch.numStr || String(idx + 1).padStart(2, '0');
      const topicText = tr.topic || ch.topic;
      const objectiveText = tr.objective || ch.objective;

      let fullSpeechText = '';
      if (speechScope === 'full') {
        fullSpeechText = `Chapter ${num}: ${ch.title}. Topic: ${topicText}. Learning Objective: ${objectiveText}. AI Coding Prompt: ${ch.prompt}.`;
      } else if (speechScope === 'topics_objectives') {
        fullSpeechText = `Chapter ${num}: ${ch.title}. Topic: ${topicText}. Learning Objective: ${objectiveText}.`;
      } else {
        fullSpeechText = `Chapter ${num}: ${ch.title}. Prompt: ${ch.prompt}.`;
      }

      items.push({
        id: `ch-${ch.id}`,
        label: `Chapter ${num}: ${ch.title}`,
        sublabel: `Topic & Objectives (${langMeta?.code.toUpperCase() || 'EN'})`,
        chapterIndex: idx,
        text: fullSpeechText
      });
    });

    return items;
  }, [document, currentLang, speechScope, langMeta]);

  // Clean up playback when language changes
  useEffect(() => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setIsPaused(false);
    }
    setCurrentIndex(0);
  }, [currentLang, speechScope]);

  // Play a specific item from the queue
  const playItem = (index: number) => {
    if (!isSupported || !('speechSynthesis' in window)) return;
    if (index < 0 || index >= queueItems.length) return;

    window.speechSynthesis.cancel();
    setErrorMessage(null);

    const item = queueItems[index];
    const utterance = new SpeechSynthesisUtterance(item.text);
    utterance.lang = targetLocale;
    utterance.rate = speechRate;
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
      setCurrentIndex(index);
    };

    utterance.onpause = () => {
      setIsPaused(true);
    };

    utterance.onresume = () => {
      setIsPaused(false);
    };

    utterance.onend = () => {
      if (index + 1 < queueItems.length) {
        playItem(index + 1);
      } else {
        setIsPlaying(false);
        setIsPaused(false);
        setCurrentIndex(0);
      }
    };

    utterance.onerror = (e) => {
      // Ignore user cancellations
      if (e.error === 'canceled' || e.error === 'interrupted') return;
      setErrorMessage(`Speech synthesis notice: ${e.error || 'Playback halted'}`);
      setIsPlaying(false);
      setIsPaused(false);
    };

    currentUtteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const handleTogglePlay = () => {
    if (!isPlaying) {
      playItem(currentIndex);
    } else if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    } else {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  };

  const handleStop = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentIndex(0);
  };

  const handleSkipNext = () => {
    if (currentIndex + 1 < queueItems.length) {
      playItem(currentIndex + 1);
    }
  };

  const handleSkipPrev = () => {
    if (currentIndex > 0) {
      playItem(currentIndex - 1);
    } else {
      playItem(0);
    }
  };

  const handleRateChange = (newRate: number) => {
    setSpeechRate(newRate);
    if (isPlaying && !isPaused) {
      // Restart current item with the new playback rate
      playItem(currentIndex);
    }
  };

  if (!isSupported) {
    return (
      <div className="bg-amber-950/40 border-b border-amber-800/60 px-4 py-2 text-xs text-amber-300 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <VolumeX className="w-4 h-4 text-amber-400" />
          <span>Text-to-Speech (Web Speech API) is unavailable in this environment.</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    );
  }

  const currentItem = queueItems[currentIndex] || queueItems[0];

  return (
    <div className="bg-slate-950/95 border-b border-purple-900/40 px-4 sm:px-6 py-2.5 shadow-lg backdrop-blur-md text-xs">
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Left: Playback Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleSkipPrev}
            disabled={currentIndex === 0}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent transition"
            title="Previous chapter"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            onClick={handleTogglePlay}
            className={`p-2.5 rounded-xl shadow-md transition flex items-center justify-center ${
              isPlaying && !isPaused
                ? 'bg-amber-600 hover:bg-amber-500 text-white'
                : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white'
            }`}
            title={isPlaying && !isPaused ? 'Pause playback' : 'Listen to curriculum'}
          >
            {isPlaying && !isPaused ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current ml-0.5" />
            )}
          </button>

          <button
            onClick={handleStop}
            disabled={!isPlaying && currentIndex === 0}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent transition"
            title="Stop playback"
          >
            <Square className="w-4 h-4" />
          </button>

          <button
            onClick={handleSkipNext}
            disabled={currentIndex >= queueItems.length - 1}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent transition"
            title="Next chapter"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Center: Track Status & Animated Soundwave */}
        <div className="flex-1 flex items-center gap-3 min-w-0 max-w-xl">
          {/* Animated Audio Equalizer when playing */}
          <div className="flex items-center gap-0.5 h-4 w-5 shrink-0 justify-center">
            {isPlaying && !isPaused ? (
              <>
                <span className="w-1 bg-purple-400 rounded-full animate-pulse h-4" />
                <span className="w-1 bg-cyan-400 rounded-full animate-pulse h-2.5 delay-75" />
                <span className="w-1 bg-purple-400 rounded-full animate-pulse h-3.5 delay-150" />
                <span className="w-1 bg-indigo-400 rounded-full animate-pulse h-2 delay-100" />
              </>
            ) : (
              <Headphones className="w-4 h-4 text-slate-500" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-200 truncate">
                {currentItem.label}
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-950/70 border border-purple-800/50 text-purple-300 font-mono shrink-0">
                {currentIndex + 1}/{queueItems.length}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 truncate flex items-center gap-1.5">
              <span>{currentItem.sublabel}</span>
              <span>•</span>
              <span className="text-cyan-400 font-mono">{targetLocale}</span>
              {selectedVoice && (
                <>
                  <span>•</span>
                  <span className="truncate text-slate-500 max-w-[120px]">
                    {selectedVoice.name}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right: Scope, Speed & Options */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
          {/* Scope Selector */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-[11px]">
            <button
              onClick={() => setSpeechScope('full')}
              className={`px-2 py-1 rounded transition ${
                speechScope === 'full' 
                  ? 'bg-purple-600 text-white font-medium' 
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Read complete curriculum including AI prompts"
            >
              Full
            </button>
            <button
              onClick={() => setSpeechScope('topics_objectives')}
              className={`px-2 py-1 rounded transition ${
                speechScope === 'topics_objectives' 
                  ? 'bg-purple-600 text-white font-medium' 
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Read only topics and learning objectives"
            >
              Topics
            </button>
            <button
              onClick={() => setSpeechScope('prompts_only')}
              className={`px-2 py-1 rounded transition ${
                speechScope === 'prompts_only' 
                  ? 'bg-purple-600 text-white font-medium' 
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Read AI coding prompts only"
            >
              Prompts
            </button>
          </div>

          {/* Speed Presets */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-[11px]">
            {[0.8, 1.0, 1.25, 1.5].map((rate) => (
              <button
                key={rate}
                onClick={() => handleRateChange(rate)}
                className={`px-1.5 py-1 rounded font-mono transition ${
                  speechRate === rate
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
                title={`Playback speed ${rate}x`}
              >
                {rate}x
              </button>
            ))}
          </div>

          {onClose && (
            <button
              onClick={() => {
                handleStop();
                onClose();
              }}
              className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition ml-1"
              title="Close Text-to-Speech bar"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {errorMessage && (
        <div className="mt-1.5 text-[11px] text-rose-400 bg-rose-950/30 border border-rose-900/40 px-2 py-0.5 rounded">
          {errorMessage}
        </div>
      )}
    </div>
  );
};
