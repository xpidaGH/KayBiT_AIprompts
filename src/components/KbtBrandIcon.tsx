import React from 'react';

export type BrandLogoVariant = 'desktop' | 'mobile' | 'web';

interface KbtBrandIconProps {
  variant?: BrandLogoVariant;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'custom';
  customClass?: string;
  showGlow?: boolean;
  withSquircleMask?: boolean;
}

const ASSET_PATHS = {
  desktop: '/src/assets/images/kbt_desktop_app_icon_1793665583093.jpg',
  mobile: '/src/assets/images/kbt_mobile_app_logo_1793665584021.jpg',
  web: '/src/assets/images/kbt_web_header_logo_1793665583964.jpg'
};

const SIZE_MAP: Record<BrandLogoVariant, Record<'sm' | 'md' | 'lg' | 'xl', string>> = {
  desktop: {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  },
  mobile: {
    sm: 'w-6 h-6',
    md: 'w-7 h-7',
    lg: 'w-9 h-9',
    xl: 'w-12 h-12'
  },
  web: {
    sm: 'w-7 h-7',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-14 h-14'
  }
};

/**
 * KbtBrandIcon - Production Brand Logo & App Icon component
 * Spec-built for Desktop Window Title Bars, Mobile App Bars, and Web Header Bars.
 * Includes Tailwind squircle mask geometry from kbt-integration-guide.txt.
 */
export const KbtBrandIcon: React.FC<KbtBrandIconProps> = ({
  variant = 'web',
  size = 'md',
  customClass = '',
  showGlow = true,
  withSquircleMask = true
}) => {
  const imgSrc = ASSET_PATHS[variant] || ASSET_PATHS.web;
  const sizeClasses = size === 'custom' ? customClass : SIZE_MAP[variant][size];

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 overflow-hidden ${
        withSquircleMask ? 'mask-squircle' : 'rounded-lg'
      } ${sizeClasses} ${customClass} ${
        showGlow ? 'filter drop-shadow-[0_0_8px_rgba(163,230,53,0.45)]' : ''
      }`}
      title={`KBT Brand Logo (${variant.toUpperCase()})`}
    >
      <img
        src={imgSrc}
        alt={`KBT Brand Logo - ${variant}`}
        referrerPolicy="no-referrer"
        className="w-full h-full object-cover select-none transition-transform duration-300 hover:scale-105"
        onError={(e) => {
          // If asset path fails, fallback to secondary generated asset or graceful SVG container
          const target = e.currentTarget;
          if (target.src !== ASSET_PATHS.web) {
            target.src = ASSET_PATHS.web;
          }
        }}
      />
    </div>
  );
};

/**
 * Interactive preview frame showcasing the 3 brand use cases:
 * 1. Desktop (Windows/macOS) Title Bar
 * 2. Mobile App Bar (iOS/Android)
 * 3. Web Header Bar (Web Browsers)
 */
export const KbtBrandShowcase: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-950 border border-slate-800 rounded-2xl">
      {/* 1. Desktop Window Title Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg flex flex-col">
        <div className="bg-slate-950 px-3 py-2 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* macOS traffic lights */}
            <div className="flex items-center gap-1.5 mr-1">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
            </div>
            <KbtBrandIcon variant="desktop" size="sm" withSquircleMask />
            <span className="text-[11px] font-mono text-slate-300 font-semibold truncate">
              KayBiT Studio (macOS / Win)
            </span>
          </div>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 font-mono">
            Desktop Title Bar
          </span>
        </div>
        <div className="p-3 flex items-center gap-3 bg-slate-900/60 flex-1">
          <KbtBrandIcon variant="desktop" size="xl" withSquircleMask showGlow />
          <div className="text-xs">
            <div className="font-bold text-white">Desktop App Icon</div>
            <div className="text-[11px] text-slate-400">Windows (.ico / .msi) & macOS (.icns / .dmg)</div>
            <div className="text-[10px] text-lime-400 font-mono mt-0.5">Resized to 24px–512px with Squircle</div>
          </div>
        </div>
      </div>

      {/* 2. Mobile App Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg flex flex-col">
        <div className="bg-black px-3 py-1.5 border-b border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
          <span>9:41</span>
          <div className="w-12 h-2.5 bg-zinc-800 rounded-full" />
          <span>5G 100%</span>
        </div>
        <div className="bg-slate-950 px-3 py-2 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <KbtBrandIcon variant="mobile" size="md" withSquircleMask />
            <span className="text-xs font-bold text-white tracking-wide">KayBiT Mobile</span>
          </div>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 font-mono">
            Mobile App Bar
          </span>
        </div>
        <div className="p-3 flex items-center gap-3 bg-slate-900/60 flex-1">
          <KbtBrandIcon variant="mobile" size="xl" withSquircleMask showGlow />
          <div className="text-xs">
            <div className="font-bold text-white">Mobile Brand Logo</div>
            <div className="text-[11px] text-slate-400">iOS (Capacitor/Xcode) & Android (.apk/.aab)</div>
            <div className="text-[10px] text-emerald-400 font-mono mt-0.5">Resized to 28px–192px Squircle</div>
          </div>
        </div>
      </div>

      {/* 3. Web Header Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg flex flex-col">
        <div className="bg-slate-950 px-3 py-2 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <KbtBrandIcon variant="web" size="md" withSquircleMask />
            <span className="text-xs font-bold text-white tracking-wide">KayBiT Web Hub</span>
          </div>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 font-mono">
            Web Header Bar
          </span>
        </div>
        <div className="p-3 flex items-center gap-3 bg-slate-900/60 flex-1">
          <KbtBrandIcon variant="web" size="xl" withSquircleMask showGlow />
          <div className="text-xs">
            <div className="font-bold text-white">Web Header Logo</div>
            <div className="text-[11px] text-slate-400">Modern Desktop Web, PWA & Responsive Nav</div>
            <div className="text-[10px] text-purple-400 font-mono mt-0.5">Resized to 32px–512px High-Res</div>
          </div>
        </div>
      </div>
    </div>
  );
};
