import JSZip from 'jszip';
import { CurriculumDocument, CurriculumChapter, LanguageInfo, BreadcrumbItem } from '../types';
import { SUPPORTED_LANGUAGES } from './aiGateway';
import { LOCALIZED_LABELS, getLocalizedDocLabels } from '../data';

export { LOCALIZED_LABELS };

/**
 * Escapes HTML characters
 */
function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Formats multi-line text into HTML paragraphs or breaks
 */
function formatContent(text: string): string {
  if (!text) return '';
  const escaped = escapeHtml(text);
  return escaped.replace(/\n\n+/g, '<br><br>').replace(/\n/g, '<br>');
}

/**
 * Builds the top sticky language titlebar with tooltips matching uploaded design
 */
export function buildLanguageTitlebar(subject: string, currentLang: string): string {
  const links = SUPPORTED_LANGUAGES.map((lang) => {
    const isCurrent = lang.code === currentLang;
    const tooltip = `${lang.native} / ${lang.name}`;
    const filename = `${subject}_${lang.code}.html`;
    const label = lang.code === 'zh' ? '中文' : lang.code === 'ja' ? '日本語' : lang.code === 'ar' ? 'العربية' : lang.code === 'ur' ? 'اردو' : lang.code === 'hi' ? 'हिन्दी' : lang.code === 'mr' ? 'मराठी' : lang.code === 'bn' ? 'বাংলা' : lang.code === 'ta' ? 'தமிழ்' : lang.code === 'te' ? 'తెలుగు' : lang.code.toUpperCase();

    return `<a data-tooltip="${escapeHtml(tooltip)}" href="${filename}"${isCurrent ? ' class="current"' : ''}>${label}</a>`;
  }).join('');

  return `<nav class="kb-titlebar" aria-label="Language selector">${links}</nav>`;
}

/**
 * Builds the breadcrumb bar linking related documents in the collection
 */
export function buildBreadcrumbs(breadcrumbs: BreadcrumbItem[], langCode: string): string {
  const parts = breadcrumbs.map((b) => {
    if (b.isCurrent) {
      return `<span class="current">${escapeHtml(b.label)}</span>`;
    }
    const filename = `${b.subject}_${langCode}.html`;
    return `<a href="${filename}">${escapeHtml(b.label)}</a>`;
  });

  return `<nav class="kb-breadcrumb" aria-label="Related documents">${parts.join('<span class="sep">&rsaquo;</span>')}</nav>`;
}

/**
 * Generates an entire standalone HTML document for a specific language
 */
