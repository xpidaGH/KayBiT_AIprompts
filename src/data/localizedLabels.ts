/**
 * Localized UI labels for the 19 supported languages used in generated HTML suites, 
 * Markdown/PDF exporters, and preview components.
 */
export interface LocalizedDocLabels {
  toc: string;
  backToToc: string;
  topic: string;
  objective: string;
  prompt: string;
  critique: string;
  improvedPrompt: string;
  copy: string;
  copied: string;
}

export const LOCALIZED_LABELS: Record<string, LocalizedDocLabels> = {
  en: { 
    toc: "Table of Contents", 
    backToToc: "TOC", 
    topic: "Topic", 
    objective: "Objective", 
    prompt: "Prompt", 
    critique: "Critique", 
    improvedPrompt: "Improved Prompt", 
    copy: "Copy", 
    copied: "Copied!" 
  },
  fr: { 
    toc: "Table des matières", 
    backToToc: "Sommaire", 
    topic: "Sujet", 
    objective: "Objectif", 
    prompt: "Prompt", 
    critique: "Critique", 
    improvedPrompt: "Prompt amélioré", 
    copy: "Copier", 
    copied: "Copié !" 
  },
  de: { 
    toc: "Inhaltsverzeichnis", 
    backToToc: "Inhalt", 
    topic: "Thema", 
    objective: "Ziel", 
    prompt: "Prompt", 
    critique: "Kritik", 
    improvedPrompt: "Verbesserter Prompt", 
    copy: "Kopieren", 
    copied: "Kopiert!" 
  },
  it: { 
    toc: "Indice", 
    backToToc: "Indice", 
    topic: "Argomento", 
    objective: "Obiettivo", 
    prompt: "Prompt", 
    critique: "Critica", 
    improvedPrompt: "Prompt migliorato", 
    copy: "Copia", 
    copied: "Copiato!" 
  },
  es: { 
    toc: "Índice", 
    backToToc: "Índice", 
    topic: "Tema", 
    objective: "Objetivo", 
    prompt: "Prompt", 
    critique: "Crítica", 
    improvedPrompt: "Prompt mejorado", 
    copy: "Copiar", 
    copied: "¡Copiado!" 
  },
  pt: { 
    toc: "Índice", 
    backToToc: "Índice", 
    topic: "Tópico", 
    objective: "Objetivo", 
    prompt: "Prompt", 
    critique: "Crítica", 
    improvedPrompt: "Prompt aprimorado", 
    copy: "Copiar", 
    copied: "Copiado!" 
  },
  id: { 
    toc: "Daftar Isi", 
    backToToc: "Daftar Isi", 
    topic: "Topik", 
    objective: "Tujuan", 
    prompt: "Prompt", 
    critique: "Kritik", 
    improvedPrompt: "Prompt yang disempurnakan", 
    copy: "Salin", 
    copied: "Tersalin!" 
  },
  sw: { 
    toc: "Yaliyomo", 
    backToToc: "Yaliyomo", 
    topic: "Mada", 
    objective: "Lengo", 
    prompt: "Prompt", 
    critique: "Uhakiki", 
    improvedPrompt: "Prompt iliyoboreshwa", 
    copy: "Nakili", 
    copied: "Imenakiliwa!" 
  },
  tr: { 
    toc: "İçindekiler", 
    backToToc: "İçindekiler", 
    topic: "Konu", 
    objective: "Hedef", 
    prompt: "Prompt", 
    critique: "Eleştiri", 
    improvedPrompt: "Geliştirilmiş Prompt", 
    copy: "Kopyala", 
    copied: "Kopyalandı!" 
  },
  ru: { 
    toc: "Содержание", 
    backToToc: "Содержание", 
    topic: "Тема", 
    objective: "Цель", 
    prompt: "Промпт", 
    critique: "Критика", 
    improvedPrompt: "Улучшенный промпт", 
    copy: "Копировать", 
    copied: "Скопировано!" 
  },
  zh: { 
    toc: "目录", 
    backToToc: "目录", 
    topic: "主题", 
    objective: "目标", 
    prompt: "提示词 (Prompt)", 
    critique: "评价", 
    improvedPrompt: "改进版提示词", 
    copy: "复制", 
    copied: "已复制！" 
  },
  ja: { 
    toc: "目次", 
    backToToc: "目次", 
    topic: "トピック", 
    objective: "目標", 
    prompt: "プロンプト (Prompt)", 
    critique: "講評", 
    improvedPrompt: "改善されたプロンプト", 
    copy: "コピー", 
    copied: "コピー完了！" 
  },
  ar: { 
    toc: "جدول المحتويات", 
    backToToc: "المحتويات", 
    topic: "الموضوع", 
    objective: "الهدف", 
    prompt: "المطالبة (Prompt)", 
    critique: "النقد", 
    improvedPrompt: "المطالبة المحسنة", 
    copy: "نسخ", 
    copied: "تم النسخ!" 
  },
  ur: { 
    toc: "فہرست عنوانات", 
    backToToc: "فہرست", 
    topic: "عنوان", 
    objective: "مقصد", 
    prompt: "پرامپٹ (Prompt)", 
    critique: "تنقید", 
    improvedPrompt: "بہتر پرامپٹ", 
    copy: "کاپی کریں", 
    copied: "کاپی ہو گیا!" 
  },
  hi: { 
    toc: "विषय सूची", 
    backToToc: "सूची", 
    topic: "विषय", 
    objective: "उद्देश्य", 
    prompt: "प्रॉम्प्ट (Prompt)", 
    critique: "समीक्षा", 
    improvedPrompt: "बेहतर प्रॉम्प्ट", 
    copy: "कॉपी करें", 
    copied: "कॉपी हो गया!" 
  },
  mr: { 
    toc: "अनुक्रमणिका", 
    backToToc: "सूची", 
    topic: "विषय", 
    objective: "उद्दिष्ट", 
    prompt: "प्रॉम्प्ट (Prompt)", 
    critique: "समीक्षा", 
    improvedPrompt: "सुधारित प्रॉम्प्ट", 
    copy: "कॉपी करा", 
    copied: "कॉपी झाले!" 
  },
  bn: { 
    toc: "সূচিপত্র", 
    backToToc: "সূচিপত্র", 
    topic: "বিষয়", 
    objective: "উদ্দেশ্য", 
    prompt: "প্রম্পট (Prompt)", 
    critique: "পর্যালোচনা", 
    improvedPrompt: "উন্নত প্রম্পট", 
    copy: "কপি করুন", 
    copied: "কপি হয়েছে!" 
  },
  ta: { 
    toc: "பொருளடக்கம்", 
    backToToc: "பொருளடக்கம்", 
    topic: "தலைப்பு", 
    objective: "நோக்கம்", 
    prompt: "ப்ராம்ப்ட் (Prompt)", 
    critique: "விமர்சனம்", 
    improvedPrompt: "மேம்படுத்தப்பட்ட ப்ராம்ப்ட்", 
    copy: "நகலெடு", 
    copied: "நகலெடுக்கப்பட்டது!" 
  },
  te: { 
    toc: "విషయ సూచిక", 
    backToToc: "సూచిక", 
    topic: "అంశం", 
    objective: "లక్ష్యం", 
    prompt: "ప్రాంప్ట్ (Prompt)", 
    critique: "సమీక్ష", 
    improvedPrompt: "మెరుగైన ప్రాంప్ట్", 
    copy: "కాపీ చేయి", 
    copied: "కాపీ అయింది!" 
  }
};

/**
 * Returns localized document labels, falling back to English if missing
 */
export function getLocalizedDocLabels(langCode: string): LocalizedDocLabels {
  return LOCALIZED_LABELS[langCode] || LOCALIZED_LABELS.en;
}
