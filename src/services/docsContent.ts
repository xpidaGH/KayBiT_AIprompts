export const USER_GUIDE_TEXT = `# KayBiT_AIprompts — Comprehensive User Guide

Welcome to **KayBiT_AIprompts**, the all-in-one cross-platform AI prompting and multilingual educational curriculum studio designed for advanced computer science and software engineering students.

This application is split into two primary operational components:
1. **Component 1: General AI Assistant & Prompt Transmitter**
2. **Component 2: Topics/Objectives/Prompts & 19-Language Linked HTML Curriculum Generator**

---

## 🚀 Getting Started

### Accessing the Studio
You can run KayBiT_AIprompts in three environments:
- **Web App / PWA**: Open directly in any modern browser (Chrome, Edge, Safari, Firefox) with full offline support.
- **Desktop Application (Windows / macOS / Linux)**: Packaged natively using Tauri v2 for ultra-fast, lightweight performance (~8MB memory footprint).
- **Mobile Application (Android / iOS)**: Packaged via Capacitor by Ionic, providing responsive touch controls and system share sheet integration.

---

## 🧩 Component 1: General AI Assistant & Prompt Transmitter

Component 1 enables students and instructors to interact directly with industry-standard AI coding engines:
- **Claude Code (Anthropic)**: Specialized for architectural refactoring, context-rich reasoning, and multi-file code editing.
- **Cursor (Shadow/Composer)**: Specialized for rapid diff-generation, smart code review, and semantic codebase indexing.
- **GitHub Copilot**: Context-aware developer assistant for code completions and cloud service integrations.
- **Google AI Studio (Gemini 3.8 Flash / Gemini 3.1 Pro)**: High-performance STEM reasoning with multimodal analysis and massive context windows.
- **Windsurf (Cascade / Codeium)**: Deep-context flow and collaborative coding loops.

### Key Workflows:
1. **Engine Selection**: Toggle between the five supported AI engines. The studio automatically formats prompt structures, system rules, and headers matching each provider's API.
2. **Attaching Files & Code Snippets**: Drag and drop or browse files (.py, .ts, .rs, .go, .cpp, .sql, .json, .md, etc.) to attach them to your prompt.
3. **Transmission & Real-Time Output**: Transmit your prompt with attachments directly to the selected AI agent. Outputs are formatted with syntax highlighting and instant one-click copy buttons.
4. **History & Quick Recall**: Access your prompt history to re-run, refine, or fork conversations.
5. **Bridge to Curriculum Studio**: Click "Send to 19-Lang Generator" on any response to automatically extract topics and objectives!

---

## 📚 Component 2: Topics, Objectives & 19-Language HTML Generator

Component 2 empowers students to create structured curricula from simple topic outlines and generate linked multilingual HTML documents ready for classroom dissemination.

### Step-by-Step Workflow:

#### Step 1: Inputting Topics and Objectives
Students can provide curriculum outlines in three flexible ways:
- **Direct Typing**: Type in Topics:/Objectives: or Objectives: only into the prompt workspace.
- **Pasting Outlines**: Paste course syllabi, module outlines, or lecture notes.
- **File Upload**: Upload text files (.txt, .md, .mdx, .json, .csv) containing topics and objectives.
- **Preset Curricula**: Instantly explore built-in references (AIprompt, Advanced, cybersecurity, fraud, and antivirus).

#### Step 2: Specifying Subject & Target Programming Languages
- Enter a **Subject Name** (e.g., cloud_devops, quantum_computing, blockchain_security), or let the AI infer it from your syllabus.
- Select from the 20 supported programming ecosystems:
  * Python, JavaScript, TypeScript, Java, C#, Kotlin, Dart/Flutter
  * Bash/Shell, Rust, Go (Golang), C++, C, PHP, Ruby, PowerShell
  * SQL, R, Scala, MATLAB, COBOL/Assembly

#### Step 3: AI Curriculum Generation & 19-Language Translation
When you click **Generate Curriculum**:
1. The AI constructs structured chapters, each featuring:
   - Chapter Number (01, 02, ...)
   - Title
   - Topic
   - Measurable Objective
   - Optimized, actionable **Prompt** tailored for an AI assistant to produce production-grade output.
   - Critique and Refined High-Precision Prompts.
2. The AI translates **only** the contents of Topic: and Objective: (and titles) into **18 additional international languages**:
   - French (fr), German (de), Italian (it), Spanish (es), Portuguese (pt)
   - Indonesian (id), Swahili (sw), Turkish (tr), Russian (ru)
   - Chinese (zh), Japanese (ja), Arabic (ar), Urdu (ur)
   - Hindi (hi), Marathi (mr), Bangla/Bengali (bn), Tamil (ta), Telugu (te)
3. **Important Design Rule**: Technical terms, command names, paths, and the Prompts themselves stay in English across all 19 documents so that students can copy prompts into any AI tool without translation errors.

#### Step 4: Reviewing & Live HTML Preview
- Use the **Interactive HTML Preview Modal** to view the rendered documents.
- Switch between all 19 languages using the sticky titlebar pills with tooltips.
- Test the one-click **Copy** buttons on code blocks.
- Right-to-Left (RTL) reading modes are automatically enabled for Arabic (ar) and Urdu (ur).

#### Step 5: Folder Merging (Combining Previous Work)
Students can upload a previous folder containing existing HTML documents:
- AIprompt_*.html
- Advanced_*.html
- cybersecurity_*.html
- fraud_*.html
- antivirus_*.html
The studio automatically:
1. Links the new [subject]_*.html files into the unified breadcrumb navigation bar.
2. Updates cross-document navigation links across all files.
3. Generates or updates a root README.md and README-[subject].md index file.

#### Step 6: Exporting & Transmitting
- **Download Full Folder ZIP**: Packages all 19 .html files, README.md, and assets into a clean .zip archive.
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
`;

