export interface ShortcutDefinition {
  id: string;
  category: 'navigation' | 'agent' | 'curriculum' | 'studio';
  keys: string[];
  displayKeys: string[];
  label: string;
  description: string;
  global?: boolean;
}

export const KEYBOARD_SHORTCUTS: ShortcutDefinition[] = [
  // Navigation
  {
    id: 'nav-agent',
    category: 'navigation',
    keys: ['1', 'Alt+1', 'Ctrl+1'],
    displayKeys: ['1'],
    label: 'Switch to AI Agent',
    description: 'Jump to Component 1: General Coding Assistant & Voice I/O',
    global: true
  },
  {
    id: 'nav-curriculum',
    category: 'navigation',
    keys: ['2', 'Alt+2', 'Ctrl+2'],
    displayKeys: ['2'],
    label: 'Switch to Curriculum Generator',
    description: 'Jump to Component 2: 19-Language Linked Curriculum Suite',
    global: true
  },
  {
    id: 'nav-splash',
    category: 'navigation',
    keys: ['h', 'Alt+h'],
    displayKeys: ['H'],
    label: 'Home / Welcome Screen',
    description: 'Return to the interactive splash screen overview',
    global: true
  },
  {
    id: 'nav-shortcuts',
    category: 'navigation',
    keys: ['?', 'Shift+?'],
    displayKeys: ['?'],
    label: 'Keyboard Shortcuts Modal',
    description: 'Open this cheat sheet of all navigation and control shortcuts',
    global: true
  },

  // Agent & Prompts
  {
    id: 'agent-submit',
    category: 'agent',
    keys: ['Ctrl+Enter', 'Meta+Enter'],
    displayKeys: ['Ctrl', '↵'],
    label: 'Transmit Prompt to Agent',
    description: 'Send current prompt to selected AI provider (AI Studio, Claude, Cursor, etc.)',
    global: true
  },
  {
    id: 'agent-focus-prompt',
    category: 'agent',
    keys: ['Ctrl+k', 'Meta+k'],
    displayKeys: ['Ctrl', 'K'],
    label: 'Focus Prompt Input',
    description: 'Quickly focus cursor on the AI prompt text area from anywhere',
    global: true
  },
  {
    id: 'agent-prompt-history',
    category: 'agent',
    keys: ['Alt+p', 'Ctrl+Shift+p'],
    displayKeys: ['Alt', 'P'],
    label: 'Open Prompt Compare / History',
    description: 'View version diffs, prompt revisions, and critique side-by-side',
    global: true
  },
  {
    id: 'agent-toggle-syntax',
    category: 'agent',
    keys: ['Alt+s'],
    displayKeys: ['Alt', 'S'],
    label: 'Toggle Prism.js Highlighting',
    description: 'Switch between Prism syntax highlighted code and raw text view',
    global: true
  },
  {
    id: 'agent-voice-toggle',
    category: 'agent',
    keys: ['Alt+v'],
    displayKeys: ['Alt', 'V'],
    label: 'Voice Dictation Toggle',
    description: 'Toggle speech-to-text recognition in active UI language',
    global: true
  },

  // Curriculum Suite
  {
    id: 'curr-preview',
    category: 'curriculum',
    keys: ['Ctrl+p', 'Meta+p', 'Alt+o'],
    displayKeys: ['Alt', 'O'],
    label: 'Interactive HTML Preview',
    description: 'Launch the multi-language linked HTML suite sandbox modal',
    global: true
  },
  {
    id: 'curr-export-html',
    category: 'curriculum',
    keys: ['Ctrl+Shift+e'],
    displayKeys: ['Ctrl', 'Shift', 'E'],
    label: 'Export 19-Language ZIP',
    description: 'Compile and download linked offline HTML curriculum package',
    global: true
  },
  {
    id: 'curr-filter-tags',
    category: 'curriculum',
    keys: ['Alt+t'],
    displayKeys: ['Alt', 'T'],
    label: 'Manage Subject Tags',
    description: 'Open tag management modal to customize curriculum metadata',
    global: true
  },

  // Studio Controls & Modals
  {
    id: 'studio-user-guide',
    category: 'studio',
    keys: ['u', 'Alt+u'],
    displayKeys: ['U'],
    label: 'Open User Guide',
    description: 'Browse complete user manual, guidelines, and documentation',
    global: true
  },
  {
    id: 'studio-install-guide',
    category: 'studio',
    keys: ['i', 'Alt+i'],
    displayKeys: ['I'],
    label: 'Install Native Package Guide',
    description: 'Instructions for Android APK, Windows .exe, macOS .dmg, Tauri & PWA',
    global: true
  },
  {
    id: 'studio-escape',
    category: 'studio',
    keys: ['Escape'],
    displayKeys: ['Esc'],
    label: 'Close Active Modal / Dropdown',
    description: 'Dismiss any open dialog, modal sheet, or menu drawer',
    global: true
  }
];

export const SHORTCUT_CATEGORIES = [
  { id: 'all', label: 'All Shortcuts' },
  { id: 'navigation', label: 'Navigation' },
  { id: 'agent', label: 'Agent & Prompts' },
  { id: 'curriculum', label: 'Curriculum Suite' },
  { id: 'studio', label: 'Studio & System' }
] as const;
