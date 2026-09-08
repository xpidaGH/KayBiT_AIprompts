import React, { useMemo } from 'react';
import { PrismCodeBlock } from './PrismCodeBlock';
import { parseContentWithCodeBlocks, isLikelyCodeSnippet } from '../utils/prismHelper';

interface PrismContentRendererProps {
  content: string;
  defaultLanguage?: string;
  forceHighlightAll?: boolean;
  maxHeightClass?: string;
  compact?: boolean;
  className?: string;
}

/**
 * Parses markdown inline formatted text (backtick inline code, bold, links)
 */
function renderFormattedInlineText(text: string): React.ReactNode[] {
  // Regex to match inline code: `code` and bold: **bold**
  const tokenRegex = /(`[^`]+`|\*\*[^*]+\*\*)/g;
  const parts: React.ReactNode[] = [];

  let lastIdx = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenRegex.exec(text)) !== null) {
    if (match.index > lastIdx) {
      parts.push(text.substring(lastIdx, match.index));
    }

    const token = match[0];
    if (token.startsWith('`') && token.endsWith('`')) {
      const codeVal = token.slice(1, -1);
      parts.push(
        <code
          key={match.index}
          className="px-1.5 py-0.5 mx-0.5 rounded bg-slate-800 border border-slate-700/80 font-mono text-[12px] text-purple-200"
        >
          {codeVal}
        </code>
      );
    } else if (token.startsWith('**') && token.endsWith('**')) {
      const boldVal = token.slice(2, -2);
      parts.push(
        <strong key={match.index} className="font-semibold text-white">
          {boldVal}
        </strong>
      );
    }

    lastIdx = match.index + match[0].length;
  }

  if (lastIdx < text.length) {
    parts.push(text.substring(lastIdx));
  }

  return parts;
}

export const PrismContentRenderer: React.FC<PrismContentRendererProps> = ({
  content,
  defaultLanguage,
  forceHighlightAll = false,
  maxHeightClass = 'max-h-[550px]',
  compact = false,
  className = ''
}) => {
  const segments = useMemo(() => {
    if (!content) return [];

    // If forced to highlight whole content as code:
    if (forceHighlightAll) {
      return [{
        type: 'code' as const,
        language: defaultLanguage || 'plaintext',
        content
      }];
    }

    // Check if content has markdown code fences
    const parsed = parseContentWithCodeBlocks(content);

    // If only one text block and no code blocks found, check if it's pure code heuristically
    if (parsed.length === 1 && parsed[0].type === 'text') {
      const heuristic = isLikelyCodeSnippet(parsed[0].content);
      if (heuristic.isCode) {
        return [{
          type: 'code' as const,
          language: heuristic.likelyLang || defaultLanguage || 'plaintext',
          content: parsed[0].content
        }];
      }
    }

    return parsed;
  }, [content, defaultLanguage, forceHighlightAll]);

  if (!content) return null;

  return (
    <div className={`space-y-2.5 break-words ${className}`}>
      {segments.map((segment, idx) => {
        if (segment.type === 'code') {
          return (
            <PrismCodeBlock
              key={idx}
              code={segment.content}
              language={segment.language || defaultLanguage}
              maxHeightClass={maxHeightClass}
              compact={compact}
            />
          );
        }

        // Render text segment with formatted inline code and linebreaks
        const lines = segment.content.split('\n');
        return (
          <div key={idx} className="space-y-1.5 text-slate-200 text-sm leading-relaxed">
            {lines.map((line, lineIdx) => {
              const trimmed = line.trim();
              if (!trimmed) {
                return <div key={lineIdx} className="h-2" />;
              }

              // Unordered list item
              if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                return (
                  <div key={lineIdx} className="flex items-start gap-2 pl-2">
                    <span className="text-purple-400 mt-1 shrink-0 text-xs">•</span>
                    <span className="flex-1">
                      {renderFormattedInlineText(trimmed.substring(2))}
                    </span>
                  </div>
                );
              }

              // Numbered list item
              const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
              if (numMatch) {
                return (
                  <div key={lineIdx} className="flex items-start gap-2 pl-2">
                    <span className="text-purple-400 font-mono text-xs mt-0.5 shrink-0">
                      {numMatch[1]}.
                    </span>
                    <span className="flex-1">
                      {renderFormattedInlineText(numMatch[2])}
                    </span>
                  </div>
                );
              }

              // Heading line
              if (trimmed.startsWith('### ')) {
                return (
                  <h4 key={lineIdx} className="font-bold text-white text-sm pt-2 pb-0.5">
                    {renderFormattedInlineText(trimmed.substring(4))}
                  </h4>
                );
              }
              if (trimmed.startsWith('## ')) {
                return (
                  <h3 key={lineIdx} className="font-bold text-white text-base pt-2.5 pb-0.5 border-b border-slate-800">
                    {renderFormattedInlineText(trimmed.substring(3))}
                  </h3>
                );
              }

              // Regular paragraph line
              return (
                <p key={lineIdx} className="whitespace-pre-wrap">
                  {renderFormattedInlineText(line)}
                </p>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};
