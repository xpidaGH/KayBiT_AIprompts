# KayBiT_AIprompts — Multi-Agent AI Prompting & 19-Language Curriculum Studio

**KayBiT_AIprompts** is an all-in-one cross-platform software engineering studio created for advanced programming students. It unifies modern AI coding assistants (**Google AI Studio / Gemini 2.5/3.x**, **Claude Code**, **Cursor AI**, **GitHub Copilot**, and **Windsurf Cascade**) with an automated, 19-language curriculum generation engine that produces linked HTML document suites with clickable copy buttons, responsive cross-curricula breadcrumbs, multi-format export pipelines, and syntax highlighting.

---

## 🌟 Key Architecture & Capabilities

### 1. Component 1: General AI Assistant & Multi-Agent Prompt Gateway
- **Multi-Agent Engine Switching**: Seamlessly route prompts across **Google AI Studio (Gemini 2.5 Flash / Gemini 3.1 Pro)**, **Claude Code (Anthropic)**, **Cursor AI**, **GitHub Copilot**, and **Windsurf (Cascade)**.
- **Attachment Ingestion & Context Grounding**: Drag-and-drop or select source code (`.py`, `.ts`, `.rs`, `.go`, `.cpp`, `.java`, `.sql`, etc.), error logs, JSON configurations, and architecture schemas.
- **Prompt History & Side-by-Side Comparison**: Compare prompt revisions and AI critique diffs side-by-side with word-level changes highlighted.
- **Voice Dictation & Speech Synthesis**: Speech-to-text input and text-to-speech feedback with automatic locale matching across 19 languages.
- **Prism.js Syntax Highlighting**: Real-time syntax highlighting for 20+ programming languages with line numbers, code block copying, and raw/highlighted toggle.
- **System Role Presets**: One-click switching between Principal Architect, Security & Audit Specialist, Concurrency/Systems Engineer, and General CS Tutor roles.

### 2. Component 2: Topics, Objectives & 19-Language Linked Curriculum Suite
- **Flexible Syllabus Ingestion**: Input `Topics:/Objectives:`, `Objectives:` only, lecture outlines, or upload syllabus files.
- **AI Curriculum Synthesis**: Generates structured, production-ready chapters pairing core topics and measurable objectives with battle-tested copyable prompts.
- **19-Language Translation Engine**: Translates curriculum chapters, prompt directives, and user interface labels into 19 world languages:
  - **UN Languages**: English (`en`), French (`fr`), Spanish (`es`), Russian (`ru`), Chinese (`zh`), Arabic (`ar` — RTL)
  - **European**: German (`de`), Italian (`it`), Portuguese (`pt`), Turkish (`tr`)
  - **Asian & Indic**: Japanese (`ja`), Hindi (`hi`), Marathi (`mr`), Bengali (`bn`), Tamil (`ta`), Telugu (`te`), Indonesian (`id`)
  - **African**: Swahili (`sw`)
  - **RTL & Middle Eastern**: Arabic (`ar`), Urdu (`ur` — RTL)
- **Interactive Linked HTML Suite**: Generates standalone, self-contained HTML files (`[subject]_[lang].html`) featuring:
  - Sticky language switcher bar linking all 19 language translations
  - One-click "Copy Prompt" buttons with animated confirmation badges
  - Cross-curricula breadcrumb jump links
  - Right-to-Left (RTL) typography with custom directionality rules
  - Watermark headers and responsive Table of Contents navigation
- **Curriculum Preview Modal with Text-to-Speech (TTS)**:
  - **Web Speech API Audio Narration**: Students can listen to curriculum content read aloud with native voices matched across all 19 languages.
  - **Playback Ribbon**: Play, Pause, Resume, Stop, and Next/Previous chapter skipping with animated audio soundwave indicator.
  - **Customizable Scope & Speed**: Read full content, topics and objectives only, or prompts only at 0.8x, 1.0x, 1.25x, or 1.5x speeds.
  - **IDE Copy Pipeline**: 1-click clipboard export in Markdown (`.md`), raw HTML, or numbered AI prompts for external IDEs (Cursor, VS Code, Windsurf).
- **Folder Merging & Legacy Ingestion**: Upload existing curriculum folders (`AIprompt_*.html`, `cybersecurity_*.html`, `fraud_*.html`, `antivirus_*.html`) to combine them and generate a consolidated `README.md` index.
- **Multi-Format Export Pipeline**:
  - **Linked HTML Suite (ZIP)**: Full offline directory of linked HTML documents.
  - **Markdown Suite (ZIP)**: Structured `.md` files for GitHub, Obsidian, or documentation hubs.
  - **Printable A4 PDF**: Clean, print-ready layout with page breaks.
  - **JSON Master File**: Normalized data format for LMS integration.

---

## ⌨️ Global Keyboard Shortcuts

KayBiT Studio features a complete global keyboard shortcut system designed for student workflow efficiency:

