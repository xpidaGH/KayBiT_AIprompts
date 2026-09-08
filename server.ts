import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Lazy GoogleGenAI client helper
function getGenAIClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is missing. Configure it in Settings > Secrets.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });
}

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    hasGeminiKey: !!process.env.GEMINI_API_KEY
  });
});

// Component 1: General AI Agent Prompt Transmission Route
app.post('/api/ai/transmit', async (req, res) => {
  try {
    const { provider, model, contents, messages, config, cascadeContext } = req.body;
    const selectedModel = model || 'gemini-3.8-flash';

    // Extract prompt string and system instruction
    let userPrompt = '';
    let systemInstruction = config?.systemInstruction || 'You are an expert programming AI assistant for advanced computer science students.';

    if (contents && Array.isArray(contents)) {
      const parts = contents[0]?.parts;
      if (Array.isArray(parts)) {
        userPrompt = parts.map((p: any) => p.text || '').join('\n');
      }
    } else if (messages && Array.isArray(messages)) {
      const lastUser = messages.slice().reverse().find((m: any) => m.role === 'user');
      userPrompt = lastUser ? (typeof lastUser.content === 'string' ? lastUser.content : JSON.stringify(lastUser.content)) : '';
      const sysMsg = messages.find((m: any) => m.role === 'system');
      if (sysMsg) systemInstruction = sysMsg.content;
    } else if (cascadeContext) {
      userPrompt = cascadeContext.userPrompt || '';
      if (cascadeContext.rules) systemInstruction = cascadeContext.rules;
    }

    if (!userPrompt && req.body.prompt) {
      userPrompt = req.body.prompt;
    }

    // Call Gemini API server-side
    const ai = getGenAIClient();
    const response = await ai.models.generateContent({
      model: selectedModel.startsWith('gemini') ? selectedModel : 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction: `${systemInstruction}\nYou are operating within KayBiT_AIprompts, behaving as the selected assistant persona (${provider || 'Google AI Studio'}). Provide production-ready, mathematically sound, syntactically verified solutions.`,
        temperature: 0.7
      }
    });

    res.json({
      success: true,
      provider: provider || 'Google AI Studio',
      model: selectedModel,
      result: response.text || 'No response generated.'
    });
  } catch (error: any) {
    console.error('API Error in /api/ai/transmit:', error);
    res.status(500).json({
      error: error.message || 'Failed to process AI prompt transmission.'
    });
  }
});

// Component 2: Topics/Objectives/Prompts & 19-Language Curriculum Generator
app.post('/api/ai/generate-curriculum', async (req, res) => {
  try {
    const { subject, rawInput, programmingLanguages, selectedAI, targetLanguages, difficulty, tags } = req.body;

    if (!subject || !rawInput) {
      return res.status(400).json({ error: 'Subject and raw Topics/Objectives input are required.' });
    }

    const ai = getGenAIClient();

    // Determine target non-English languages to translate
    const nonEnglishLangs = Array.isArray(targetLanguages) && targetLanguages.length > 0
      ? targetLanguages.filter((l: string) => l !== 'en')
      : ['fr', 'de', 'it', 'es', 'pt', 'id', 'sw', 'tr', 'ru', 'zh', 'ja', 'ar', 'ur', 'hi', 'mr', 'bn', 'ta', 'te'];

    const langInstruction = nonEnglishLangs.length > 0
      ? `5. Translate the Title, Topic, and Objective ONLY into these requested languages: ${nonEnglishLangs.join(', ')}.\n   IMPORTANT: Technical terms, file names, API names, tool names, and code keywords MUST remain in English in all translations. The "prompt" itself remains in English only across all files.`
      : `5. No additional language translations requested. Set "translations": {} for each chapter.`;

    const sampleTranslationsStructure = nonEnglishLangs.slice(0, 3).map((l: string) => `        "${l}": { "title": "...", "topic": "...", "objective": "..." }`).join(',\n') || '';

    const systemPrompt = `You are the KayBiT_AIprompts Curriculum Architect.
Your task is to transform the user's topics and objectives into a comprehensive, high-standard curriculum consisting of multiple chapters.
For each chapter:
1. Provide a clear Title (English).
2. Detail the Topic (English).
3. Detail the specific, measurable Objective (English).
4. Craft an exhaustive, professional, ready-to-copy Prompt (English) specifically designed for a student to copy-paste into an AI coding assistant (${selectedAI || 'Claude Code, Cursor, Copilot, or Gemini'}) to generate the complete codebase, system architecture, or test harness with zero ambiguity.
${langInstruction}

Return ONLY a valid JSON object with this exact structure:
{
  "title": "Curriculum Title in English",
  "subtitle": "Subtitle describing the target scope and ecosystem",
  "brandSub": "Brief brand descriptor (e.g. Advanced Architecture, Dev Security, Enterprise Engineering)",
  "chapters": [
    {
      "id": 1,
      "numStr": "01",
      "title": "Chapter Title in English",
      "topic": "Topic in English",
      "objective": "Objective in English",
      "prompt": "Full detailed prompt for AI in English",
      "translations": {
${sampleTranslationsStructure}
      }
    }
  ]
}`;

    const userPrompt = `Subject Name: ${subject}
Target Programming Languages: ${programmingLanguages?.join(', ') || 'Multi-language (Python, TypeScript, Rust, Go, C++, etc.)'}
Input Topics & Objectives:
"""
${rawInput}
"""

Generate the structured chapters with translations for the requested languages (${nonEnglishLangs.length > 0 ? nonEnglishLangs.join(', ') : 'English only'}). Ensure the Prompt is thorough, actionable, and ready for advanced programming students.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        temperature: 0.4
      }
    });

    const rawText = response.text || '{}';
    let parsedData: any;
    try {
      parsedData = JSON.parse(rawText.trim());
    } catch (e) {
      console.error('Failed to parse JSON response:', rawText);
      throw new Error('AI generated non-JSON response. Please try again.');
    }

    const docResult = {
      id: subject.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + Date.now().toString(36),
      subject: subject.toLowerCase().replace(/[^a-z0-9]/g, '_'),
      title: parsedData.title || `${subject} — AI Prompts for Student Discussions`,
      subtitle: parsedData.subtitle || 'Real-World Application Prompts — Advanced Students',
      brandSub: parsedData.brandSub || 'Byte Technologies — Advanced',
      chapters: parsedData.chapters || [],
      createdAt: new Date().toISOString().split('T')[0],
      sourceType: 'generated',
      difficulty: difficulty || 'Intermediate',
      programmingLanguages: Array.isArray(programmingLanguages) && programmingLanguages.length > 0 ? programmingLanguages : ['Multi-language'],
      tags: Array.isArray(tags) && tags.length > 0 ? tags : ['Curriculum', subject]
    };

    res.json(docResult);
  } catch (error: any) {
    console.error('Curriculum Generation Error:', error);
    res.status(500).json({
      error: error.message || 'Failed to generate curriculum.'
    });
  }
});

async function startServer() {
  // Vite middleware in development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