export function generateLanguageHtmlDocument(
  doc: CurriculumDocument,
  langCode: string,
  breadcrumbs: BreadcrumbItem[]
): string {
  const langMeta = SUPPORTED_LANGUAGES.find(l => l.code === langCode) || SUPPORTED_LANGUAGES[0];
  const labels = LOCALIZED_LABELS[langCode] || LOCALIZED_LABELS.en;
  const isRtl = langMeta.dir === 'rtl';

  const titleBarHtml = buildLanguageTitlebar(doc.subject, langCode);
  const breadcrumbsHtml = buildBreadcrumbs(breadcrumbs, langCode);

  // Generate Table of Contents
  const tocItemsHtml = doc.chapters.map((ch) => {
    const translation = ch.translations?.[langCode];
    const itemTitle = translation?.title || ch.title;
    return `<li class="toc-item"><a href="#ch${ch.id}" class="toc-link"><span class="toc-num">${ch.numStr}</span><span class="toc-text">${escapeHtml(itemTitle)}</span></a></li>`;
  }).join('');

  // Generate Chapters
  const chaptersHtml = doc.chapters.map((ch) => {
    const translation = ch.translations?.[langCode];
    const chTitle = translation?.title || ch.title;
    // In all translated documents as per uploaded files:
    // Topic content and Objective content are translated into target language!
    // Technical terms, Prompts, code blocks stay in original/English!
    const topicText = translation?.topic || ch.topic;
    const objectiveText = translation?.objective || ch.objective;

    let extraBoxes = '';
    if (ch.critique) {
      extraBoxes += `
            <div class="field critique-field">
                <div class="field-label">${labels.critique}</div>
                <div class="prose-box">${formatContent(ch.critique)}</div>
            </div>`;
    }
    if (ch.improvedPrompt) {
      extraBoxes += `
            <div class="field improved-field">
                <div class="field-label-row">
                    <div class="field-label">${labels.improvedPrompt}</div>
                    <button class="copy-btn" data-target="improved-${ch.id}" onclick="copyBlock('improved-${ch.id}', this)">
                        <span class="copy-icon">⧉</span><span class="copy-text">${labels.copy}</span>
                    </button>
                </div>
                <div class="code-box"><pre id="improved-${ch.id}">${escapeHtml(ch.improvedPrompt)}</pre></div>
            </div>`;
    }

    return `
        <section class="chapter" id="ch${ch.id}">
            <div class="chapter-head">
                <h2 class="chapter-title">${ch.numStr}. ${escapeHtml(chTitle)}</h2>
                <a href="#toc" class="back-btn">${labels.backToToc} ▲</a>
            </div>
            ${topicText ? `
            <div class="field">
                <div class="field-label">${labels.topic}</div>
                <div class="prose-box">${formatContent(topicText)}</div>
            </div>` : ''}
            <div class="field">
                <div class="field-label">${labels.objective}</div>
                <div class="prose-box objective-box">${formatContent(objectiveText)}</div>
            </div>
            <div class="field">
                <div class="field-label-row">
                    <div class="field-label">${labels.prompt}</div>
                    <button class="copy-btn" data-target="prompt-${ch.id}" onclick="copyBlock('prompt-${ch.id}', this)">
                        <span class="copy-icon">⧉</span><span class="copy-text">${labels.copy}</span>
                    </button>
                </div>
                <div class="code-box"><pre id="prompt-${ch.id}">${escapeHtml(ch.prompt)}</pre></div>
            </div>
            ${extraBoxes}
        </section>`;
  }).join('\n');

  // Watermark tile string
  const watermarkTiles = Array(60).fill('<span class="wm-tile">KayBiT</span>').join('');

  return `<!DOCTYPE html>
<html lang="${langCode}" dir="${isRtl ? 'rtl' : 'ltr'}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>KayBiT — ${escapeHtml(doc.title)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<style>
@import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;600;700&family=Noto+Sans+Arabic:wght@400;600;700&family=Noto+Sans+Devanagari:wght@400;600;700&family=Noto+Sans+Bengali:wght@400;600;700&family=Noto+Sans+Tamil:wght@400;600;700&family=Noto+Sans+Telugu:wght@400;600;700&family=Noto+Sans+SC:wght@400;600;700&family=Noto+Sans+JP:wght@400;600;700&display=swap');

* { box-sizing: border-box; }
:root { --purple: #7c3aed; --cyan: #06b6d4; --dark: #1c2530; }
html { scroll-behavior: smooth; }
body {
    font-family: 'Noto Sans', 'DejaVu Sans', sans-serif;
    font-size: 15px;
    line-height: 1.6;
    color: var(--dark);
    direction: ${isRtl ? 'rtl' : 'ltr'};
    margin: 0;
    background: #fdfdfe;
    position: relative;
}
.watermark {
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    display: flex; flex-wrap: wrap; align-content: flex-start; justify-content: space-around;
    z-index: 0; overflow: hidden; pointer-events: none;
}
.wm-tile {
    font-family: 'Dancing Script', cursive;
    font-size: 24px; font-weight: 700; color: #9d5fe0; opacity: 0.08;
    transform: rotate(-32deg); margin: 22px 30px; white-space: nowrap;
}
.page-wrap { position: relative; z-index: 1; max-width: 880px; margin: 0 auto; padding: 0 24px 80px; }
.hero { text-align: center; padding: 64px 20px 48px; }
.hero .brand {
    font-family: 'Dancing Script', cursive; font-size: 68px; font-weight: 700;
    color: var(--purple); text-shadow: 2px 2px 0 var(--cyan); margin-bottom: 4px;
}
.hero .brand-sub { font-size: 13px; color: #666; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 28px; }
.hero .title { font-size: 26px; font-weight: 700; margin-bottom: 8px; }
.hero .subtitle { font-size: 14px; color: #666; }
.hero .lang-pill {
    margin-top: 18px; display: inline-block; padding: 6px 20px; border-radius: 999px;
    background: #ede9fe; color: #6d28d9; font-weight: 600; font-size: 13px;
}
.toc-box {
    background: #fff; border: 1.5px solid #ece9f6; border-radius: 14px; padding: 28px 30px;
    margin-bottom: 40px; box-shadow: 0 6px 24px rgba(90,60,180,0.06); scroll-margin-top: 20px;
}
.toc-box h2 { font-size: 20px; color: #6d28d9; border-bottom: 3px solid var(--purple); padding-bottom: 8px; margin: 0 0 14px; }
ul.toc-list { list-style: none; margin: 0; padding: 0; }
li.toc-item { margin: 3px 0; }
.toc-link {
    display: flex; gap: 10px; text-decoration: none; color: var(--dark);
    padding: 6px 8px; border-radius: 8px; font-size: 14px; transition: background 0.15s;
}
.toc-link:hover { background: #f4f1fc; }
.toc-num { color: var(--purple); font-weight: 700; flex-shrink: 0; width: 24px; }
.chapter {
    background: #fff; border: 1.5px solid #ece9f6; border-radius: 14px; padding: 28px 30px;
    margin-bottom: 24px; box-shadow: 0 6px 24px rgba(90,60,180,0.06); scroll-margin-top: 20px;
}
.chapter-head {
    display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; gap: 10px;
    border-bottom: 3px solid var(--purple); padding-bottom: 10px; margin-bottom: 18px;
}
h2.chapter-title { font-size: 19px; color: #4c1d95; margin: 0; }
a.back-btn {
    text-decoration: none; font-size: 12px; font-weight: 700; color: var(--cyan);
    border: 1.5px solid var(--cyan); border-radius: 999px; padding: 4px 14px;
    white-space: nowrap; transition: background 0.15s;
}
a.back-btn:hover { background: #e6fbff; }
.field { margin-bottom: 18px; }
.field-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: var(--cyan); margin-bottom: 6px; }
.field-label-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
.prose-box {
    font-size: 14px; line-height: 1.65; color: #333; background: #f6f5fb;
    border-left: 4px solid #a78bfa; padding: 14px 18px; border-radius: 0 8px 8px 0;
}
${isRtl ? '.prose-box { border-left: none; border-right: 4px solid #a78bfa; border-radius: 8px 0 0 8px; }' : ''}
.objective-box { background: #eef9fb; border-left-color: #22d3ee; }
${isRtl ? '.objective-box { border-left-color: transparent; border-right-color: #22d3ee; }' : ''}
.code-box { background: #1e2530; border-radius: 10px; padding: 16px 20px; overflow-x: auto; }
.code-box pre {
    font-family: 'Cascadia Code', 'Consolas', 'DejaVu Sans Mono', monospace;
    font-size: 13px; line-height: 1.6; color: #d4e8ff; white-space: pre-wrap; word-wrap: break-word;
    margin: 0; direction: ltr; text-align: left; unicode-bidi: plain-text;
}
.copy-btn {
    display: inline-flex; align-items: center; gap: 6px; background: #2d3748; color: #d4e8ff;
    border: 1px solid #4a5568; border-radius: 8px; padding: 5px 12px; font-size: 12px; font-weight: 600;
    cursor: pointer; transition: background 0.15s, transform 0.1s; font-family: 'Noto Sans', 'DejaVu Sans', sans-serif;
}
.copy-btn:hover { background: #3d4a63; }
.copy-btn:active { transform: scale(0.96); }
.copy-btn.copied { background: #15803d; border-color: #22c55e; color: #fff; }
.copy-icon { font-size: 13px; }
footer.foot { text-align: center; color: #999; font-size: 12px; padding: 30px 0 10px; }
@media (max-width: 600px) { .hero .brand { font-size: 48px; } .chapter, .toc-box { padding: 20px 16px; } }

/* Centered title bar, tooltips, and breadcrumbs */
.kb-titlebar {
  background: #1c2530; padding: 10px 20px; position: sticky; top: 0; z-index: 50;
  display: flex; justify-content: center; gap: 6px; flex-wrap: wrap; font-size: 12.5px;
}
.kb-titlebar a {
  padding: 4px 9px; border-radius: 5px; color: #c9d3e0; text-decoration: none;
  border: 1px solid transparent; position: relative; font-family: 'Noto Sans', sans-serif;
}
.kb-titlebar a.current { color: #fff; background: #334155; border-color: #475569; font-weight: 600; }
.kb-titlebar a:hover { color: #fff; border-color: #475569; }
.kb-titlebar a[data-tooltip]:hover::after {
  content: attr(data-tooltip);
  position: absolute; top: 100%; left: 50%; transform: translateX(-50%);
  margin-top: 6px; background: #fff; color: #1c2530; border: 1px solid #ddd;
  padding: 4px 9px; border-radius: 5px; font-size: 11px; white-space: nowrap;
  z-index: 60; box-shadow: 0 4px 12px rgba(0,0,0,0.25); pointer-events: none;
}
.kb-breadcrumb {
  background: #f4f1fc; border-bottom: 1.5px solid #ece9f6; padding: 8px 20px;
  position: sticky; top: 38px; z-index: 49;
  display: flex; justify-content: center; align-items: center; gap: 10px; flex-wrap: wrap;
  font-size: 12.5px; color: #666;
}
.kb-breadcrumb a { color: #6d28d9; text-decoration: none; }
.kb-breadcrumb a:hover { text-decoration: underline; }
.kb-breadcrumb .current { color: #1c2530; font-weight: 700; }
.kb-breadcrumb .sep { color: #c9c3e0; }
</style>
</head>
<body>
${titleBarHtml}
${breadcrumbsHtml}
<div class="watermark">${watermarkTiles}</div>
<div class="page-wrap">
    <div class="hero">
        <div class="brand">KayBiT</div>
        <div class="brand-sub">${escapeHtml(doc.brandSub || 'Byte Technologies')}</div>
        <div class="title">${escapeHtml(doc.title)}</div>
        <div class="subtitle">${escapeHtml(doc.subtitle)}</div>
        <div class="lang-pill">${escapeHtml(langMeta.native)}</div>
    </div>
    <div class="toc-box" id="toc">
        <h2>${escapeHtml(labels.toc)}</h2>
        <ul class="toc-list">
            ${tocItemsHtml}
        </ul>
    </div>
    ${chaptersHtml}
    <footer class="foot">KayBiT Byte Technologies</footer>
</div>
<script>
function copyBlock(id, btn) {
    const el = document.getElementById(id);
    const text = el.innerText;
    const txtSpan = btn.querySelector('.copy-text');
    const originalLabel = "${labels.copy}";
    const copiedLabel = "${labels.copied}";
    function done() {
        btn.classList.add('copied');
        txtSpan.textContent = copiedLabel;
        setTimeout(() => { btn.classList.remove('copied'); txtSpan.textContent = originalLabel; }, 1600);
    }
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text, done));
    } else { fallbackCopy(text, done); }
}
function fallbackCopy(text, cb) {
    const ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(ta); cb();
}
</script>
</body>
</html>`;
}

