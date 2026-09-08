import { DifficultyLevel } from '../types';

/**
 * Centralized LocalStorage Keys
 */
export const STORAGE_KEYS = {
  UI_LANGUAGE: 'kaybit_ui_language',
  PROMPT_HISTORY: 'kaybit_prompt_history',
  SAVED_CURRICULA: 'kaybit_saved_curricula',
  ACTIVE_TAB: 'kaybit_active_tab',
  ACTIVE_PROVIDER: 'kaybit_active_provider',
  SYNTAX_HIGHLIGHTING: 'kaybit_syntax_highlighting'
} as const;

/**
 * System Persona Presets for Component 1 (General Agent)
 */
export interface SystemPreset {
  id: string;
  label: string;
  description: string;
  prompt: string;
}

export const SYSTEM_PRESETS: SystemPreset[] = [
  {
    id: 'architect',
    label: 'Architecture & Design',
    description: 'System design, modular scalability, trade-off analysis, and design patterns',
    prompt: 'You are a principal software architect. Provide clean, modular, scalable solutions with clear trade-offs, architecture patterns, and type definitions.'
  },
  {
    id: 'security',
    label: 'Security & Audit',
    description: 'Vulnerability analysis, OWASP mitigation, memory safety, and defense scripts',
    prompt: 'You are an offensive and defensive cybersecurity engineer. Audit code for OWASP Top 10, memory safety, privilege escalation, and supply chain threats.'
  },
  {
    id: 'concurrency',
    label: 'Concurrency & Performance',
    description: 'Multi-threading, async runtimes, lock-free patterns, and cache alignment',
    prompt: 'You are a low-level systems specialist in Go, Rust, C++, and Java. Focus on non-blocking I/O, race conditions, memory allocators, and thread safety.'
  },
  {
    id: 'general',
    label: 'General CS Tutor',
    description: 'Interactive pedagogy, comprehensive explanations, unit tests, and idioms',
    prompt: 'You are an advanced programming mentor. Guide computer science students with production-grade code, comments, and unit tests.'
  }
];

/**
 * Quick prompt starters for students exploring advanced CS subjects
 */
export const PROMPT_STARTERS: string[] = [
  'Build an asynchronous rate-limited token bucket algorithm in Go and Rust.',
  'Analyze this C++ struct for memory alignment, padding, and cache-line false sharing.',
  'Implement an offline-first SQLite sync engine with conflict-free replicated data types (CRDTs).',
  'Write an audit script verifying Windows Defender exclusion paths without compromising security.'
];

/**
 * Initial historical prompt versions seeded for the Prompt Compare feature
 */
export const INITIAL_PROMPT_HISTORY: string[] = [
  'Build an asynchronous rate-limited token bucket algorithm in Go and Rust.',
  'Analyze this C++ struct for memory alignment, padding, and cache-line false sharing.',
  'Implement an offline-first SQLite sync engine with conflict-free replicated data types (CRDTs).'
];

/**
 * Standard Web Speech recognition locales matching the 19 supported languages
 */
export interface SpeechLanguageOption {
  code: string;
  label: string;
}

export const SPEECH_LANGUAGES: SpeechLanguageOption[] = [
  { code: 'en-US', label: 'English (US)' },
  { code: 'en-GB', label: 'English (UK)' },
  { code: 'es-ES', label: 'Español' },
  { code: 'fr-FR', label: 'Français' },
  { code: 'de-DE', label: 'Deutsch' },
  { code: 'it-IT', label: 'Italiano' },
  { code: 'pt-BR', label: 'Português' },
  { code: 'id-ID', label: 'Bahasa Indonesia' },
  { code: 'sw-KE', label: 'Kiswahili' },
  { code: 'tr-TR', label: 'Türkçe' },
  { code: 'ru-RU', label: 'Русский' },
  { code: 'zh-CN', label: '中文 (Mandarin)' },
  { code: 'ja-JP', label: '日本語' },
  { code: 'ar-SA', label: 'العربية' },
  { code: 'ur-PK', label: 'اردو' },
  { code: 'hi-IN', label: 'हिन्दी' },
  { code: 'mr-IN', label: 'मराठी' },
  { code: 'bn-BD', label: 'বাংলা' },
  { code: 'ta-IN', label: 'தமிழ்' },
  { code: 'te-IN', label: 'తెలుగు' }
];

/**
 * Difficulty levels and visual styling badges
 */
export const DIFFICULTY_LEVELS: DifficultyLevel[] = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

export const DIFFICULTY_BADGES: Record<DifficultyLevel, { label: string; badgeClass: string; icon: string }> = {
  Beginner: {
    label: 'Beginner',
    badgeClass: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300',
    icon: '🌱'
  },
  Intermediate: {
    label: 'Intermediate',
    badgeClass: 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300',
    icon: '🎓'
  },
  Advanced: {
    label: 'Advanced',
    badgeClass: 'bg-purple-500/15 border-purple-500/30 text-purple-300',
    icon: '⚡'
  },
  Expert: {
    label: 'Expert',
    badgeClass: 'bg-rose-500/15 border-rose-500/30 text-rose-300',
    icon: '🔥'
  }
};

/**
 * Default starter tags for curriculum generation
 */
export const DEFAULT_GENERATION_TAGS: string[] = ['FullStack', 'DevOps'];
