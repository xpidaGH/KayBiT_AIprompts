export type AIAgentProvider = 
  | 'Google AI Studio'
  | 'Claude Code'
  | 'Cursor'
  | 'GitHub Copilot'
  | 'Windsurf';

export interface AIModelInfo {
  id: string;
  name: string;
  contextWindow: number;
  recommended?: boolean;
}

export interface AIProviderConfig {
  id: string;
  name: AIAgentProvider;
  baseUrl: string;
  version: string;
  endpoints: Record<string, string>;
  models: AIModelInfo[];
  authHeader: string;
  authPrefix?: string;
  envKey: string;
  supportsStreaming: boolean;
  supportsAttachments: boolean;
  docsUrl: string;
}

export interface AIAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  data: string; // text content or base64 data
  isBase64?: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  provider?: AIAgentProvider;
  model?: string;
  attachments?: AIAttachment[];
  isStreaming?: boolean;
  executionTimeMs?: number;
}

export interface LanguageInfo {
  code: string;
  name: string;
  native: string;
  dir: 'ltr' | 'rtl';
}

export interface ChapterTranslation {
  title?: string;
  topic: string;
  objective: string;
}

export interface CurriculumChapter {
  id: number;
  numStr: string; // e.g. "01", "02"
  title: string;
  topic: string;
  objective: string;
  prompt: string;
  critique?: string;
  improvedPrompt?: string;
  translations: Record<string, ChapterTranslation>;
}

export type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';

export interface CurriculumDocument {
  id: string;
  subject: string; // e.g. "antivirus", "cybersecurity", "Advanced", "AIprompt", "fraud"
  title: string;
  subtitle: string;
  brandSub: string;
  chapters: CurriculumChapter[];
  createdAt: string;
  sourceType: 'generated' | 'uploaded' | 'preset';
  difficulty?: DifficultyLevel;
  programmingLanguages?: string[];
  tags?: string[];
}

export interface BreadcrumbItem {
  id?: string;
  subject: string;
  label: string;
  title?: string;
  href?: string;
  isCurrent?: boolean;
}

export interface GenerationRequestPayload {
  subject: string;
  rawInput: string;
  programmingLanguages?: string[];
  selectedAI: AIAgentProvider;
  targetLanguages?: string[];
  model?: string;
  includeCritiqueAndImproved?: boolean;
  difficulty?: DifficultyLevel;
  tags?: string[];
}