| Category | Shortcut | Action | Description |
| :--- | :---: | :--- | :--- |
| **Navigation** | `1` or `Alt+1` | Switch to Agent | Open Component 1: General Coding Assistant |
| **Navigation** | `2` or `Alt+2` | Switch to Curriculum | Open Component 2: 19-Language Curriculum Suite |
| **Navigation** | `H` or `Alt+H` | Home / Welcome | Return to interactive splash screen |
| **Navigation** | `?` or `Shift+?` | Shortcuts Modal | Open complete shortcuts cheat sheet & search |
| **Agent & Prompts** | `Ctrl/Cmd + K` | Focus Prompt | Focus cursor directly into the prompt text area |
| **Agent & Prompts** | `Ctrl/Cmd + Enter` | Transmit Prompt | Submit current prompt to active AI assistant |
| **Agent & Prompts** | `Alt + P` | Prompt History | Open Prompt Comparison & History modal |
| **Agent & Prompts** | `Alt + S` | Toggle Syntax | Switch between Prism highlighted and raw text |
| **Agent & Prompts** | `Alt + V` | Voice Dictation | Toggle speech-to-text recognition |
| **Curriculum** | `Alt + O` or `Ctrl+P` | HTML Preview | Launch the interactive multi-language HTML sandbox |
| **Curriculum** | `Ctrl+Shift+E` | Export ZIP | Compile and download 19-language HTML bundle |
| **Curriculum** | `Alt + T` | Subject Tags | Open Tag & Metadata Manager |
| **Studio & System**| `U` or `Alt+U` | User Guide | Open comprehensive user manual |
| **Studio & System**| `I` or `Alt+I` | Native Packages | Open native app build & packaging guide |
| **Studio & System**| `Esc` | Dismiss / Close | Close any open modal, dialog, or dropdown |

*Note: Single-letter shortcuts (`1`, `2`, `H`, `?`, `U`, `I`) are suspended automatically while typing inside inputs or text areas.*

---

## 📁 Centralized Data Architecture

The project employs a structured data pattern in `/src/data/` for high maintainability:

```
src/
├── data/
│   ├── defaultConfigs.ts      # Storage keys, system presets, speech locales, difficulty levels
│   ├── svgAssets.ts           # Centralized KaybitLogoIcon and BrandBadge visual components
│   ├── localizedLabels.ts     # Complete UI & document labels across 19 languages
│   ├── keyboardShortcuts.ts   # Keyboard shortcut definitions, categories, and keys
│   └── index.ts               # Barrel export file
├── components/
│   ├── KeyboardShortcutsModal.tsx  # Shortcuts search, filter, and quick-action runner
│   ├── GeneralAgentComponent.tsx   # Component 1: Multi-agent prompt interface
│   ├── CurriculumGeneratorComponent.tsx # Component 2: Syllabus synthesis & export
│   ├── Header.tsx                  # Sticky navigation, language switcher & status
│   ├── SplashScreen.tsx            # Welcome screen & quick navigation hints
│   ├── HtmlPreviewModal.tsx        # Live multi-lingual HTML iframe sandbox
│   ├── UserGuideModal.tsx          # Comprehensive in-app user guide
│   └── InstallationModal.tsx       # Native deployment guide modal
├── services/
│   ├── aiGateway.ts           # Multi-provider AI dispatch & payload formatting
│   ├── htmlGenerator.ts       # 19-Language linked HTML compiler & bundler
│   ├── sampleCurricula.ts     # Preloaded curricula across 20 CS subjects
│   └── i18n.ts                # Global language synchronization & storage
└── types.ts                   # Master TypeScript definitions
```

---

## 🌐 Supported 19 Languages

| Language | Code | Script / Direction | Native Name |
| :--- | :---: | :---: | :--- |
| **English** | `en` | LTR | English |
| **Español** | `es` | LTR | Español |
| **Français** | `fr` | LTR | Français |
| **Deutsch** | `de` | LTR | Deutsch |
| **Italiano** | `it` | LTR | Italiano |
| **Português** | `pt` | LTR | Português |
| **Bahasa Indonesia** | `id` | LTR | Bahasa Indonesia |
| **Kiswahili** | `sw` | LTR | Kiswahili |
| **Türkçe** | `tr` | LTR | Türkçe |
| **Русский** | `ru` | LTR | Русский |
| **中文 (Mandarin)** | `zh` | LTR | 中文 |
| **日本語** | `ja` | LTR | 日本語 |
| **العربية (Arabic)** | `ar` | **RTL** | العربية |
| **اردو (Urdu)** | `ur` | **RTL** | اردو |
| **हिन्दी (Hindi)** | `hi` | LTR | हिन्दी |
| **मराठी (Marathi)** | `mr` | LTR | मराठी |
| **বাংলা (Bengali)** | `bn` | LTR | বাংলা |
| **தமிழ் (Tamil)** | `ta` | LTR | தமிழ் |
| **తెలుగు (Telugu)** | `te` | LTR | తెలుగు |

---

## 🚀 Quick Start & Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Local Development Server
```bash
npm run dev
```
Starts full-stack Express + Vite development environment at `http://localhost:3000`.

### 3. Verify & Type-Check
```bash
npm run lint
```

### 4. Build for Production
```bash
npm run build
npm run start
```

---

## 📱 Native Packaging & Cross-Platform

- **Progressive Web App (PWA)**: Installable from Chrome, Edge, Safari, or Android browsers with full offline cache via Service Worker.
- **Tauri v2 (Desktop)**: Ultra-lightweight native binaries for Windows (`.exe`/`.msi`), macOS (`.dmg`), and Linux (`.deb`).
- **Capacitor (Mobile)**: Native Android APK and iOS bundle wrapping the production web build.
- Refer to [INSTALLATION.md](./INSTALLATION.md) and the in-app **Native Packages** dialog for detailed packaging commands.

---

*Engineered by KayBiT Byte Technologies for Advanced Computer Science Curricula & AI Prompting.*
