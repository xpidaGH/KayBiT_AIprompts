import Prism from 'prismjs';

// Import essential language definitions in safe dependency order
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-powershell';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-csharp';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-docker';
import 'prismjs/components/prism-diff';
import 'prismjs/components/prism-ruby';
import 'prismjs/components/prism-kotlin';

// Re-export Prism instance
export { Prism };

/**
 * Normalizes user/AI supplied language identifiers into Prism language keys
 */
export function normalizeLanguage(lang?: string): string {
  if (!lang) return 'plaintext';
  const clean = lang.trim().toLowerCase();

  const aliasMap: Record<string, string> = {
    js: 'javascript',
    javascript: 'javascript',
    ts: 'typescript',
    typescript: 'typescript',
    jsx: 'jsx',
    tsx: 'tsx',
    py: 'python',
    python: 'python',
    sh: 'bash',
    bash: 'bash',
    shell: 'bash',
    zsh: 'bash',
    ps: 'powershell',
    ps1: 'powershell',
    powershell: 'powershell',
    golang: 'go',
    go: 'go',
    rust: 'rust',
    rs: 'rust',
    c: 'c',
    cpp: 'cpp',
    'c++': 'cpp',
    cs: 'csharp',
    csharp: 'csharp',
    'c#': 'csharp',
    dotnet: 'csharp',
    java: 'java',
    sql: 'sql',
    json: 'json',
    yml: 'yaml',
    yaml: 'yaml',
    html: 'markup',
    htm: 'markup',
    xml: 'markup',
    svg: 'markup',
    markup: 'markup',
    md: 'markdown',
    markdown: 'markdown',
    docker: 'docker',
    dockerfile: 'docker',
    diff: 'diff',
    rb: 'ruby',
    ruby: 'ruby',
    kt: 'kotlin',
    kotlin: 'kotlin',
    plain: 'plaintext',
    text: 'plaintext',
    txt: 'plaintext',
  };

  return aliasMap[clean] || (Prism.languages[clean] ? clean : 'plaintext');
}

/**
 * Returns a display-friendly label for a language code
 */
export function getLanguageDisplayName(lang?: string): string {
  const norm = normalizeLanguage(lang);
  const displayMap: Record<string, string> = {
    javascript: 'JavaScript',
    typescript: 'TypeScript',
    jsx: 'React JSX',
    tsx: 'React TSX',
    python: 'Python',
    bash: 'Bash / Shell',
    powershell: 'PowerShell',
    go: 'Go',
    rust: 'Rust',
    c: 'C',
    cpp: 'C++',
    csharp: 'C#',
    java: 'Java',
    sql: 'SQL',
    json: 'JSON',
    yaml: 'YAML',
    markup: 'HTML / XML',
    markdown: 'Markdown',
    docker: 'Dockerfile',
    diff: 'Diff Patch',
    ruby: 'Ruby',
    kotlin: 'Kotlin',
    plaintext: 'Code'
  };

  return displayMap[norm] || (lang ? lang.toUpperCase() : 'Code');
}

/**
 * Returns color accent classes for a language tag badge
 */
export function getLanguageBadgeTheme(lang?: string): {
  bg: string;
  text: string;
  border: string;
  dot: string;
} {
  const norm = normalizeLanguage(lang);

  switch (norm) {
    case 'typescript':
    case 'tsx':
      return {
        bg: 'bg-blue-950/60',
        text: 'text-blue-300',
        border: 'border-blue-700/50',
        dot: 'bg-blue-400'
      };
    case 'javascript':
    case 'jsx':
      return {
        bg: 'bg-yellow-950/60',
        text: 'text-yellow-300',
        border: 'border-yellow-700/50',
        dot: 'bg-yellow-400'
      };
    case 'python':
      return {
        bg: 'bg-sky-950/60',
        text: 'text-sky-300',
        border: 'border-sky-700/50',
        dot: 'bg-sky-400'
      };
    case 'go':
      return {
        bg: 'bg-cyan-950/60',
        text: 'text-cyan-300',
        border: 'border-cyan-700/50',
        dot: 'bg-cyan-400'
      };
    case 'rust':
      return {
        bg: 'bg-orange-950/60',
        text: 'text-orange-300',
        border: 'border-orange-700/50',
        dot: 'bg-orange-400'
      };
    case 'bash':
    case 'powershell':
      return {
        bg: 'bg-emerald-950/60',
        text: 'text-emerald-300',
        border: 'border-emerald-700/50',
        dot: 'bg-emerald-400'
      };
    case 'json':
    case 'yaml':
      return {
        bg: 'bg-amber-950/60',
        text: 'text-amber-300',
        border: 'border-amber-700/50',
        dot: 'bg-amber-400'
      };
    case 'sql':
      return {
        bg: 'bg-indigo-950/60',
        text: 'text-indigo-300',
        border: 'border-indigo-700/50',
        dot: 'bg-indigo-400'
      };
    case 'csharp':
    case 'cpp':
    case 'c':
    case 'java':
    case 'kotlin':
      return {
        bg: 'bg-purple-950/60',
        text: 'text-purple-300',
        border: 'border-purple-700/50',
        dot: 'bg-purple-400'
      };
    case 'markup':
    case 'markdown':
      return {
        bg: 'bg-rose-950/60',
        text: 'text-rose-300',
        border: 'border-rose-700/50',
        dot: 'bg-rose-400'
      };
    default:
      return {
        bg: 'bg-slate-800/80',
        text: 'text-slate-300',
        border: 'border-slate-700',
        dot: 'bg-purple-400'
      };
  }
}

