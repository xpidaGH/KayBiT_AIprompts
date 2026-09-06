# KayBiT_AIprompts — Comprehensive User Guide

Welcome to **KayBiT_AIprompts**, the all-in-one cross-platform AI prompting and multilingual educational curriculum studio designed for advanced computer science and software engineering students.

This application is split into two primary operational components:
1. **Component 1: General AI Assistant & Prompt Transmitter**
2. **Component 2: Topics/Objectives/Prompts & 19-Language Linked HTML Curriculum Generator**

---

## 🚀 Getting Started

### Accessing the Studio
You can run KayBiT_AIprompts in three environments:
- **Web App / PWA**: Open directly in any modern browser (Chrome, Edge, Safari, Firefox) with full offline support.
- **Desktop Application (Windows / macOS / Linux)**: Packaged natively using Tauri v2 for ultra-fast, lightweight performance.
- **Mobile Application (Android / iOS)**: Packaged via Capacitor by Ionic, providing responsive touch controls and system share sheet integration.

---

## 🧩 Component 1: General AI Assistant & Prompt Transmitter

Component 1 enables students and instructors to interact directly with industry-standard AI coding engines:
- **Claude Code (Anthropic)**: Specialized for architectural refactoring and multi-file reasoning.
- **Cursor (Shadow/Composer)**: Specialized for rapid diff-generation and smart file application.
- **GitHub Copilot**: Context-aware developer assistant for code completions and API integrations.
- **Google AI Studio (Gemini 3.8 Flash / Gemini 3.1 Pro)**: High-performance STEM reasoning with multimodal analysis and massive context windows.
- **Windsurf (Cascade / Codeium)**: Deep-context flow and collaborative coding loops.

### Key Workflows:
1. **Engine Selection**: Toggle between the five supported AI engines. The studio automatically formats prompt structures, system rules, and headers matching each provider's API.
2. **Attaching Files & Code Snippets**: Drag and drop or browse files (`.py`, `.ts`, `.rs`, `.go`, `.cpp`, `.sql`, `.json`, `.md`, etc.) to attach them to your prompt.
3. **Transmission & Real-Time Output**: Transmit your prompt with attachments directly to the selected AI agent. Outputs are formatted with syntax highlighting and instant one-click copy buttons.
4. **History & Quick Recall**: Access your prompt history to re-run, refine, or fork conversations.

---

## 📚 Component 2: Topics, Objectives & 19-Language HTML Generator

Component 2 empowers students to create structured curricula from simple topic outlines and generate linked multilingual HTML documents ready for classroom dissemination.

### Step-by-Step Workflow:

#### Step 1: Inputting Topics and Objectives
Students can provide curriculum outlines in three flexible ways:
- **Direct Typing**: Type in `Topics:/Objectives:` or `Objectives:` only into the prompt workspace.
- **Pasting Outlines**: Paste course syllabi, module outlines, or lecture notes.
- **File Upload**: Upload text files (`.txt`, `.md`, `.mdx`, `.json`, `.csv`) containing topics and objectives.

#### Step 2: Specifying Subject & Target Programming Languages
- Enter a **Subject Name** (e.g., `cloud_devops`, `quantum_computing`, `blockchain_security`), or leave blank to let the AI infer it from your document's title.
- Select from the 20 supported programming ecosystems:
  * Python, JavaScript, TypeScript, Java, C#, Kotlin, Dart/Flutter
  * Bash/Shell, Rust, Go (Golang), C++, C, PHP, Ruby, PowerShell
  * SQL, R, Scala, MATLAB, COBOL/Assembly

#### Step 3: AI Curriculum Generation & 19-Language Translation
When you click **Generate Curriculum**:
1. The AI constructs structured chapters, each featuring:
   - Chapter Number (`01`, `02`, ...)
   - Title
   - Topic
   - Measurable Objective
   - Optimized, actionable **Prompt** tailored for an AI assistant to produce production-grade output.
2. The AI translates **only** the contents of `Topic:` and `Objective:` (and titles) into **18 additional international languages**:
   - French (`fr`), German (`de`), Italian (`it`), Spanish (`es`), Portuguese (`pt`)
   - Indonesian (`id`), Swahili (`sw`), Turkish (`tr`), Russian (`ru`)
   - Chinese (`zh`), Japanese (`ja`), Arabic (`ar`), Urdu (`ur`)
   - Hindi (`hi`), Marathi (`mr`), Bangla/Bengali (`bn`), Tamil (`ta`), Telugu (`te`)
3. **Important Design Rule**: Technical terms, command names, paths, and the Prompts themselves stay in English across all 19 documents so that students can copy prompts into any AI tool without translation errors.

#### Step 4: Reviewing & Live HTML Preview
- Use the **Interactive HTML Preview Modal** to view the rendered documents.
- Switch between all 19 languages using the sticky titlebar pills with tooltips.
- Test the one-click **Copy** buttons on code blocks.
- Right-to-Left (RTL) reading modes are automatically enabled for Arabic (`ar`) and Urdu (`ur`).

#### Step 5: Folder Merging (Combining Previous Work)
Students can upload a previous folder containing existing HTML documents:
- `AIprompt_*.html`
- `Advanced_*.html`
- `cybersecurity_*.html`
- `fraud_*.html`
- `antivirus_*.html`
The studio automatically:
1. Links the new `[subject]_*.html` files into the unified breadcrumb navigation bar.
2. Updates cross-document navigation links across all files.
3. Generates or updates a root `README.md` and `README-[subject].md` index file.

#### Step 6: Exporting & Transmitting
- **Download Full Folder ZIP**: Packages all 19 `.html` files, `README.md`, and assets into a clean `.zip` archive.
- **Transmit Prompt Directly**: Found a prompt you like in the curriculum? Click **Transmit to AI Agent** to immediately open it in Component 1 for live execution!

---

## 🛠️ Offline Capabilities & PWA Installation

- **Installable PWA**: Click the **Install App** button in the top navigation bar to install KayBiT_AIprompts as a standalone desktop or mobile app.
- **Offline Mode**: The built-in Service Worker caches core application assets and reference curricula so you can browse, review, and construct prompts even without an active internet connection.

---

## 💡 Best Practices for Prompt Engineering

1. **Be Specific About Constraints**: Specify language versions (e.g. Python 3.14, Rust 2024 edition), memory constraints, and concurrency models.
2. **Ask for Verifiable Deliverables**: Request unit tests, benchmarks, or Dockerfiles alongside source code.
3. **Use the Critique & Improvement Loop**: Analyze why early prompts were underspecified and adopt the improved prompt patterns generated by Component 2.

---
*Created for KayBiT Byte Technologies Advanced Programming Students.*
