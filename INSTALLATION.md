# Native Packaging, Installation & Distribution Guide

This implementation guide provides complete instructions for converting the **KayBiT_AIprompts** web application into downloadable native packages across all major platforms:
- **Android**: Standalone APK and Google Play Store AAB
- **iOS**: Native IPA package guidelines & PWA Add-to-Home-Screen flow
- **Windows**: Lightweight `.exe` and `.msi` installers
- **macOS**: Universal Apple Silicon / Intel `.dmg` disk images
- **Linux**: `.deb` and `.AppImage` packages

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
```text
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
```

### B. Routing & Storage Adaptations
1. **Hash or Memory Routing for File Protocols**: When running inside desktop WebViews or mobile file protocols (`file://` or `capacitor://localhost`), avoid hardcoded server root paths. Use relative asset paths in `vite.config.ts`:
   ```typescript
   export default defineConfig({
     base: './', // Ensures assets load correctly on native file:// systems
     // ...
   });
   ```
2. **Persistent Local Storage**: Use browser standard `localStorage` or `IndexedDB` for client-side persistence of prompt histories and generated curricula so the app functions 100% offline.
3. **API Proxying**: In production desktop/mobile builds, the client can connect directly to your hosted Cloud Run instance (`https://your-domain.com/api/*`) for AI key routing, or allow students to supply their own keys via Settings.

---

## 3. ⚙️ Concrete Configuration Files

### A. Capacitor Mobile Configuration (`capacitor.config.ts`)
```typescript
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
```

### B. Tauri v2 Desktop Configuration (`src-tauri/tauri.conf.json`)
```json
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
    ],
    "security": {
      "csp": "default-src 'self' 'unsafe-inline' https:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; connect-src 'self' https:;"
    }
  },
  "bundle": {
    "active": true,
    "targets": ["msi", "nsis", "dmg", "deb", "appimage"],
    "icon": [
      "icons/32x32.png",
      "icons/128x128.png",
      "icons/128x128@2x.png",
      "icons/icon.icns",
      "icons/icon.ico"
    ]
  }
}
```

---

## 4. 🤖 Automated Multi-Platform CI/CD (GitHub Actions)

Save this workflow as `.github/workflows/build-native.yml` to automatically compile Windows `.exe`, macOS `.dmg`, and Android `.apk` whenever you push a version tag:

```yaml
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
    runs-on: ${{ matrix.platform }}
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

      - name: Install Linux Dependencies (Ubuntu only)
        if: matrix.platform == 'ubuntu-22.04'
        run: |
          sudo apt-get update
          sudo apt-get install -y libwebkit2gtk-4.1-dev build-essential curl wget file libssl-dev libayatana-appindicator3-dev librsvg2-dev

      - name: Install Frontend Dependencies
        run: npm ci

      - name: Build Web Code
        run: npm run build

      - name: Build Native Desktop App with Tauri
        uses: tauri-apps/tauri-action@v0
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tagName: ${{ github.ref_name }}
          releaseName: 'KayBiT_AIprompts ${{ github.ref_name }}'
          releaseBody: 'Automated native release for Windows, macOS, and Linux.'
          releaseDraft: false
          prerelease: false

  build-android:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Setup Java 17
        uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '17'

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci

      - name: Build Web Application
        run: npm run build

      - name: Sync Capacitor Android
        run: |
          npx cap sync android

      - name: Build Android APK
        working-directory: android
        run: ./gradlew assembleRelease

      - name: Upload APK Artifact
        uses: actions/upload-artifact@v4
        with:
          name: KayBiT_AIprompts-Android-Release
          path: android/app/build/outputs/apk/release/app-release-unsigned.apk
```

---

## 5. 🌐 Hosting, Distribution & Student Download Website

### Recommended Storage Structure (AWS S3 / Cloudflare R2 / Vercel):
Host your download center on your website with direct URLs:
```text
https://downloads.kaybit.com/
├── latest/
│   ├── KayBiT_AIprompts-Setup.exe       # Windows (x64)
│   ├── KayBiT_AIprompts-Setup.msi       # Windows Enterprise MSI
│   ├── KayBiT_AIprompts.dmg             # macOS Universal
│   ├── KayBiT_AIprompts.AppImage        # Linux Portable
│   ├── KayBiT_AIprompts.apk             # Android Direct Sideload APK
│   └── version.json                     # Auto-update version manifest
└── v2.4.0/                              # Archived historical versions
```

### HTML Download Badge Widget for Your Website:
```html
<div class="download-container">
  <h3>Install KayBiT_AIprompts on Your Device</h3>
  <div class="download-buttons">
    <a href="https://downloads.kaybit.com/latest/KayBiT_AIprompts-Setup.exe" class="btn btn-win">
      Download for Windows (.exe)
    </a>
    <a href="https://downloads.kaybit.com/latest/KayBiT_AIprompts.dmg" class="btn btn-mac">
      Download for macOS (.dmg)
    </a>
    <a href="https://downloads.kaybit.com/latest/KayBiT_AIprompts.apk" class="btn btn-android">
      Download for Android (.apk)
    </a>
    <a href="https://app.kaybit.com" class="btn btn-pwa">
      Launch Web PWA (All Devices)
    </a>
  </div>
</div>
```

---
*Maintained by KayBiT Byte Technologies DevOps & Tooling Division.*