/**
 * Highlights a raw code string using Prism.js and returns the HTML string
 */
export function highlightCode(code: string, language?: string): string {
  if (!code) return '';
  const norm = normalizeLanguage(language);
  const grammar = Prism.languages[norm] || Prism.languages.javascript || Prism.languages.plaintext;

  try {
    if (grammar) {
      return Prism.highlight(code, grammar, norm);
    }
  } catch (err) {
    console.warn('Prism highlight failed for lang:', norm, err);
  }

  // Fallback: simple HTML escape
  return code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export interface ContentSegment {
  type: 'text' | 'code';
  content: string;
  language?: string;
}

/**
 * Parses markdown text into interleaved text blocks and code blocks
 */
export function parseContentWithCodeBlocks(content: string): ContentSegment[] {
  if (!content) return [];

  const segments: ContentSegment[] = [];
  // Regex to match fenced markdown code blocks: ```[language]\n[code]```
  const codeBlockRegex = /```([a-zA-Z0-9_\-\+#]*)\r?\n([\s\S]*?)```/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    const textBefore = content.substring(lastIndex, match.index);
    if (textBefore.trim() || textBefore.length > 0) {
      segments.push({
        type: 'text',
        content: textBefore
      });
    }

    const language = match[1]?.trim() || '';
    const code = match[2];

    segments.push({
      type: 'code',
      language: language || undefined,
      content: code
    });

    lastIndex = match.index + match[0].length;
  }

  // Add trailing text after last code block
  if (lastIndex < content.length) {
    const remainingText = content.substring(lastIndex);
    if (remainingText.length > 0) {
      segments.push({
        type: 'text',
        content: remainingText
      });
    }
  }

  // If no code blocks were found, check if content itself is pure code (e.g. starts with { [ or import/def)
  if (segments.length === 0) {
    segments.push({
      type: 'text',
      content
    });
  }

  return segments;
}

/**
 * Heuristically detects if a text snippet is predominantly programming code
 */
export function isLikelyCodeSnippet(text: string): { isCode: boolean; likelyLang?: string } {
  if (!text || text.length < 15) return { isCode: false };
  const trimmed = text.trim();

  // JSON detection
  if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
    try {
      JSON.parse(trimmed);
      return { isCode: true, likelyLang: 'json' };
    } catch {
      // not strict json
    }
  }

  // HTML / XML detection
  if (trimmed.startsWith('<!DOCTYPE') || trimmed.startsWith('<html') || (trimmed.startsWith('<') && trimmed.endsWith('>'))) {
    return { isCode: true, likelyLang: 'markup' };
  }

  // Python detection
  if (/^(def\s+\w+|import\s+\w+|from\s+\w+\s+import|class\s+\w+:)/m.test(trimmed)) {
    return { isCode: true, likelyLang: 'python' };
  }

  // TypeScript / JavaScript detection
  if (/^(import\s+.+from|export\s+(default|const|function|interface|type)|const\s+\w+\s*=|function\s+\w+\()/m.test(trimmed)) {
    return { isCode: true, likelyLang: 'typescript' };
  }

  // PowerShell detection
  if (/\$(PSScriptRoot|env:|\w+\s*=\s*Get-|\b(Get-|Set-|New-|Remove-|Invoke-MpPreference|Get-MpComputerStatus)\b)/i.test(trimmed)) {
    return { isCode: true, likelyLang: 'powershell' };
  }

  // Bash / Shell detection
  if (/^(#!\/bin\/(bash|sh)|npm\s+(install|run|start)|docker\s+run|git\s+(clone|commit|push)|curl\s+-)/m.test(trimmed)) {
    return { isCode: true, likelyLang: 'bash' };
  }

  // Go detection
  if (/^(package\s+\w+|func\s+\w+\(|import\s*\()/m.test(trimmed)) {
    return { isCode: true, likelyLang: 'go' };
  }

  // Rust detection
  if (/^(fn\s+main\(\)|pub\s+fn|use\s+std::|struct\s+\w+\s*\{|impl\s+\w+)/m.test(trimmed)) {
    return { isCode: true, likelyLang: 'rust' };
  }

  return { isCode: false };
}