/**
 * Generates all 19 HTML files for a curriculum document
 */
export function generateAll19LanguageHtmlFiles(
  doc: CurriculumDocument,
  allBreadcrumbs: BreadcrumbItem[]
): Record<string, string> {
  const files: Record<string, string> = {};

  for (const lang of SUPPORTED_LANGUAGES) {
    const filename = `${doc.subject}_${lang.code}.html`;
    files[filename] = generateLanguageHtmlDocument(doc, lang.code, allBreadcrumbs);
  }

  return files;
}

/**
 * Generates matching README file as in uploaded README-antivirus
 */
export function generateCurriculumReadme(doc: CurriculumDocument, allCurricula: Array<{ subject: string; label?: string }>): string {
  const chapterCount = doc.chapters.length;

  return `# ${doc.title} — ${doc.subtitle}

${chapterCount} chapters for building clean, efficient applications and scripts for advanced programming students.

## Curriculum Chapters

| # | Topic & Focus | Programming Ecosystem |
|---|---|---|
${doc.chapters.map(c => `| ${c.numStr} | ${c.title} | ${c.topic.slice(0, 70)}... |`).join('\n')}

## Multilingual Specification

\`${doc.subject}_en.html\` is the built English version. The other 18 language files translate the \`Topic:\` and \`Objective:\` field content following the same convention as the other curricula in this collection:
- French (\`${doc.subject}_fr.html\`)
- German (\`${doc.subject}_de.html\`)
- Italian (\`${doc.subject}_it.html\`)
- Spanish (\`${doc.subject}_es.html\`)
- Portuguese (\`${doc.subject}_pt.html\`)
- Indonesian (\`${doc.subject}_id.html\`)
- Swahili (\`${doc.subject}_sw.html\`)
- Turkish (\`${doc.subject}_tr.html\`)
- Russian (\`${doc.subject}_ru.html\`)
- Chinese (\`${doc.subject}_zh.html\`)
- Japanese (\`${doc.subject}_ja.html\`)
- Arabic (\`${doc.subject}_ar.html\`)
- Urdu (\`${doc.subject}_ur.html\`)
- Hindi (\`${doc.subject}_hi.html\`)
- Marathi (\`${doc.subject}_mr.html\`)
- Bangla/Bengali (\`${doc.subject}_bn.html\`)
- Tamil (\`${doc.subject}_ta.html\`)
- Telugu (\`${doc.subject}_te.html\`)

Labels, chapter headings, technical terms (tool names, file paths, environment variables), and the copyable \`Prompt:\` code blocks stay in English across every version so students can copy the code directly to their AI coding assistant.

## Integrated Curricula Collection

This document is integrated into the same combined folder with matching centered title bar, hover tooltips, and cross-document breadcrumbs:
${allCurricula.map(c => `- \`${c.subject}_*.html\`: ${c.label || c.subject}`).join('\n')}

