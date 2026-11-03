export type ThemeId = 'editorial' | 'technical' | 'warm' | 'elegant-dark' | 'vibrant';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  tagline: string;
  description: string;
  isDark: boolean;
  fontBadge: string;
  colors: {
    bg: string;
    card: string;
    border: string;
    accent: string;
    text: string;
    subtext: string;
  };
  features: string[];
}

export const THEMES: ThemeConfig[] = [
  {
    id: 'editorial',
    name: 'Editorial & Refined',
    tagline: 'Bookish, ivory paper aesthetic with classical serif typography',
    description: 'Serif fonts, generous whitespace, warm linen background, and deep ink contrast for distraction-free reading.',
    isDark: false,
    fontBadge: 'Serif / Newsreader',
    colors: {
      bg: '#fcfbf9',
      card: '#ffffff',
      border: '#e7e2d9',
      accent: '#9a3412',
      text: '#1c1917',
      subtext: '#57534e'
    },
    features: ['Classical Serif typography', 'Generous reading margins', 'Soft parchment light tone', 'Cognac amber accents']
  },
  {
    id: 'technical',
    name: 'Technical & Systematic',
    tagline: 'Monospace terminal matrix with visible grid borders',
    description: 'Monospace fonts, high-density data telemetry, visible grid lines, and terminal emerald phosphors.',
    isDark: true,
    fontBadge: 'Monospace / JetBrains',
    colors: {
      bg: '#080c10',
      card: '#0d131a',
      border: '#1e293b',
      accent: '#10b981',
      text: '#f1f5f9',
      subtext: '#94a3b8'
    },
    features: ['Pure monospace metrics', 'High-density telemetry layout', 'Crisp grid border lines', 'Phosphor green highlights']
  },
  {
    id: 'warm',
    name: 'Warm & Approachable',
    tagline: 'Pastel cards, rounded pill buttons, and soft corners',
    description: 'Pastel cards, friendly rounded geometry, gentle terracotta and apricot accents for an inviting learning feel.',
    isDark: false,
    fontBadge: 'Sans-Serif / Rounded',
    colors: {
      bg: '#fdf8f6',
      card: '#ffffff',
      border: '#fed7aa',
      accent: '#ea580c',
      text: '#292524',
      subtext: '#78716c'
    },
    features: ['Pill buttons & soft cards', 'Warm peach & cream palette', 'Approachable rounded edges', 'Terracotta coral accents']
  },
  {
    id: 'elegant-dark',
    name: 'Elegant Dark',
    tagline: 'Sleek dark mode with tailored high-contrast electric accents',
    description: 'Obsidian dark canvas, electric purple and violet accents, deep focus engineering studio lighting.',
    isDark: true,
    fontBadge: 'Modern Sans / Studio',
    colors: {
      bg: '#090d16',
      card: '#0f172a',
      border: '#1e293b',
      accent: '#9333ea',
      text: '#f8fafc',
      subtext: '#94a3b8'
    },
    features: ['Obsidian dark surface', 'Tailored purple accents', 'High WCAG contrast', 'Sleek low-glare dark studio']
  },
  {
    id: 'vibrant',
    name: 'Vibrant Palette',
    tagline: 'High-energy cyber aesthetic with bold color schemes',
    description: 'Electric neon cyan, hot magenta accents, and hyper-vibrant energy designed for cutting-edge AI coders.',
    isDark: true,
    fontBadge: 'Dynamic Sans / Cyber',
    colors: {
      bg: '#0a081a',
      card: '#14112e',
      border: '#3b2d6a',
      accent: '#06b6d4',
      text: '#ffffff',
      subtext: '#cbd5e1'
    },
    features: ['Electric cyan & neon glow', 'Vibrant cyber palette', 'Bold contrast buttons', 'Futuristic visual depth']
  }
];

export const THEME_STORAGE_KEY = 'kbt_app_theme';

export function getStoredTheme(): ThemeId {
  if (typeof window === 'undefined') return 'elegant-dark';
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved && THEMES.some(t => t.id === saved)) {
      return saved as ThemeId;
    }
  } catch {
    // fallback
  }
  return 'elegant-dark';
}

export function setStoredTheme(themeId: ThemeId): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, themeId);
  } catch {
    // ignore
  }
}

export function applyTheme(themeId: ThemeId): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.setAttribute('data-theme', themeId);
  
  // Also sync CSS color scheme attribute for browser scrollbars and inputs
  const theme = THEMES.find(t => t.id === themeId);
  if (theme) {
    root.style.colorScheme = theme.isDark ? 'dark' : 'light';
    root.style.setProperty('--app-bg', theme.colors.bg);
    root.style.setProperty('--app-card-bg', theme.colors.card);
    root.style.setProperty('--app-card-border', theme.colors.border);
    root.style.setProperty('--app-text-primary', theme.colors.text);
    root.style.setProperty('--app-text-secondary', theme.colors.subtext);
    root.style.setProperty('--app-accent', theme.colors.accent);
  }
}
