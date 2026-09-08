import { LanguageInfo } from '../types';
import { SUPPORTED_LANGUAGES } from './aiGateway';

export const LANGUAGE_STORAGE_KEY = 'kaybit_ui_language';

export const SPEECH_LOCALE_MAP: Record<string, string> = {
  en: 'en-US',
  fr: 'fr-FR',
  de: 'de-DE',
  it: 'it-IT',
  es: 'es-ES',
  pt: 'pt-BR',
  id: 'id-ID',
  sw: 'sw-KE',
  tr: 'tr-TR',
  ru: 'ru-RU',
  zh: 'zh-CN',
  ja: 'ja-JP',
  ar: 'ar-SA',
  ur: 'ur-PK',
  hi: 'hi-IN',
  mr: 'mr-IN',
  bn: 'bn-BD',
  ta: 'ta-IN',
  te: 'te-IN'
};

export const LANGUAGE_FLAGS: Record<string, string> = {
  en: '🇺🇸',
  fr: '🇫🇷',
  de: '🇩🇪',
  it: '🇮🇹',
  es: '🇪🇸',
  pt: '🇧🇷',
  id: '🇮🇩',
  sw: '🇰🇪',
  tr: '🇹🇷',
  ru: '🇷🇺',
  zh: '🇨🇳',
  ja: '🇯🇵',
  ar: '🇸🇦',
  ur: '🇵🇰',
  hi: '🇮🇳',
  mr: '🇮🇳',
  bn: '🇧🇩',
  ta: '🇮🇳',
  te: '🇮🇳'
};

export interface UiTranslations {
  comp1Name: string;
  comp2Name: string;
  userGuide: string;
  installNative: string;
  installApp: string;
  activeLanguageLabel: string;
  speechDictationSynced: string;
  promptPlaceholder: string;
  dictateButton: string;
  attachFiles: string;
  transmitPrompt: string;
  exportPdf: string;
  exportHtml: string;
  exportZip: string;
  previewHtml: string;
  historyPromptLabel: string;
  curriculumLanguageSynced: string;
  comparePrompts?: string;
}

