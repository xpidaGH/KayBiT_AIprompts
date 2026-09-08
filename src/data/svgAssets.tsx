import React from 'react';

/**
 * Raw SVG string representation of the official KayBiT Hexagonal AI Vector Logo
 */
export const KAYBIT_LOGO_RAW_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0b1220" />
      <stop offset="50%" stop-color="#1c2530" />
      <stop offset="100%" stop-color="#0f172a" />
    </linearGradient>
    <linearGradient id="primaryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#a855f7" />
      <stop offset="50%" stop-color="#7c3aed" />
      <stop offset="100%" stop-color="#06b6d4" />
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="16" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>
  <rect width="512" height="512" rx="96" fill="url(#bgGrad)" />
  <polygon points="256,70 410,158 410,336 256,424 102,336 102,158" fill="none" stroke="url(#primaryGrad)" stroke-width="8" opacity="0.4" />
  <polygon points="256,92 390,168 390,324 256,400 122,324 122,168" fill="#131c2e" stroke="#22304a" stroke-width="4" />
  <g transform="translate(146, 136)" filter="url(#glow)">
    <rect x="20" y="20" width="36" height="200" rx="18" fill="url(#primaryGrad)" />
    <path d="M 40 120 L 160 25 C 172 15 192 25 185 40 L 95 130 Z" fill="#06b6d4" />
    <path d="M 85 115 L 180 215 C 190 226 178 242 162 238 L 45 135 Z" fill="#a855f7" />
    <circle cx="80" cy="120" r="14" fill="#ffffff" />
    <circle cx="80" cy="120" r="22" fill="none" stroke="#22d3ee" stroke-width="3" opacity="0.8" />
  </g>
  <text x="256" y="450" font-family="'Space Grotesk', sans-serif" font-size="32" font-weight="700" fill="#e2e8f0" text-anchor="middle" letter-spacing="4">KayBiT</text>
</svg>`;

/**
 * Reusable KayBiT Hexagonal Node Vector Logo Component
 */
export const KaybitLogoIcon: React.FC<{
  size?: number | string;
  className?: string;
  withGlow?: boolean;
}> = ({ size = 36, className = '', withGlow = true }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      width={size}
      height={size}
      className={`shrink-0 ${className}`}
      aria-label="KayBiT AI Studio Logo"
    >
      <defs>
        <linearGradient id="kbBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0b1220" />
          <stop offset="50%" stopColor="#1c2530" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
        <linearGradient id="kbPrimaryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="50%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
        {withGlow && (
          <filter id="kbGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="16" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        )}
      </defs>
      <rect width="512" height="512" rx="108" fill="url(#kbBgGrad)" />
      {/* Outer Hexagon */}
      <polygon
        points="256,70 410,158 410,336 256,424 102,336 102,158"
        fill="none"
        stroke="url(#kbPrimaryGrad)"
        strokeWidth="10"
        opacity="0.45"
      />
      {/* Inner Hexagon */}
      <polygon
        points="256,94 390,170 390,324 256,400 122,324 122,170"
        fill="#131c2e"
        stroke="#22304a"
        strokeWidth="4"
      />
      {/* K Node Graphic with Core Spark */}
      <g transform="translate(146, 136)" filter={withGlow ? 'url(#kbGlow)' : undefined}>
        <rect x="20" y="20" width="36" height="200" rx="18" fill="url(#kbPrimaryGrad)" />
        <path d="M 40 120 L 160 25 C 172 15 192 25 185 40 L 95 130 Z" fill="#06b6d4" />
        <path d="M 85 115 L 180 215 C 190 226 178 242 162 238 L 45 135 Z" fill="#a855f7" />
        <circle cx="80" cy="120" r="14" fill="#ffffff" />
        <circle cx="80" cy="120" r="22" fill="none" stroke="#22d3ee" strokeWidth="3" opacity="0.8" />
      </g>
    </svg>
  );
};

/**
 * Animated Brand Badge Component used across Header and SplashScreen
 */
export const BrandBadge: React.FC<{
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  pulse?: boolean;
}> = ({ size = 'md', showSubtitle = true, pulse = true }) => {
  const iconSize = size === 'sm' ? 32 : size === 'lg' ? 44 : 38;
  const textSize = size === 'sm' ? 'text-base' : size === 'lg' ? 'text-xl' : 'text-lg';

  return (
    <div className="flex items-center gap-2.5 sm:gap-3">
      <div className="relative group">
        <KaybitLogoIcon size={iconSize} className="shadow-lg shadow-purple-950/40 rounded-xl transition transform group-hover:scale-105" />
        {pulse && (
          <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-cyan-400 rounded-full animate-ping opacity-75 pointer-events-none" />
        )}
      </div>
      <div>
        <div className="flex items-center gap-1.5">
          <span className={`font-bold tracking-tight text-white font-heading ${textSize}`}>
            KayBiT<span className="text-purple-400">_AIprompts</span>
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono font-semibold border border-purple-500/30 hidden sm:inline">
            v2.4
          </span>
        </div>
        {showSubtitle && (
          <p className="text-[11px] text-slate-400 hidden sm:block">
            Advanced Computer Science Prompting & 19-Lang Studio
          </p>
        )}
      </div>
    </div>
  );
};