Generated by **KayBiT_AIprompts** on ${new Date().toISOString().split('T')[0]}.
`;
}

export const generateSubjectReadme = generateCurriculumReadme;

/**
 * Generates a master consolidated README for all linked curricula
 */
export function generateConsolidatedReadme(curricula: CurriculumDocument[]): string {
  return `# KayBiT Combined Curriculum Suite

Collection of ${curricula.length} linked curricula suites covering advanced computer science, systems engineering, cybersecurity, and financial computing.

## Available Curricula

${curricula.map(c => `### ${c.title} (\`${c.subject}\`)
- **Subtitle:** ${c.subtitle}
- **Chapters:** ${c.chapters.length} chapters
- **English Entry Point:** [\`${c.subject}_en.html\`](${c.subject}_en.html)
- **All 19 Languages:** English, French, German, Italian, Spanish, Portuguese, Indonesian, Swahili, Turkish, Russian, Chinese, Japanese, Arabic, Urdu, Hindi, Marathi, Bangla, Tamil, Telugu
`).join('\n')}

## Architecture & Navigation
Every HTML document in this suite features:
- Sticky 19-language navigation titlebar with localized tooltips
- Cross-curriculum breadcrumb links
- Interactive "Copy" buttons with instant visual confirmation
- Complete RTL support for Arabic and Urdu
`;
}

export interface ZipExportOptions {
  languages?: string[]; // specific language codes, or defaults to all 19
  includeReadmes?: boolean; // defaults to true
  includeManifest?: boolean; // defaults to true
  onProgress?: (percent: number, currentFile: string | null) => void;
}

/**
 * Packages generated HTML documents and README files into a compressed ZIP archive
 */
export async function downloadZipArchive(
  doc: CurriculumDocument,
  allBreadcrumbs: BreadcrumbItem[],
  options?: ZipExportOptions
): Promise<{ filename: string; totalFiles: number; sizeBytes: number }> {
  const zip = new JSZip();
  let fileCount = 0;

  const targetLangs = options?.languages && options.languages.length > 0
    ? SUPPORTED_LANGUAGES.filter(l => options.languages!.includes(l.code))
    : SUPPORTED_LANGUAGES;

  // 1. Generate and add targeted language HTML files
  for (const lang of targetLangs) {
    const filename = `${doc.subject}_${lang.code}.html`;
    const htmlContent = generateLanguageHtmlDocument(doc, lang.code, allBreadcrumbs);
    zip.file(filename, htmlContent);
    fileCount++;
  }

  // 2. Generate and add subject-specific README and root README
  if (options?.includeReadmes !== false) {
    const subjectReadme = generateSubjectReadme(doc, allBreadcrumbs);
    zip.file(`README-${doc.subject}.md`, subjectReadme);
    zip.file('README.md', subjectReadme);
    fileCount += 2;
  }

  // 3. Generate and add manifest.json
  if (options?.includeManifest !== false) {
    const manifest = {
      app: 'KayBiT_AIprompts',
      version: '2.4.0',
      subject: doc.subject,
      title: doc.title,
      subtitle: doc.subtitle,
      createdAt: doc.createdAt,
      totalChapters: doc.chapters.length,
      exportedLanguages: targetLangs.map(l => ({ code: l.code, name: l.name, native: l.native, dir: l.dir })),
      chapters: doc.chapters.map(c => ({
        id: c.id,
        numStr: c.numStr,
        title: c.title,
        topic: c.topic,
        objective: c.objective
      }))
    };
    zip.file('curriculum-manifest.json', JSON.stringify(manifest, null, 2));
    fileCount++;
  }

  // 4. Generate compressed ZIP blob with DEFLATE level 6
  const blob = await zip.generateAsync(
    {
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 }
    },
    (metadata) => {
      if (options?.onProgress) {
        options.onProgress(Math.round(metadata.percent), metadata.currentFile);
      }
    }
  );

  const filename = `KayBiT_${doc.subject}_19Languages.zip`;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  return {
    filename,
    totalFiles: fileCount,
    sizeBytes: blob.size
  };
}

/**
 * Formats curriculum document as clean Markdown / IDE content for external editors (VS Code, Cursor, Windsurf, JetBrains)
 */
export function generateCurriculumIdeContent(doc: CurriculumDocument, lang: string = 'en'): string {
  const langInfo = SUPPORTED_LANGUAGES.find(l => l.code === lang) || { name: 'English', native: 'English', code: 'en' };
  
  const lines: string[] = [];
  lines.push(`# ${doc.title || doc.subject}`);
  lines.push('');
  lines.push(`> **Subject:** ${doc.subject} | **Language:** ${langInfo.name} (${langInfo.native}) [\`${langInfo.code}\`] | **Chapters:** ${doc.chapters.length}`);
  if (doc.difficulty) lines.push(`> **Difficulty Level:** ${doc.difficulty}`);
  if (doc.programmingLanguages && doc.programmingLanguages.length > 0) {
    lines.push(`> **Target Stack:** ${doc.programmingLanguages.join(', ')}`);
  }
  if (doc.tags && doc.tags.length > 0) {
    lines.push(`> **Tags:** ${doc.tags.join(', ')}`);
  }
  lines.push('');
  lines.push('---');
  lines.push('');

  doc.chapters.forEach((ch, idx) => {
    const tr = ch.translations?.[lang] || { topic: ch.topic, objective: ch.objective };
    const num = ch.numStr || String(idx + 1).padStart(2, '0');
    
    lines.push(`## Chapter ${num}: ${ch.title}`);
    lines.push('');
    lines.push(`### Topic (${lang.toUpperCase()})`);
    lines.push(tr.topic || ch.topic);
    lines.push('');
    lines.push(`### Objective (${lang.toUpperCase()})`);
    lines.push(tr.objective || ch.objective);
    lines.push('');
    lines.push('### AI Prompt (Copy to Coding Assistant)');
    lines.push('```');
    lines.push(ch.prompt);
    lines.push('```');
    
    if (ch.improvedPrompt) {
      lines.push('');
      lines.push('### Refined / Improved Prompt');
      lines.push('```');
      lines.push(ch.improvedPrompt);
      lines.push('```');
    }
    
    if (ch.critique) {
      lines.push('');
      lines.push(`> **Critique / Guidance:** ${ch.critique}`);
    }
    
    lines.push('');
    lines.push('---');
    lines.push('');
  });

  lines.push(`*Generated by KayBiT_AIprompts. Formatted for external IDE integration (Cursor, Windsurf, VS Code, Claude Code).*`);
  return lines.join('\n');
}

/**
 * Extracts pure AI prompts from curriculum document ready for LLM chat windows
 */
export function generateCurriculumPromptsOnly(doc: CurriculumDocument): string {
  return doc.chapters.map((ch, idx) => {
    const num = ch.numStr || String(idx + 1).padStart(2, '0');
    return `// ==========================================\n// CHAPTER ${num}: ${ch.title.toUpperCase()}\n// ==========================================\n\n${ch.prompt}\n`;
  }).join('\n');
}
