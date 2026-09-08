import configData from '../../config.json';
import { 
  AIAgentProvider, 
  AIProviderConfig, 
  LanguageInfo, 
  CurriculumDocument, 
  AIAttachment,
  GenerationRequestPayload,
  BreadcrumbItem,
  DifficultyLevel
} from '../types';

export const AI_PROVIDERS: Record<AIAgentProvider, AIProviderConfig> = configData.providers as Record<AIAgentProvider, AIProviderConfig>;

export const SUPPORTED_LANGUAGES: LanguageInfo[] = configData.supportedLanguages as LanguageInfo[];

export const PROGRAMMING_LANGUAGES: string[] = configData.programmingLanguages;

/**
 * Standardizes user prompt and file attachments into the exact format 
 * expected by each external AI service provider (Google AI Studio, Claude Code, Cursor, Copilot, Windsurf).
 */
export function formatProviderPayload(
  provider: AIAgentProvider,
  model: string,
  prompt: string,
  attachments?: AIAttachment[],
  systemPrompt?: string
) {
  switch (provider) {
    case 'Google AI Studio': {
      const parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [];
      
      if (attachments && attachments.length > 0) {
        attachments.forEach((att) => {
          if (att.isBase64) {
            parts.push({
              inlineData: {
                mimeType: att.type || 'text/plain',
                data: att.data
              }
            });
          } else {
            parts.push({
              text: `[Attachment: ${att.name}]\n\`\`\`\n${att.data}\n\`\`\`\n`
            });
          }
        });
      }
      parts.push({ text: prompt });

      return {
        provider: 'Google AI Studio',
        model,
        contents: [{ role: 'user', parts }],
        config: {
          systemInstruction: systemPrompt || 'You are an expert programming AI assistant for advanced computer science students.'
        }
      };
    }

    case 'Claude Code': {
      let fullContent = prompt;
      if (attachments && attachments.length > 0) {
        const attachmentTexts = attachments.map(att => `File: ${att.name}\n\`\`\`\n${att.data}\n\`\`\``).join('\n\n');
        fullContent = `${attachmentTexts}\n\nUser Question:\n${prompt}`;
      }

      return {
        provider: 'Claude Code',
        model,
        messages: [{ role: 'user', content: fullContent }],
        system: systemPrompt || 'You are Claude Code, an expert coding assistant.',
        max_tokens: 4096
      };
    }

    case 'Cursor': {
      let userMessage = prompt;
      if (attachments && attachments.length > 0) {
        const filesContext = attachments.map(att => `### ${att.name}\n\`\`\`\n${att.data}\n\`\`\``).join('\n\n');
        userMessage = `Context Files:\n${filesContext}\n\nTask:\n${prompt}`;
      }
      return {
        provider: 'Cursor',
        model,
        messages: [
          { role: 'system', content: systemPrompt || 'You are Cursor Composer AI assisting with software development.' },
          { role: 'user', content: userMessage }
        ]
      };
    }

    case 'GitHub Copilot': {
      let userPrompt = prompt;
      if (attachments && attachments.length > 0) {
        const attached = attachments.map(att => `// FILE: ${att.name}\n${att.data}`).join('\n\n');
        userPrompt = `${attached}\n\n// USER PROMPT: ${prompt}`;
      }
      return {
        provider: 'GitHub Copilot',
        model,
        messages: [
          { role: 'system', content: systemPrompt || 'You are GitHub Copilot, assisting with code architecture and generation.' },
          { role: 'user', content: userPrompt }
        ]
      };
    }

    case 'Windsurf': {
      return {
        provider: 'Windsurf',
        model,
        cascadeContext: {
          userPrompt: prompt,
          attachedFiles: attachments?.map(att => ({ name: att.name, content: att.data })) || [],
          rules: systemPrompt || 'Act as Windsurf Cascade AI expert agent.'
        }
      };
    }
  }
}

/**
 * Executes prompt transmission to server API
 */
export async function transmitPromptToAgent(
  provider: AIAgentProvider,
  model: string,
  prompt: string,
  attachments?: AIAttachment[],
  systemInstruction?: string
): Promise<{ text: string; executionTimeMs: number }> {
  const startTime = Date.now();
  const payload = formatProviderPayload(provider, model, prompt, attachments, systemInstruction);

  const response = await fetch('/api/ai/transmit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errText = await response.text();
    let errorMsg = `Error from ${provider}: ${response.statusText}`;
    try {
      const parsed = JSON.parse(errText);
      if (parsed.error) errorMsg = parsed.error;
    } catch {
      if (errText) errorMsg = errText;
    }
    throw new Error(errorMsg);
  }

  const data = await response.json();
  const executionTimeMs = Date.now() - startTime;
  return {
    text: data.result || data.text || 'No response received from agent.',
    executionTimeMs
  };
}

/**
 * Sends curriculum generation request to server
 */
export async function generateCurriculumWithAI(
  subjectOrPayload: string | GenerationRequestPayload,
  rawInput?: string,
  programmingLanguages?: string[],
  selectedAI?: AIAgentProvider,
  targetLanguages?: string[],
  difficulty?: DifficultyLevel,
  tags?: string[]
): Promise<CurriculumDocument> {
  const payload: GenerationRequestPayload = typeof subjectOrPayload === 'string'
    ? {
        subject: subjectOrPayload,
        rawInput: rawInput || '',
        programmingLanguages: programmingLanguages || [],
        selectedAI: selectedAI || 'Google AI Studio',
        targetLanguages: targetLanguages,
        difficulty: difficulty || 'Intermediate',
        tags: tags || []
      }
    : subjectOrPayload;

  const response = await fetch('/api/ai/generate-curriculum', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errText = await response.text();
    let errorMsg = `Curriculum generation failed: ${response.statusText}`;
    try {
      const parsed = JSON.parse(errText);
      if (parsed.error) errorMsg = parsed.error;
    } catch {
      if (errText) errorMsg = errText;
    }
    throw new Error(errorMsg);
  }

  return await response.json();
}

/**
 * Merges discovered subjects from an uploaded folder into existing breadcrumbs
 */
export function mergeExternalBreadcrumbs(
  existing: BreadcrumbItem[],
  newSubjects: string[]
): BreadcrumbItem[] {
  const map = new Map<string, BreadcrumbItem>();
  existing.forEach(b => map.set(b.subject.toLowerCase(), b));

  newSubjects.forEach(sub => {
    const cleanSub = sub.toLowerCase();
    if (!map.has(cleanSub)) {
      map.set(cleanSub, {
        id: cleanSub,
        subject: cleanSub,
        label: cleanSub.charAt(0).toUpperCase() + cleanSub.slice(1),
        title: `${cleanSub} Curriculum`,
        href: `${cleanSub}_en.html`
      });
    }
  });

  return Array.from(map.values());
}
