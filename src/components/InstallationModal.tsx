import React, { useState } from 'react';
import { X, Download, Terminal, Smartphone, Monitor, Globe, Check, Copy, Sparkles, Image as ImageIcon } from 'lucide-react';
import { KbtBrandShowcase, KbtBrandIcon } from './KbtBrandIcon';

interface InstallationModalProps {
  isOpen: boolean;
  onClose: () => void;
  installationContent: string;
}

export const InstallationModal: React.FC<InstallationModalProps> = ({ isOpen, onClose, installationContent }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'icons' | 'tauri' | 'capacitor' | 'github'>('all');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/90">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/10 border border-cyan-500/20 rounded-lg text-cyan-400">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Native Packaging & Installation Guide
                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono">INSTALLATION.md</span>
              </h2>
              <p className="text-xs text-slate-400">Step-by-step instructions for Android APK, iOS guidelines, Windows .exe/.msi, and macOS .dmg</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Tabs */}
        <div className="flex items-center gap-2 px-6 py-2.5 bg-slate-950/60 border-b border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${activeTab === 'all' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
          >
            Full Guide
          </button>
          <button
            onClick={() => setActiveTab('icons')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${activeTab === 'icons' ? 'bg-lime-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
          >
            <ImageIcon className="w-3.5 h-3.5" /> Brand & App Icons
          </button>
          <button
            onClick={() => setActiveTab('tauri')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${activeTab === 'tauri' ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
          >
            <Monitor className="w-3.5 h-3.5" /> Desktop (Tauri v2)
          </button>
          <button
            onClick={() => setActiveTab('capacitor')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${activeTab === 'capacitor' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
          >
            <Smartphone className="w-3.5 h-3.5" /> Mobile (Capacitor)
          </button>
          <button
            onClick={() => setActiveTab('github')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${activeTab === 'github' ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
          >
            <Terminal className="w-3.5 h-3.5" /> CI/CD Automation
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-slate-200 text-sm leading-relaxed bg-slate-950/30">
          {activeTab === 'all' && (
            <pre className="whitespace-pre-wrap font-sans text-sm text-slate-200 leading-relaxed break-words">
              {installationContent}
            </pre>
          )}

          {activeTab === 'icons' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <h3 className="text-base font-semibold text-lime-400 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" /> Multiplatform Brand Logo & App Icon Specifications
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Tailored according to <code className="text-lime-300 bg-slate-950 px-1 py-0.5 rounded">kbt-integration-guide.txt</code> using the tech-styled green/yellow cyber spider emblem with dynamic SVG squircle masks and multi-resolution sizing.
                </p>
              </div>

              {/* Interactive Showcase */}
              <KbtBrandShowcase />

              {/* Bundling Specifications Table */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="text-sm font-semibold text-white">Multiplatform Asset Bundling Specifications</div>
                <div className="overflow-x-auto text-xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 font-mono">
                        <th className="py-2 px-3">Target Platform</th>
                        <th className="py-2 px-3">Config Location</th>
                        <th className="py-2 px-3">Dimension Layout</th>
                        <th className="py-2 px-3">Asset Type</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-sans text-slate-300">
                      <tr>
                        <td className="py-2.5 px-3 font-semibold text-cyan-300">Desktop (Tauri v2 / Windows & macOS)</td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400">src-tauri/tauri.conf.json</td>
                        <td className="py-2.5 px-3">Up to 512x512 / Title Bar: 24x24</td>
                        <td className="py-2.5 px-3 font-mono text-lime-300">.ico (Windows) / .icns (macOS)</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-semibold text-emerald-300">Mobile (Capacitor / Android & iOS)</td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400">src-cordova/res/icon, android/app</td>
                        <td className="py-2.5 px-3">Adaptive Vectors / App Bar: 28x28</td>
                        <td className="py-2.5 px-3 font-mono text-lime-300">Foreground/Background .png</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-semibold text-purple-300">Web App (Vite & PWA)</td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400">public/manifest.json</td>
                        <td className="py-2.5 px-3">32x32, 192x192, 512x512</td>
                        <td className="py-2.5 px-3 font-mono text-lime-300">Transparent .png / .svg</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Developer Command */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="text-xs font-semibold text-slate-300">Tauri CLI Icon Generator Command:</div>
                <pre className="p-3 rounded-lg bg-black text-lime-400 font-mono text-xs overflow-x-auto">
                  npm run tauri icon ./public/assets/kbt-logo-transparent.png
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'tauri' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <h3 className="text-base font-semibold text-cyan-300 flex items-center gap-2">
                  <Monitor className="w-4 h-4" /> Tauri v2 (Windows .exe/.msi, macOS .dmg, Linux .deb)
                </h3>
                <p className="text-xs text-slate-400">
                  Tauri uses native system webviews (WebView2 on Windows, WebKit on macOS) coupled with a secure Rust backend.
                  Produces an ultra-fast ~8MB executable without the memory overhead of Chromium.
                </p>
                <div className="pt-2">
                  <div className="flex items-center justify-between pb-1">
                    <span className="text-xs font-mono text-slate-400">Quick Commands:</span>
                    <button
                      onClick={() => copyToClipboard('npm install -D @tauri-apps/cli@latest\nnpx tauri init\nnpx tauri build', 'tauri-cmd')}
                      className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
                    >
                      {copiedSection === 'tauri-cmd' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} Copy commands
                    </button>
                  </div>
                  <pre className="p-3 bg-slate-950 rounded-lg font-mono text-xs text-cyan-200 overflow-x-auto">
{`# 1. Install Tauri CLI
npm install -D @tauri-apps/cli@latest

# 2. Initialize Tauri configuration
npx tauri init

# 3. Build production desktop binaries (.exe/.msi/.dmg)
npx tauri build`}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'capacitor' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <h3 className="text-base font-semibold text-emerald-300 flex items-center gap-2">
                  <Smartphone className="w-4 h-4" /> Capacitor by Ionic (Android APK & iOS Guidelines)
                </h3>
                <p className="text-xs text-slate-400">
                  Embeds your compiled Vite/React static assets directly into native Android Studio and Xcode projects without rewriting UI components.
                </p>
                <div className="pt-2">
                  <div className="flex items-center justify-between pb-1">
                    <span className="text-xs font-mono text-slate-400">Quick Commands:</span>
                    <button
                      onClick={() => copyToClipboard('npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios\nnpx cap init KayBiT_AIprompts com.kaybit.aiprompts\nnpm run build\nnpx cap add android\nnpx cap copy\nnpx cap open android', 'cap-cmd')}
                      className="text-xs text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      {copiedSection === 'cap-cmd' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} Copy commands
                    </button>
                  </div>
                  <pre className="p-3 bg-slate-950 rounded-lg font-mono text-xs text-emerald-200 overflow-x-auto">
{`# 1. Install Capacitor packages
npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios

# 2. Initialize mobile project
npx cap init KayBiT_AIprompts com.kaybit.aiprompts --web-dir=dist

# 3. Build web app and add Android/iOS platform
npm run build
npx cap add android
npx cap add ios

# 4. Open in Android Studio to build APK
npx cap open android`}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'github' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <h3 className="text-base font-semibold text-amber-300 flex items-center gap-2">
                  <Terminal className="w-4 h-4" /> GitHub Actions Automated Native Builds
                </h3>
                <p className="text-xs text-slate-400">
                  Push a git tag (e.g. <code>v2.4.0</code>) to automatically compile Windows .exe/.msi, macOS .dmg, and Android .apk in parallel on GitHub runners.
                </p>
                <div className="pt-2">
                  <div className="flex items-center justify-between pb-1">
                    <span className="text-xs font-mono text-slate-400">Trigger Command:</span>
                    <button
                      onClick={() => copyToClipboard('git tag v2.4.0\ngit push origin v2.4.0', 'gh-cmd')}
                      className="text-xs text-amber-400 hover:underline flex items-center gap-1"
                    >
                      {copiedSection === 'gh-cmd' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} Copy commands
                    </button>
                  </div>
                  <pre className="p-3 bg-slate-950 rounded-lg font-mono text-xs text-amber-200 overflow-x-auto">
{`# Tag and push to trigger automated builds
git tag v2.4.0
git push origin v2.4.0`}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
          <button
            onClick={() => copyToClipboard(installationContent, 'full-install')}
            className="flex items-center gap-1.5 text-slate-300 hover:text-white"
          >
            {copiedSection === 'full-install' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedSection === 'full-install' ? 'Copied full guide' : 'Copy entire INSTALLATION.md'}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
