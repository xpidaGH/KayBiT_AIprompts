# KayBiT_AIprompts — Multi-Agent AI Prompting & 19-Language Curriculum Studio

**KayBiT_AIprompts** is an all-in-one cross-platform software engineering studio created for advanced programming students. It unifies modern AI coding assistants (Claude Code, Cursor, GitHub Copilot, Google AI Studio, and Windsurf) with an automated, 19-language curriculum generation engine that produces linked HTML document suites with clickable copy buttons and responsive cross-curricula breadcrumbs.

---

## 🌟 Two Core Components

### Component 1: General AI Assistant & Multi-Agent Prompt Transmitter
- **Multi-Agent Gateway**: Interface seamlessly with **Google AI Studio (Gemini 3.8 Flash / Gemini 3.1 Pro)**, **Claude Code (Anthropic)**, **Cursor AI**, **GitHub Copilot**, and **Windsurf (Cascade)**.
- **Attachment Ingestion**: Attach programming code files (`.py`, `.ts`, `.rs`, `.go`, `.cpp`, etc.), logs, JSON configs, and documentation for context-grounded AI processing.
- **Unified Client (`src/services/aiGateway.ts`) & Shared Config (`config.json`)**: Translates student prompts into provider-specific payloads (system instructions, tool declarations, streaming configs) without exposing secret API keys to the browser.
- **Instant Prompt Execution**: One-click execution of any prompt generated anywhere in the curriculum studio.

### Component 2: Topics/Objectives/Prompts & 19-Language HTML Generator
- **Flexible Topic Ingestion**: Type in `Topics:/Objectives:` or `Objectives:` only, paste lecture outlines, or upload syllabus files.
- **AI Curriculum Synthesis**: Generates clean, production-grade chapters pairing structured topics and measurable objectives with optimized, battle-tested copyable prompts designed for AI coding assistants.
- **19-Language Translation Engine**: Automatically translates the contents of `Topic:` and `Objective:` into:
  - English (`en`), French (`fr`), German (`de`), Italian (`it`), Spanish (`es`), Portuguese (`pt`)
  - Indonesian (`id`), Swahili (`sw`), Turkish (`tr`), Russian (`ru`)
  - Chinese (`zh`), Japanese (`ja`), Arabic (`ar` — RTL), Urdu (`ur` — RTL)
  - Hindi (`hi`), Marathi (`mr`), Bangla/Bengali (`bn`), Tamil (`ta`), Telugu (`te`)
- **Interactive HTML Suite**: Produces standalone HTML documents (`[subject]_en.html`, `[subject]_fr.html`, etc.) featuring:
  - Sticky language title bar with tooltips
  - Interactive clickable "Copy" buttons with visual feedback
  - Cross-curriculum breadcrumb links
  - Right-to-Left (RTL) typography for Arabic and Urdu
  - Watermark and Table of Contents jump navigation
- **Folder Merging**: Upload previous student work folders containing existing curricula (`AIprompt_*.html`, `Advanced_*.html`, `cybersecurity_*.html`, `fraud_*.html`, `antivirus_*.html`) to combine them and generate a consolidated `README.md` index.
- **Direct ZIP Download & Share**: Download the entire multi-language curriculum bundle with a single click.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Development Server (Full-Stack Express + Vite)
```bash
npm run dev
```
The server starts on port `3000` (`http://localhost:3000`), routing `/api/*` endpoints through Express and mounting the Vite frontend.

### 3. Production Build
```bash
npm run build
npm run start
```

---

## 📖 Documentation & Native Guides
- [USER_GUIDE.md](./USER_GUIDE.md) — Comprehensive user manual with feature workflows.
- [INSTALLATION.md](./INSTALLATION.md) — Step-by-step cross-platform guide for Capacitor (Android/iOS), Tauri v2 (Windows/macOS/Linux), PWA setup, and CI/CD automation.

---
*Created by KayBiT Byte Technologies for Advanced Computer Science Curricula.*