export const UI_TRANSLATIONS: Record<string, Partial<UiTranslations>> = {
  en: {
    comp1Name: 'General Agent',
    comp2Name: '19-Lang Curriculum',
    userGuide: 'User Guide',
    installNative: 'Install Native',
    installApp: 'Install App',
    activeLanguageLabel: 'Language',
    speechDictationSynced: 'Speech Dictation & Output Synced',
    promptPlaceholder: "Ask a technical question, paste code, or click 'Dictate Prompt' to speak via microphone...",
    dictateButton: 'Dictate Prompt',
    attachFiles: 'Attach Files',
    transmitPrompt: 'Transmit to AI Agent',
    exportPdf: 'Export PDF',
    exportHtml: 'Export HTML',
    exportZip: 'Export ZIP Archive',
    previewHtml: 'Preview HTML',
    historyPromptLabel: 'Prompt History',
    curriculumLanguageSynced: 'Synchronized with Header Language Preference',
    comparePrompts: 'Compare Diffs'
  },
  es: {
    comp1Name: 'Agente General',
    comp2Name: 'Currículo 19 Idiomas',
    userGuide: 'Guía de Usuario',
    installNative: 'Instalar Nativo',
    installApp: 'Instalar App',
    activeLanguageLabel: 'Idioma',
    speechDictationSynced: 'Dictado por voz y salida sincronizados',
    promptPlaceholder: 'Haga una pregunta técnica, pegue código o use el micrófono para dictar...',
    dictateButton: 'Dictar Mensaje',
    attachFiles: 'Adjuntar Archivos',
    transmitPrompt: 'Transmitir al Agente IA',
    exportPdf: 'Exportar PDF',
    exportHtml: 'Exportar HTML',
    exportZip: 'Exportar Archivo ZIP',
    previewHtml: 'Vista Previa HTML',
    historyPromptLabel: 'Historial de Prompts',
    curriculumLanguageSynced: 'Sincronizado con la preferencia del encabezado'
  },
  fr: {
    comp1Name: 'Agent Général',
    comp2Name: 'Curriculum 19 Langues',
    userGuide: 'Guide Utilisateur',
    installNative: 'Installer Natif',
    installApp: 'Installer App',
    activeLanguageLabel: 'Langue',
    speechDictationSynced: 'Dictée vocale et sortie synchronisées',
    promptPlaceholder: 'Posez une question technique, collez du code ou dictez au micro...',
    dictateButton: 'Dicter le Prompt',
    attachFiles: 'Joindre Fichiers',
    transmitPrompt: "Transmettre à l'Agent IA",
    exportPdf: 'Exporter en PDF',
    exportHtml: 'Exporter en HTML',
    exportZip: 'Exporter Archive ZIP',
    previewHtml: 'Aperçu HTML',
    historyPromptLabel: 'Historique des Prompts',
    curriculumLanguageSynced: 'Synchronisé avec la langue choisie dans l’en-tête'
  },
  de: {
    comp1Name: 'General Agent',
    comp2Name: '19-Sprachen Lehrplan',
    userGuide: 'Benutzerhandbuch',
    installNative: 'Nativ Installieren',
    installApp: 'App Installieren',
    activeLanguageLabel: 'Sprache',
    speechDictationSynced: 'Sprachdiktat & Ausgabe synchronisiert',
    promptPlaceholder: 'Stellen Sie eine technische Frage, fügen Sie Code ein oder diktieren Sie per Mikrofon...',
    dictateButton: 'Prompt Diktieren',
    attachFiles: 'Dateien Anhängen',
    transmitPrompt: 'An KI-Agenten Senden',
    exportPdf: 'PDF Exportieren',
    exportHtml: 'HTML Exportieren',
    exportZip: 'ZIP-Archiv Exportieren',
    previewHtml: 'HTML-Vorschau',
    historyPromptLabel: 'Prompt-Verlauf',
    curriculumLanguageSynced: 'Synchronisiert mit der Header-Sprache'
  },
  zh: {
    comp1Name: '通用 AI 代理',
    comp2Name: '19 语种课程生成器',
    userGuide: '用户指南',
    installNative: '安装原生应用',
    installApp: '安装应用',
    activeLanguageLabel: '界面语言',
    speechDictationSynced: '语音输入与课程输出已同步',
    promptPlaceholder: '输入编程问题、粘贴代码，或点击语音听写...',
    dictateButton: '语音听写',
    attachFiles: '添加附件',
    transmitPrompt: '发送给 AI 代理',
    exportPdf: '导出 PDF',
    exportHtml: '导出 HTML',
    exportZip: '导出 ZIP 归档',
    previewHtml: '预览 HTML',
    historyPromptLabel: '历史提示词',
    curriculumLanguageSynced: '已与顶部导航栏语言设置同步'
  },
  ja: {
    comp1Name: '汎用AIエージェント',
    comp2Name: '19言語カリキュラム',
    userGuide: 'ユーザーガイド',
    installNative: 'ネイティブ版インストール',
    installApp: 'アプリをインストール',
    activeLanguageLabel: '言語',
    speechDictationSynced: '音声入力と出力言語が同期されました',
    promptPlaceholder: '技術的な質問、コードの貼り付け、または音声で入力...',
    dictateButton: '音声入力',
    attachFiles: 'ファイル添付',
    transmitPrompt: 'AIエージェントに送信',
    exportPdf: 'PDFエクスポート',
    exportHtml: 'HTMLエクスポート',
    exportZip: 'ZIPアーカイブ',
    previewHtml: 'HTMLプレビュー',
    historyPromptLabel: 'プロンプト履歴',
    curriculumLanguageSynced: 'ヘッダーの言語設定と同期中'
  },
  ar: {
    comp1Name: 'الوكيل العام',
    comp2Name: 'مناهج بـ 19 لغة',
    userGuide: 'دليل المستخدم',
    installNative: 'تثبيت كبرنامج أصلي',
    installApp: 'تثبيت التطبيق',
    activeLanguageLabel: 'اللغة',
    speechDictationSynced: 'الإملاء الصوتي ومخرجات الذكاء الاصطناعي متزامنة',
    promptPlaceholder: 'اطرح سؤالاً برمجياً أو الصق كوداً أو استخدم الميكروفون للإملاء...',
    dictateButton: 'إملاء صوتي',
    attachFiles: 'إرفاق ملفات',
    transmitPrompt: 'إرسال إلى وكيل الذكاء الاصطناعي',
    exportPdf: 'تصدير PDF',
    exportHtml: 'تصدير HTML',
    exportZip: 'تصدير أرشيف ZIP',
    previewHtml: 'معاينة HTML',
    historyPromptLabel: 'سجل الأوامر',
    curriculumLanguageSynced: 'متزامن مع اللغة المحددة في الشريط العلوي'
  },
  hi: {
    comp1Name: 'सामान्य एजेंट',
    comp2Name: '19-भाषाई पाठ्यक्रम',
    userGuide: 'उपयोगकर्ता मार्गदर्शिका',
    installNative: 'नेटिव इंस्टॉल करें',
    installApp: 'ऐप इंस्टॉल करें',
    activeLanguageLabel: 'भाषा',
    speechDictationSynced: 'ध्वनि डिक्टेशन और आउटपुट भाषा समन्वयित',
    promptPlaceholder: 'तकनीकी प्रश्न पूछें, कोड चिपकाएँ या माइक से बोलें...',
    dictateButton: 'प्रॉम्प्ट बोलें',
    attachFiles: 'फ़ाइलें जोड़ें',
    transmitPrompt: 'एआई एजेंट को भेजें',
    exportPdf: 'PDF निर्यात करें',
    exportHtml: 'HTML निर्यात करें',
    exportZip: 'ZIP संग्रह निर्यात करें',
    previewHtml: 'HTML पूर्वावलोकन',
    historyPromptLabel: 'प्रॉम्प्ट इतिहास',
    curriculumLanguageSynced: 'हेडर भाषा वरीयता के साथ समन्वयित'
  },
  pt: {
    comp1Name: 'Agente Geral',
    comp2Name: 'Currículo em 19 Idiomas',
    userGuide: 'Guia do Usuário',
    installNative: 'Instalar Nativo',
    installApp: 'Instalar App',
    activeLanguageLabel: 'Idioma',
    speechDictationSynced: 'Ditado por voz e saída sincronizados',
    promptPlaceholder: 'Faça uma pergunta técnica, cole código ou use o microfone...',
    dictateButton: 'Ditar Prompt',
    attachFiles: 'Anexar Arquivos',
    transmitPrompt: 'Transmitir ao Agente de IA',
    exportPdf: 'Exportar PDF',
    exportHtml: 'Exportar HTML',
    exportZip: 'Exportar Arquivo ZIP',
    previewHtml: 'Pré-visualizar HTML',
    historyPromptLabel: 'Histórico de Prompts',
    curriculumLanguageSynced: 'Sincronizado com a preferência do cabeçalho'
  },
  ru: {
    comp1Name: 'Общий Агент',
    comp2Name: 'Учебный план на 19 языках',
    userGuide: 'Руководство пользователя',
    installNative: 'Нативная установка',
    installApp: 'Установить приложение',
    activeLanguageLabel: 'Язык',
    speechDictationSynced: 'Голосовой ввод и вывод синхронизированы',
    promptPlaceholder: 'Задайте технический вопрос, вставьте код или продиктуйте через микрофон...',
    dictateButton: 'Диктовать',
    attachFiles: 'Прикрепить файлы',
    transmitPrompt: 'Отправить ИИ-агенту',
    exportPdf: 'Экспорт в PDF',
    exportHtml: 'Экспорт в HTML',
    exportZip: 'Экспорт ZIP-архива',
    previewHtml: 'Предпросмотр HTML',
    historyPromptLabel: 'История промптов',
    curriculumLanguageSynced: 'Синхронизировано с языком шапки'
  }
};

/**
 * Safely retrieves stored language from localStorage, falling back to 'en'
 */
export function getStoredLanguage(): string {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (saved && SUPPORTED_LANGUAGES.some((l) => l.code === saved)) {
        return saved;
      }
    }
  } catch {
    // localStorage not accessible
  }
  return 'en';
}

/**
 * Persists selected language to localStorage
 */
export function setStoredLanguage(code: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, code);
    }
  } catch {
    // localStorage not accessible
  }
}

/**
 * Returns Speech Recognition locale matching the language code
 */
export function getSpeechLocaleForLanguage(langCode: string): string {
  return SPEECH_LOCALE_MAP[langCode] || 'en-US';
}

/**
 * Resolves UI translation strings with fallback to English
 */
export function getUiTranslations(langCode: string): UiTranslations {
  const english = UI_TRANSLATIONS['en'] as UiTranslations;
  const specific = UI_TRANSLATIONS[langCode] || {};
  return { ...english, ...specific };
}