export const INSTALLATION_GUIDE_TEXT = `# Native Packaging, Installation & Distribution Guide

This implementation guide provides complete instructions for converting the **KayBiT_AIprompts** web application into downloadable native packages across all major platforms:
- **Android**: Standalone APK and Google Play Store AAB
- **iOS**: Native IPA package guidelines & PWA Add-to-Home-Screen flow
- **Windows**: Lightweight .exe and .msi installers
- **macOS**: Universal Apple Silicon / Intel .dmg disk images
- **Linux**: .deb and .AppImage packages

---

## 1. 🧰 Tooling Selection Matrix

| Platform | Recommended Tool | Alternative | Why We Recommend It |
|---|---|---|---|
| **Desktop (Windows, macOS, Linux)** | **Tauri v2** | Electron | Tauri uses the OS's native webview (WebKit on macOS, WebView2 on Windows) backed by a secure Rust core. Binary size is ~8MB vs ~120MB for Electron, with 80% lower RAM consumption. |
| **Mobile (Android & iOS)** | **Capacitor v6 (by Ionic)** | React Native / Cordova | Capacitor wraps your existing compiled Vite/React static assets directly into native Android Studio and Xcode projects without rewriting UI components in native primitives. |
| **Web & Lightweight Install** | **PWA (Progressive Web App)** | Browser Bookmark | Zero install footprint, instant updates, offline caching via Service Worker, and native OS home-screen / start-menu integration. |

---

## 2. 🏗️ Project Restructuring for Native Wrappers

To support Web, Desktop, and Mobile cleanly from one single React TypeScript codebase:

### A. Directory Layout
\`\`\`text
/
├── src/                    # Shared React TypeScript UI components
├── src-tauri/              # Tauri v2 Rust project (Desktop)
│   ├── src/main.rs
│   ├── Cargo.toml
│   └── tauri.conf.json
├── android/                # Capacitor Android Studio native project
├── ios/                    # Capacitor Xcode native project
├── capacitor.config.ts     # Mobile configuration
├── public/                 # Static assets, PWA manifest, service worker
├── dist/                   # Production build output
└── server.ts               # Full-stack proxy server for API credentials
\`\`\`

### B. Routing & Storage Adaptations
1. **Hash or Memory Routing for File Protocols**: When running inside desktop WebViews or mobile file protocols (\`file://\` or \`capacitor://localhost\`), avoid hardcoded server root paths. Use relative asset paths in \`vite.config.ts\`.
2. **Persistent Local Storage**: Use browser standard \`localStorage\` or \`IndexedDB\` for client-side persistence of prompt histories and generated curricula so the app functions 100% offline.
3. **API Proxying**: In production desktop/mobile builds, the client can connect directly to your hosted Cloud Run instance for AI key routing.

---

## 3. ⚙️ Concrete Configuration Files

### A. Capacitor Mobile Configuration (capacitor.config.ts)
\`\`\`typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.kaybit.aiprompts',
  appName: 'KayBiT_AIprompts',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https',
    cleartext: false
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#0b1220',
      showSpinner: false
    }
  }
};

export default config;
\`\`\`

### B. Tauri v2 Desktop Configuration (src-tauri/tauri.conf.json)
\`\`\`json
{
  "$schema": "https://schema.tauri.app/config/2",
  "productName": "KayBiT_AIprompts",
  "version": "2.4.0",
  "identifier": "com.kaybit.aiprompts",
  "build": {
    "beforeDevCommand": "npm run dev",
    "beforeBuildCommand": "npm run build",
    "devUrl": "http://localhost:3000",
    "frontendDist": "../dist"
  },
  "app": {
    "windows": [
      {
        "title": "KayBiT_AIprompts Studio",
        "width": 1280,
        "height": 840,
        "minWidth": 900,
        "minHeight": 600,
        "resizable": true,
        "fullscreen": false,
        "decorations": true
      }
    ]
  },
  "bundle": {
    "active": true,
    "targets": ["msi", "nsis", "dmg", "deb", "appimage"]
  }
}
\`\`\`

---

## 4. 🤖 Automated Multi-Platform CI/CD (GitHub Actions)

Save this workflow as \`.github/workflows/build-native.yml\` to automatically compile Windows \`.exe\`, macOS \`.dmg\`, and Android \`.apk\` whenever you push a version tag:

\`\`\`yaml
name: Build Cross-Platform Native Releases

on:
  push:
    tags:
      - 'v*'

jobs:
  build-desktop:
    strategy:
      fail-fast: false
      matrix:
        platform: [windows-latest, macos-latest, ubuntu-22.04]
    runs-on: \${{ matrix.platform }}
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Setup Rust Stable
        uses: dtolnay/rust-toolchain@stable

      - name: Install Frontend Dependencies
        run: npm ci

      - name: Build Web Code
        run: npm run build

      - name: Build Native Desktop App with Tauri
        uses: tauri-apps/tauri-action@v0
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
        with:
          tagName: \${{ github.ref_name }}
          releaseName: 'KayBiT_AIprompts \${{ github.ref_name }}'
          releaseDraft: false
          prerelease: false
\`\`\`

---

## 5. 🌐 Hosting, Distribution & Student Download Website

Host your download center on your website with direct URLs:
\`\`\`text
https://downloads.kaybit.com/
├── latest/
│   ├── KayBiT_AIprompts-Setup.exe       # Windows (x64)
│   ├── KayBiT_AIprompts-Setup.msi       # Windows Enterprise MSI
│   ├── KayBiT_AIprompts.dmg             # macOS Universal
│   ├── KayBiT_AIprompts.AppImage        # Linux Portable
│   ├── KayBiT_AIprompts.apk             # Android Direct Sideload APK
│   └── version.json                     # Auto-update version manifest
└── v2.4.0/                              # Archived historical versions
\`\`\`

---
*Maintained by KayBiT Byte Technologies DevOps & Tooling Division.*
`;
