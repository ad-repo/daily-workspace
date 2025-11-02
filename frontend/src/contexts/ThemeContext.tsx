import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode } from 'react';

// Theme definition interface
export interface Theme {
  id: string;
  name: string;
  description?: string;
  colors: {
    // Background colors
    bgPrimary: string;
    bgSecondary: string;
    bgTertiary: string;
    bgHover: string;
    
    // Text colors
    textPrimary: string;
    textSecondary: string;
    textTertiary: string;
    
    // Border colors
    borderPrimary: string;
    borderSecondary: string;
    
    // Accent colors
    accent: string;
    accentHover: string;
    accentText: string;
    
    // Semantic colors
    success: string;
    error: string;
    warning: string;
    info: string;
    
    // Card colors
    cardBg: string;
    cardBorder: string;
    cardShadow: string;
  };
}

// Predefined themes
export const themes: Record<string, Theme> = {
  light: {
    id: 'light',
    name: 'Light',
    description: 'Clean and bright',
    colors: {
      bgPrimary: '#ffffff',
      bgSecondary: '#f9fafb',
      bgTertiary: '#f3f4f6',
      bgHover: '#f3f4f6',
      
      textPrimary: '#111827',
      textSecondary: '#4b5563',
      textTertiary: '#9ca3af',
      
      borderPrimary: '#e5e7eb',
      borderSecondary: '#d1d5db',
      
      accent: '#3b82f6',
      accentHover: '#2563eb',
      accentText: '#ffffff',
      
      success: '#10b981',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#3b82f6',
      
      cardBg: '#ffffff',
      cardBorder: '#e5e7eb',
      cardShadow: 'rgba(0, 0, 0, 0.1)',
    },
  },
  dark: {
    id: 'dark',
    name: 'Dark',
    description: 'Easy on the eyes',
    colors: {
      bgPrimary: '#0f172a',
      bgSecondary: '#1e293b',
      bgTertiary: '#334155',
      bgHover: '#334155',
      
      textPrimary: '#f1f5f9',
      textSecondary: '#cbd5e1',
      textTertiary: '#94a3b8',
      
      borderPrimary: '#334155',
      borderSecondary: '#475569',
      
      accent: '#3b82f6',
      accentHover: '#2563eb',
      accentText: '#ffffff',
      
      success: '#10b981',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#3b82f6',
      
      cardBg: '#1e293b',
      cardBorder: '#334155',
      cardShadow: 'rgba(0, 0, 0, 0.3)',
    },
  },
  midnight: {
    id: 'midnight',
    name: 'Midnight',
    description: 'Deep dark blue',
    colors: {
      bgPrimary: '#0a0e1a',
      bgSecondary: '#111827',
      bgTertiary: '#1f2937',
      bgHover: '#1f2937',
      
      textPrimary: '#e0e7ff',
      textSecondary: '#c7d2fe',
      textTertiary: '#a5b4fc',
      
      borderPrimary: '#1e3a8a',
      borderSecondary: '#2563eb',
      
      accent: '#6366f1',
      accentHover: '#4f46e5',
      accentText: '#ffffff',
      
      success: '#10b981',
      error: '#f87171',
      warning: '#fbbf24',
      info: '#60a5fa',
      
      cardBg: '#111827',
      cardBorder: '#1e3a8a',
      cardShadow: 'rgba(99, 102, 241, 0.1)',
    },
  },
  forest: {
    id: 'forest',
    name: 'Forest',
    description: 'Natural green tones',
    colors: {
      bgPrimary: '#0a1f0a',
      bgSecondary: '#14532d',
      bgTertiary: '#166534',
      bgHover: '#166534',
      
      textPrimary: '#f0fdf4',
      textSecondary: '#dcfce7',
      textTertiary: '#bbf7d0',
      
      borderPrimary: '#166534',
      borderSecondary: '#22c55e',
      
      accent: '#22c55e',
      accentHover: '#16a34a',
      accentText: '#ffffff',
      
      success: '#22c55e',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#3b82f6',
      
      cardBg: '#14532d',
      cardBorder: '#166534',
      cardShadow: 'rgba(34, 197, 94, 0.1)',
    },
  },
  sunset: {
    id: 'sunset',
    name: 'Sunset',
    description: 'Warm orange and pink',
    colors: {
      bgPrimary: '#1a0a0f',
      bgSecondary: '#431407',
      bgTertiary: '#7c2d12',
      bgHover: '#7c2d12',
      
      textPrimary: '#fff7ed',
      textSecondary: '#fed7aa',
      textTertiary: '#fdba74',
      
      borderPrimary: '#7c2d12',
      borderSecondary: '#ea580c',
      
      accent: '#f97316',
      accentHover: '#ea580c',
      accentText: '#ffffff',
      
      success: '#10b981',
      error: '#ef4444',
      warning: '#fbbf24',
      info: '#3b82f6',
      
      cardBg: '#431407',
      cardBorder: '#7c2d12',
      cardShadow: 'rgba(249, 115, 22, 0.1)',
    },
  },
  ocean: {
    id: 'ocean',
    name: 'Ocean',
    description: 'Deep blue waters',
    colors: {
      bgPrimary: '#0c1821',
      bgSecondary: '#1b2838',
      bgTertiary: '#2c3e50',
      bgHover: '#2c3e50',
      
      textPrimary: '#ecf0f1',
      textSecondary: '#bdc3c7',
      textTertiary: '#95a5a6',
      
      borderPrimary: '#2c3e50',
      borderSecondary: '#3498db',
      
      accent: '#3498db',
      accentHover: '#2980b9',
      accentText: '#ffffff',
      
      success: '#1abc9c',
      error: '#e74c3c',
      warning: '#f39c12',
      info: '#3498db',
      
      cardBg: '#1b2838',
      cardBorder: '#2c3e50',
      cardShadow: 'rgba(52, 152, 219, 0.1)',
    },
  },
  mocha: {
    id: 'mocha',
    name: 'Mocha',
    description: 'Rich coffee tones',
    colors: {
      bgPrimary: '#1a1512',
      bgSecondary: '#2d2419',
      bgTertiary: '#3e3127',
      bgHover: '#3e3127',
      
      textPrimary: '#f5f1e8',
      textSecondary: '#d4c5b0',
      textTertiary: '#b8a68f',
      
      borderPrimary: '#3e3127',
      borderSecondary: '#8b6f47',
      
      accent: '#d4a574',
      accentHover: '#c49563',
      accentText: '#1a1512',
      
      success: '#82b74b',
      error: '#e05d44',
      warning: '#f0ad4e',
      info: '#6fa8dc',
      
      cardBg: '#2d2419',
      cardBorder: '#3e3127',
      cardShadow: 'rgba(212, 165, 116, 0.1)',
    },
  },
  lavender: {
    id: 'lavender',
    name: 'Lavender',
    description: 'Soft purple dreams',
    colors: {
      bgPrimary: '#1a1525',
      bgSecondary: '#2a1f3d',
      bgTertiary: '#3d2f54',
      bgHover: '#3d2f54',
      
      textPrimary: '#f3e8ff',
      textSecondary: '#e9d5ff',
      textTertiary: '#d8b4fe',
      
      borderPrimary: '#3d2f54',
      borderSecondary: '#8b5cf6',
      
      accent: '#a78bfa',
      accentHover: '#8b5cf6',
      accentText: '#ffffff',
      
      success: '#4ade80',
      error: '#f87171',
      warning: '#fbbf24',
      info: '#60a5fa',
      
      cardBg: '#2a1f3d',
      cardBorder: '#3d2f54',
      cardShadow: 'rgba(167, 139, 250, 0.1)',
    },
  },
  nord: {
    id: 'nord',
    name: 'Nord',
    description: 'Arctic inspired',
    colors: {
      bgPrimary: '#2e3440',
      bgSecondary: '#3b4252',
      bgTertiary: '#434c5e',
      bgHover: '#434c5e',
      
      textPrimary: '#eceff4',
      textSecondary: '#e5e9f0',
      textTertiary: '#d8dee9',
      
      borderPrimary: '#434c5e',
      borderSecondary: '#4c566a',
      
      accent: '#88c0d0',
      accentHover: '#81a1c1',
      accentText: '#2e3440',
      
      success: '#a3be8c',
      error: '#bf616a',
      warning: '#ebcb8b',
      info: '#5e81ac',
      
      cardBg: '#3b4252',
      cardBorder: '#434c5e',
      cardShadow: 'rgba(136, 192, 208, 0.1)',
    },
  },
  dracula: {
    id: 'dracula',
    name: 'Dracula',
    description: 'Classic vampire theme',
    colors: {
      bgPrimary: '#282a36',
      bgSecondary: '#383a59',
      bgTertiary: '#44475a',
      bgHover: '#44475a',
      
      textPrimary: '#f8f8f2',
      textSecondary: '#f8f8f2',
      textTertiary: '#6272a4',
      
      borderPrimary: '#44475a',
      borderSecondary: '#6272a4',
      
      accent: '#bd93f9',
      accentHover: '#9580e0',
      accentText: '#282a36',
      
      success: '#50fa7b',
      error: '#ff5555',
      warning: '#f1fa8c',
      info: '#8be9fd',
      
      cardBg: '#383a59',
      cardBorder: '#44475a',
      cardShadow: 'rgba(189, 147, 249, 0.1)',
    },
  },
  solarized: {
    id: 'solarized',
    name: 'Solarized Dark',
    description: 'Easy on the eyes',
    colors: {
      bgPrimary: '#002b36',
      bgSecondary: '#073642',
      bgTertiary: '#586e75',
      bgHover: '#586e75',
      
      textPrimary: '#fdf6e3',
      textSecondary: '#eee8d5',
      textTertiary: '#93a1a1',
      
      borderPrimary: '#073642',
      borderSecondary: '#586e75',
      
      accent: '#268bd2',
      accentHover: '#2176b3',
      accentText: '#fdf6e3',
      
      success: '#859900',
      error: '#dc322f',
      warning: '#b58900',
      info: '#268bd2',
      
      cardBg: '#073642',
      cardBorder: '#586e75',
      cardShadow: 'rgba(38, 139, 210, 0.1)',
    },
  },
  highContrast: {
    id: 'highContrast',
    name: 'High Contrast',
    description: 'Maximum readability',
    colors: {
      bgPrimary: '#000000',
      bgSecondary: '#1a1a1a',
      bgTertiary: '#2d2d2d',
      bgHover: '#2d2d2d',
      
      textPrimary: '#ffffff',
      textSecondary: '#ffffff',
      textTertiary: '#cccccc',
      
      borderPrimary: '#ffffff',
      borderSecondary: '#ffffff',
      
      accent: '#00ff00',
      accentHover: '#00cc00',
      accentText: '#000000',
      
      success: '#00ff00',
      error: '#ff0000',
      warning: '#ffff00',
      info: '#00ffff',
      
      cardBg: '#1a1a1a',
      cardBorder: '#ffffff',
      cardShadow: 'rgba(255, 255, 255, 0.2)',
    },
  },
  cyberpunk: {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    description: 'Neon future vibes',
    colors: {
      bgPrimary: '#0a0e27',
      bgSecondary: '#16213e',
      bgTertiary: '#1a1f3a',
      bgHover: '#1a1f3a',
      
      textPrimary: '#00fff9',
      textSecondary: '#0ef3f7',
      textTertiary: '#0db3b8',
      
      borderPrimary: '#1a1f3a',
      borderSecondary: '#ff00ff',
      
      accent: '#ff00ff',
      accentHover: '#cc00cc',
      accentText: '#0a0e27',
      
      success: '#00ff41',
      error: '#ff0055',
      warning: '#ffea00',
      info: '#00fff9',
      
      cardBg: '#16213e',
      cardBorder: '#ff00ff',
      cardShadow: 'rgba(255, 0, 255, 0.2)',
    },
  },
  gruvbox: {
    id: 'gruvbox',
    name: 'Gruvbox',
    description: 'Retro warm colors',
    colors: {
      bgPrimary: '#282828',
      bgSecondary: '#3c3836',
      bgTertiary: '#504945',
      bgHover: '#504945',
      
      textPrimary: '#ebdbb2',
      textSecondary: '#d5c4a1',
      textTertiary: '#bdae93',
      
      borderPrimary: '#504945',
      borderSecondary: '#665c54',
      
      accent: '#fe8019',
      accentHover: '#d65d0e',
      accentText: '#282828',
      
      success: '#b8bb26',
      error: '#fb4934',
      warning: '#fabd2f',
      info: '#83a598',
      
      cardBg: '#3c3836',
      cardBorder: '#504945',
      cardShadow: 'rgba(254, 128, 25, 0.1)',
    },
  },
  coral: {
    id: 'coral',
    name: 'Coral Reef',
    description: 'Bright coral and pink',
    colors: {
      bgPrimary: '#fff0f5',
      bgSecondary: '#ffd6e7',
      bgTertiary: '#ffb3d9',
      bgHover: '#ff99cc',
      
      textPrimary: '#6b0028',
      textSecondary: '#9b0039',
      textTertiary: '#cb004b',
      
      borderPrimary: '#ff80bf',
      borderSecondary: '#ff4da6',
      
      accent: '#ff1a8c',
      accentHover: '#e60073',
      accentText: '#ffffff',
      
      success: '#00ff88',
      error: '#ff0055',
      warning: '#ffaa00',
      info: '#0099ff',
      
      cardBg: '#ffffff',
      cardBorder: '#ffb3e6',
      cardShadow: 'rgba(255, 26, 140, 0.25)',
    },
  },
  aqua: {
    id: 'aqua',
    name: 'Aqua Dream',
    description: 'Bright turquoise and teal',
    colors: {
      bgPrimary: '#e6ffff',
      bgSecondary: '#b3f5ff',
      bgTertiary: '#80ebff',
      bgHover: '#4de0ff',
      
      textPrimary: '#003d47',
      textSecondary: '#00667a',
      textTertiary: '#008fad',
      
      borderPrimary: '#1ac9e6',
      borderSecondary: '#00b8d9',
      
      accent: '#00d9ff',
      accentHover: '#00bfff',
      accentText: '#003344',
      
      success: '#00ff99',
      error: '#ff3366',
      warning: '#ffbb00',
      info: '#0099ff',
      
      cardBg: '#ffffff',
      cardBorder: '#66e0ff',
      cardShadow: 'rgba(0, 217, 255, 0.3)',
    },
  },
  candy: {
    id: 'candy',
    name: 'Candy Pop',
    description: 'Sweet pastel colors',
    colors: {
      bgPrimary: '#fff0f8',
      bgSecondary: '#fce4f4',
      bgTertiary: '#f8d4f0',
      bgHover: '#f4c4ec',
      
      textPrimary: '#4a1555',
      textSecondary: '#7a2580',
      textTertiary: '#a035aa',
      
      borderPrimary: '#f0a4e8',
      borderSecondary: '#e874e0',
      
      accent: '#d946ef',
      accentHover: '#c026d3',
      accentText: '#ffffff',
      
      success: '#10d97f',
      error: '#f43f5e',
      warning: '#fbbf24',
      info: '#8b5cf6',
      
      cardBg: '#ffffff',
      cardBorder: '#f8c8f0',
      cardShadow: 'rgba(217, 70, 239, 0.15)',
    },
  },
  citrus: {
    id: 'citrus',
    name: 'Citrus Burst',
    description: 'Bright lime and yellow',
    colors: {
      bgPrimary: '#ffffe6',
      bgSecondary: '#ffffb3',
      bgTertiary: '#ffff80',
      bgHover: '#ffff4d',
      
      textPrimary: '#4d4000',
      textSecondary: '#665500',
      textTertiary: '#806a00',
      
      borderPrimary: '#ffdd00',
      borderSecondary: '#ffcc00',
      
      accent: '#dfff00',
      accentHover: '#ccff00',
      accentText: '#333300',
      
      success: '#88ff00',
      error: '#ff6600',
      warning: '#ffaa00',
      info: '#00ccff',
      
      cardBg: '#ffffff',
      cardBorder: '#ffff66',
      cardShadow: 'rgba(223, 255, 0, 0.3)',
    },
  },
  sky: {
    id: 'sky',
    name: 'Sky High',
    description: 'Bright blue skies',
    colors: {
      bgPrimary: '#f0f8ff',
      bgSecondary: '#d4ecff',
      bgTertiary: '#b8e0ff',
      bgHover: '#9cd4ff',
      
      textPrimary: '#002855',
      textSecondary: '#004080',
      textTertiary: '#0058aa',
      
      borderPrimary: '#80c8ff',
      borderSecondary: '#64bcff',
      
      accent: '#0ea5e9',
      accentHover: '#0284c7',
      accentText: '#ffffff',
      
      success: '#22c55e',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#3b82f6',
      
      cardBg: '#ffffff',
      cardBorder: '#a4d8ff',
      cardShadow: 'rgba(14, 165, 233, 0.15)',
    },
  },
  tangerine: {
    id: 'tangerine',
    name: 'Tangerine',
    description: 'Bright orange energy',
    colors: {
      bgPrimary: '#fff5e6',
      bgSecondary: '#ffe0b3',
      bgTertiary: '#ffcc80',
      bgHover: '#ffb84d',
      
      textPrimary: '#4d2600',
      textSecondary: '#663300',
      textTertiary: '#804000',
      
      borderPrimary: '#ffa64d',
      borderSecondary: '#ff9933',
      
      accent: '#ff8800',
      accentHover: '#ff6600',
      accentText: '#ffffff',
      
      success: '#00ff66',
      error: '#ff3333',
      warning: '#ffcc00',
      info: '#0099ff',
      
      cardBg: '#ffffff',
      cardBorder: '#ffb366',
      cardShadow: 'rgba(255, 136, 0, 0.3)',
    },
  },
  bubblegum: {
    id: 'bubblegum',
    name: 'Bubblegum',
    description: 'Sweet pink and blue',
    colors: {
      bgPrimary: '#fef3ff',
      bgSecondary: '#fae8ff',
      bgTertiary: '#f5d0fe',
      bgHover: '#f0b8fd',
      
      textPrimary: '#4a0844',
      textSecondary: '#701a75',
      textTertiary: '#a21caf',
      
      borderPrimary: '#e9a0fc',
      borderSecondary: '#e078fa',
      
      accent: '#d946ef',
      accentHover: '#c026d3',
      accentText: '#ffffff',
      
      success: '#22d3ee',
      error: '#f43f5e',
      warning: '#fbbf24',
      info: '#a78bfa',
      
      cardBg: '#ffffff',
      cardBorder: '#f0c0fe',
      cardShadow: 'rgba(217, 70, 239, 0.15)',
    },
  },
  mint: {
    id: 'mint',
    name: 'Mint Fresh',
    description: 'Cool mint and green',
    colors: {
      bgPrimary: '#e6fff2',
      bgSecondary: '#b3ffd9',
      bgTertiary: '#80ffc0',
      bgHover: '#4dffa6',
      
      textPrimary: '#004d29',
      textSecondary: '#006633',
      textTertiary: '#008844',
      
      borderPrimary: '#1aff99',
      borderSecondary: '#00ff88',
      
      accent: '#00ff77',
      accentHover: '#00e66b',
      accentText: '#003322',
      
      success: '#00ff66',
      error: '#ff3366',
      warning: '#ffaa00',
      info: '#00bbff',
      
      cardBg: '#ffffff',
      cardBorder: '#66ffaa',
      cardShadow: 'rgba(0, 255, 119, 0.3)',
    },
  },
  
  // ADDITIONAL VIBRANT THEMES FOR FULL SPECTRUM
  crimson: {
    id: 'crimson',
    name: 'Crimson',
    description: 'Bold red and burgundy',
    colors: {
      bgPrimary: '#fef2f2',
      bgSecondary: '#fee2e2',
      bgTertiary: '#fecaca',
      bgHover: '#fef2f2',
      textPrimary: '#7f1d1d',
      textSecondary: '#991b1b',
      textTertiary: '#b91c1c',
      borderPrimary: '#fca5a5',
      borderSecondary: '#f87171',
      accent: '#dc2626',
      accentHover: '#b91c1c',
      accentText: '#ffffff',
      success: '#10b981',
      error: '#dc2626',
      warning: '#f59e0b',
      info: '#3b82f6',
      cardBg: '#ffffff',
      cardBorder: '#fca5a5',
      cardShadow: 'rgba(220, 38, 38, 0.2)',
    },
  },
  
  royal: {
    id: 'royal',
    name: 'Royal Purple',
    description: 'Majestic deep purple',
    colors: {
      bgPrimary: '#faf5ff',
      bgSecondary: '#f3e8ff',
      bgTertiary: '#e9d5ff',
      bgHover: '#f3e8ff',
      textPrimary: '#581c87',
      textSecondary: '#6b21a8',
      textTertiary: '#7c3aed',
      borderPrimary: '#d8b4fe',
      borderSecondary: '#c084fc',
      accent: '#9333ea',
      accentHover: '#7c3aed',
      accentText: '#ffffff',
      success: '#10b981',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#8b5cf6',
      cardBg: '#ffffff',
      cardBorder: '#d8b4fe',
      cardShadow: 'rgba(147, 51, 234, 0.2)',
    },
  },
  
  emerald: {
    id: 'emerald',
    name: 'Emerald',
    description: 'Rich jewel green',
    colors: {
      bgPrimary: '#ecfdf5',
      bgSecondary: '#d1fae5',
      bgTertiary: '#a7f3d0',
      bgHover: '#d1fae5',
      textPrimary: '#064e3b',
      textSecondary: '#065f46',
      textTertiary: '#047857',
      borderPrimary: '#6ee7b7',
      borderSecondary: '#34d399',
      accent: '#10b981',
      accentHover: '#059669',
      accentText: '#ffffff',
      success: '#10b981',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#06b6d4',
      cardBg: '#ffffff',
      cardBorder: '#6ee7b7',
      cardShadow: 'rgba(16, 185, 129, 0.25)',
    },
  },
  
  amber: {
    id: 'amber',
    name: 'Amber Glow',
    description: 'Warm golden amber',
    colors: {
      bgPrimary: '#fffbeb',
      bgSecondary: '#fef3c7',
      bgTertiary: '#fde68a',
      bgHover: '#fef3c7',
      textPrimary: '#78350f',
      textSecondary: '#92400e',
      textTertiary: '#b45309',
      borderPrimary: '#fcd34d',
      borderSecondary: '#fbbf24',
      accent: '#f59e0b',
      accentHover: '#d97706',
      accentText: '#ffffff',
      success: '#10b981',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#3b82f6',
      cardBg: '#ffffff',
      cardBorder: '#fcd34d',
      cardShadow: 'rgba(245, 158, 11, 0.2)',
    },
  },
  
  rose: {
    id: 'rose',
    name: 'Rose Garden',
    description: 'Elegant rose pink',
    colors: {
      bgPrimary: '#fff1f2',
      bgSecondary: '#ffe4e6',
      bgTertiary: '#fecdd3',
      bgHover: '#ffe4e6',
      textPrimary: '#881337',
      textSecondary: '#9f1239',
      textTertiary: '#be123c',
      borderPrimary: '#fda4af',
      borderSecondary: '#fb7185',
      accent: '#f43f5e',
      accentHover: '#e11d48',
      accentText: '#ffffff',
      success: '#10b981',
      error: '#f43f5e',
      warning: '#f59e0b',
      info: '#ec4899',
      cardBg: '#ffffff',
      cardBorder: '#fda4af',
      cardShadow: 'rgba(244, 63, 94, 0.2)',
    },
  },
  
  sapphire: {
    id: 'sapphire',
    name: 'Sapphire',
    description: 'Deep brilliant blue',
    colors: {
      bgPrimary: '#eff6ff',
      bgSecondary: '#dbeafe',
      bgTertiary: '#bfdbfe',
      bgHover: '#dbeafe',
      textPrimary: '#1e3a8a',
      textSecondary: '#1e40af',
      textTertiary: '#2563eb',
      borderPrimary: '#93c5fd',
      borderSecondary: '#60a5fa',
      accent: '#3b82f6',
      accentHover: '#2563eb',
      accentText: '#ffffff',
      success: '#10b981',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#3b82f6',
      cardBg: '#ffffff',
      cardBorder: '#93c5fd',
      cardShadow: 'rgba(59, 130, 246, 0.25)',
    },
  },
  
  neon: {
    id: 'neon',
    name: 'Neon Lights',
    description: 'Electric neon colors',
    colors: {
      bgPrimary: '#0a0a0a',
      bgSecondary: '#1a1a1a',
      bgTertiary: '#2a2a2a',
      bgHover: '#333333',
      textPrimary: '#00ff9f',
      textSecondary: '#00e5ff',
      textTertiary: '#ff00ff',
      borderPrimary: '#00ff9f',
      borderSecondary: '#00e5ff',
      accent: '#ff00ff',
      accentHover: '#ff3fff',
      accentText: '#000000',
      success: '#00ff9f',
      error: '#ff0055',
      warning: '#ffff00',
      info: '#00e5ff',
      cardBg: '#141414',
      cardBorder: '#00ff9f',
      cardShadow: 'rgba(0, 255, 159, 0.3)',
    },
  },
  
  cherry: {
    id: 'cherry',
    name: 'Cherry Blossom',
    description: 'Soft cherry pink',
    colors: {
      bgPrimary: '#fdf2f8',
      bgSecondary: '#fce7f3',
      bgTertiary: '#fbcfe8',
      bgHover: '#fce7f3',
      textPrimary: '#831843',
      textSecondary: '#9d174d',
      textTertiary: '#be185d',
      borderPrimary: '#f9a8d4',
      borderSecondary: '#f472b6',
      accent: '#ec4899',
      accentHover: '#db2777',
      accentText: '#ffffff',
      success: '#10b981',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#ec4899',
      cardBg: '#ffffff',
      cardBorder: '#f9a8d4',
      cardShadow: 'rgba(236, 72, 153, 0.2)',
    },
  },
  
  slate: {
    id: 'slate',
    name: 'Slate',
    description: 'Cool gray tones',
    colors: {
      bgPrimary: '#f8fafc',
      bgSecondary: '#f1f5f9',
      bgTertiary: '#e2e8f0',
      bgHover: '#f1f5f9',
      textPrimary: '#0f172a',
      textSecondary: '#334155',
      textTertiary: '#64748b',
      borderPrimary: '#cbd5e1',
      borderSecondary: '#94a3b8',
      accent: '#3b82f6',
      accentHover: '#2563eb',
      accentText: '#ffffff',
      success: '#10b981',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#3b82f6',
      cardBg: '#ffffff',
      cardBorder: '#cbd5e1',
      cardShadow: 'rgba(100, 116, 139, 0.1)',
    },
  },
  
  volcano: {
    id: 'volcano',
    name: 'Volcano',
    description: 'Fiery orange and red',
    colors: {
      bgPrimary: '#fff7ed',
      bgSecondary: '#ffedd5',
      bgTertiary: '#fed7aa',
      bgHover: '#ffedd5',
      textPrimary: '#7c2d12',
      textSecondary: '#9a3412',
      textTertiary: '#c2410c',
      borderPrimary: '#fdba74',
      borderSecondary: '#fb923c',
      accent: '#f97316',
      accentHover: '#ea580c',
      accentText: '#ffffff',
      success: '#10b981',
      error: '#dc2626',
      warning: '#f97316',
      info: '#3b82f6',
      cardBg: '#ffffff',
      cardBorder: '#fdba74',
      cardShadow: 'rgba(249, 115, 22, 0.25)',
    },
  },
  
  indigo: {
    id: 'indigo',
    name: 'Indigo Night',
    description: 'Deep indigo blue',
    colors: {
      bgPrimary: '#eef2ff',
      bgSecondary: '#e0e7ff',
      bgTertiary: '#c7d2fe',
      bgHover: '#e0e7ff',
      textPrimary: '#312e81',
      textSecondary: '#3730a3',
      textTertiary: '#4338ca',
      borderPrimary: '#a5b4fc',
      borderSecondary: '#818cf8',
      accent: '#6366f1',
      accentHover: '#4f46e5',
      accentText: '#ffffff',
      success: '#10b981',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#6366f1',
      cardBg: '#ffffff',
      cardBorder: '#a5b4fc',
      cardShadow: 'rgba(99, 102, 241, 0.25)',
    },
  },
  
  lime: {
    id: 'lime',
    name: 'Lime Punch',
    description: 'Bright electric lime',
    colors: {
      bgPrimary: '#f7fee7',
      bgSecondary: '#ecfccb',
      bgTertiary: '#d9f99d',
      bgHover: '#ecfccb',
      textPrimary: '#365314',
      textSecondary: '#3f6212',
      textTertiary: '#4d7c0f',
      borderPrimary: '#bef264',
      borderSecondary: '#a3e635',
      accent: '#84cc16',
      accentHover: '#65a30d',
      accentText: '#ffffff',
      success: '#84cc16',
      error: '#ef4444',
      warning: '#eab308',
      info: '#3b82f6',
      cardBg: '#ffffff',
      cardBorder: '#bef264',
      cardShadow: 'rgba(132, 204, 22, 0.2)',
    },
  },
  
  teal: {
    id: 'teal',
    name: 'Teal Wave',
    description: 'Vibrant teal and cyan',
    colors: {
      bgPrimary: '#f0fdfa',
      bgSecondary: '#ccfbf1',
      bgTertiary: '#99f6e4',
      bgHover: '#ccfbf1',
      textPrimary: '#134e4a',
      textSecondary: '#115e59',
      textTertiary: '#0f766e',
      borderPrimary: '#5eead4',
      borderSecondary: '#2dd4bf',
      accent: '#14b8a6',
      accentHover: '#0d9488',
      accentText: '#ffffff',
      success: '#14b8a6',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#06b6d4',
      cardBg: '#ffffff',
      cardBorder: '#5eead4',
      cardShadow: 'rgba(20, 184, 166, 0.2)',
    },
  },
  
  fuchsia: {
    id: 'fuchsia',
    name: 'Fuchsia Pop',
    description: 'Vibrant magenta fuchsia',
    colors: {
      bgPrimary: '#fdf4ff',
      bgSecondary: '#fae8ff',
      bgTertiary: '#f5d0fe',
      bgHover: '#fae8ff',
      textPrimary: '#701a75',
      textSecondary: '#86198f',
      textTertiary: '#a21caf',
      borderPrimary: '#e879f9',
      borderSecondary: '#d946ef',
      accent: '#c026d3',
      accentHover: '#a21caf',
      accentText: '#ffffff',
      success: '#10b981',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#c026d3',
      cardBg: '#ffffff',
      cardBorder: '#e879f9',
      cardShadow: 'rgba(192, 38, 211, 0.25)',
    },
  },
  
  espresso: {
    id: 'espresso',
    name: 'Espresso',
    description: 'Dark rich coffee',
    colors: {
      bgPrimary: '#1c1410',
      bgSecondary: '#2c1f18',
      bgTertiary: '#3d2b20',
      bgHover: '#4a3528',
      textPrimary: '#f5deb3',
      textSecondary: '#d4b896',
      textTertiary: '#b89968',
      borderPrimary: '#6b5444',
      borderSecondary: '#8b6f47',
      accent: '#d2691e',
      accentHover: '#b8591a',
      accentText: '#ffffff',
      success: '#10b981',
      error: '#ff6b6b',
      warning: '#ffa500',
      info: '#87ceeb',
      cardBg: '#241c16',
      cardBorder: '#6b5444',
      cardShadow: 'rgba(210, 105, 30, 0.2)',
    },
  },
  
  arctic: {
    id: 'arctic',
    name: 'Arctic Ice',
    description: 'Frozen cyan blue',
    colors: {
      bgPrimary: '#ecfeff',
      bgSecondary: '#cffafe',
      bgTertiary: '#a5f3fc',
      bgHover: '#cffafe',
      textPrimary: '#164e63',
      textSecondary: '#155e75',
      textTertiary: '#0e7490',
      borderPrimary: '#67e8f9',
      borderSecondary: '#22d3ee',
      accent: '#06b6d4',
      accentHover: '#0891b2',
      accentText: '#ffffff',
      success: '#10b981',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#06b6d4',
      cardBg: '#ffffff',
      cardBorder: '#67e8f9',
      cardShadow: 'rgba(6, 182, 212, 0.2)',
    },
  },
  
  plum: {
    id: 'plum',
    name: 'Plum',
    description: 'Deep purple plum',
    colors: {
      bgPrimary: '#faf5ff',
      bgSecondary: '#f3e8ff',
      bgTertiary: '#e9d5ff',
      bgHover: '#f3e8ff',
      textPrimary: '#4c1d95',
      textSecondary: '#5b21b6',
      textTertiary: '#6d28d9',
      borderPrimary: '#c084fc',
      borderSecondary: '#a855f7',
      accent: '#8b5cf6',
      accentHover: '#7c3aed',
      accentText: '#ffffff',
      success: '#10b981',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#8b5cf6',
      cardBg: '#ffffff',
      cardBorder: '#c084fc',
      cardShadow: 'rgba(139, 92, 246, 0.2)',
    },
  },
  
  peach: {
    id: 'peach',
    name: 'Peach',
    description: 'Soft warm peach',
    colors: {
      bgPrimary: '#fff5f0',
      bgSecondary: '#ffe5d9',
      bgTertiary: '#ffd4b8',
      bgHover: '#ffe5d9',
      textPrimary: '#7c3a14',
      textSecondary: '#a44a1a',
      textTertiary: '#c85a20',
      borderPrimary: '#ffb999',
      borderSecondary: '#ff9d6b',
      accent: '#ff7f3f',
      accentHover: '#ff6624',
      accentText: '#ffffff',
      success: '#10b981',
      error: '#ef4444',
      warning: '#ff7f3f',
      info: '#3b82f6',
      cardBg: '#ffffff',
      cardBorder: '#ffb999',
      cardShadow: 'rgba(255, 127, 63, 0.2)',
    },
  },
  
  matrix: {
    id: 'matrix',
    name: 'Matrix',
    description: 'Green code rain',
    colors: {
      bgPrimary: '#0d0d0d',
      bgSecondary: '#1a1a1a',
      bgTertiary: '#262626',
      bgHover: '#333333',
      textPrimary: '#00ff41',
      textSecondary: '#00d936',
      textTertiary: '#00b32c',
      borderPrimary: '#008f11',
      borderSecondary: '#00ff41',
      accent: '#00ff41',
      accentHover: '#00d936',
      accentText: '#000000',
      success: '#00ff41',
      error: '#ff0033',
      warning: '#ffff00',
      info: '#00d4ff',
      cardBg: '#121212',
      cardBorder: '#008f11',
      cardShadow: 'rgba(0, 255, 65, 0.3)',
    },
  },
  
  golden: {
    id: 'golden',
    name: 'Golden Hour',
    description: 'Warm golden sunset',
    colors: {
      bgPrimary: '#fffcf5',
      bgSecondary: '#fff8e1',
      bgTertiary: '#ffecb3',
      bgHover: '#fff8e1',
      textPrimary: '#6b4e1f',
      textSecondary: '#8d6e2e',
      textTertiary: '#b8941f',
      borderPrimary: '#ffd54f',
      borderSecondary: '#ffca28',
      accent: '#ffc107',
      accentHover: '#ffb300',
      accentText: '#000000',
      success: '#10b981',
      error: '#ef4444',
      warning: '#ffc107',
      info: '#3b82f6',
      cardBg: '#ffffff',
      cardBorder: '#ffd54f',
      cardShadow: 'rgba(255, 193, 7, 0.25)',
    },
  },
  
  berry: {
    id: 'berry',
    name: 'Berry Blast',
    description: 'Mixed berry colors',
    colors: {
      bgPrimary: '#fdf2f8',
      bgSecondary: '#fce7f3',
      bgTertiary: '#fbcfe8',
      bgHover: '#fce7f3',
      textPrimary: '#701a75',
      textSecondary: '#86198f',
      textTertiary: '#a21caf',
      borderPrimary: '#f0abfc',
      borderSecondary: '#e879f9',
      accent: '#d946ef',
      accentHover: '#c026d3',
      accentText: '#ffffff',
      success: '#10b981',
      error: '#f43f5e',
      warning: '#f59e0b',
      info: '#d946ef',
      cardBg: '#ffffff',
      cardBorder: '#f0abfc',
      cardShadow: 'rgba(217, 70, 239, 0.25)',
    },
  },
  
  // PRIMARY COLOR VARIATIONS - BLUES
  skyBlue: {
    id: 'skyBlue',
    name: 'Sky Blue',
    description: 'Light sky blue',
    colors: {
      bgPrimary: '#e0f2fe',
      bgSecondary: '#bae6fd',
      bgTertiary: '#7dd3fc',
      bgHover: '#bae6fd',
      textPrimary: '#075985',
      textSecondary: '#0c4a6e',
      textTertiary: '#0369a1',
      borderPrimary: '#38bdf8',
      borderSecondary: '#0ea5e9',
      accent: '#0284c7',
      accentHover: '#0369a1',
      accentText: '#ffffff',
      success: '#10b981',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#0284c7',
      cardBg: '#ffffff',
      cardBorder: '#38bdf8',
      cardShadow: 'rgba(2, 132, 199, 0.2)',
    },
  },
  
  navy: {
    id: 'navy',
    name: 'Navy',
    description: 'Deep navy blue',
    colors: {
      bgPrimary: '#172554',
      bgSecondary: '#1e3a8a',
      bgTertiary: '#1e40af',
      bgHover: '#1e3a8a',
      textPrimary: '#dbeafe',
      textSecondary: '#bfdbfe',
      textTertiary: '#93c5fd',
      borderPrimary: '#1e40af',
      borderSecondary: '#2563eb',
      accent: '#3b82f6',
      accentHover: '#2563eb',
      accentText: '#ffffff',
      success: '#10b981',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#60a5fa',
      cardBg: '#1e3a8a',
      cardBorder: '#2563eb',
      cardShadow: 'rgba(59, 130, 246, 0.3)',
    },
  },
  
  steel: {
    id: 'steel',
    name: 'Steel Blue',
    description: 'Cool steel tones',
    colors: {
      bgPrimary: '#f1f5f9',
      bgSecondary: '#e2e8f0',
      bgTertiary: '#cbd5e1',
      bgHover: '#e2e8f0',
      textPrimary: '#0f172a',
      textSecondary: '#334155',
      textTertiary: '#475569',
      borderPrimary: '#94a3b8',
      borderSecondary: '#64748b',
      accent: '#475569',
      accentHover: '#334155',
      accentText: '#ffffff',
      success: '#10b981',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#3b82f6',
      cardBg: '#ffffff',
      cardBorder: '#cbd5e1',
      cardShadow: 'rgba(71, 85, 105, 0.15)',
    },
  },
  
  // PRIMARY COLOR VARIATIONS - REDS
  ruby: {
    id: 'ruby',
    name: 'Ruby',
    description: 'Deep ruby red',
    colors: {
      bgPrimary: '#fef2f2',
      bgSecondary: '#fee2e2',
      bgTertiary: '#fecaca',
      bgHover: '#fee2e2',
      textPrimary: '#7f1d1d',
      textSecondary: '#991b1b',
      textTertiary: '#b91c1c',
      borderPrimary: '#fca5a5',
      borderSecondary: '#f87171',
      accent: '#dc2626',
      accentHover: '#b91c1c',
      accentText: '#ffffff',
      success: '#10b981',
      error: '#dc2626',
      warning: '#f59e0b',
      info: '#3b82f6',
      cardBg: '#ffffff',
      cardBorder: '#fca5a5',
      cardShadow: 'rgba(220, 38, 38, 0.2)',
    },
  },
  
  wine: {
    id: 'wine',
    name: 'Wine',
    description: 'Rich wine red',
    colors: {
      bgPrimary: '#4c0519',
      bgSecondary: '#7f1d1d',
      bgTertiary: '#991b1b',
      bgHover: '#7f1d1d',
      textPrimary: '#fecaca',
      textSecondary: '#fca5a5',
      textTertiary: '#f87171',
      borderPrimary: '#991b1b',
      borderSecondary: '#b91c1c',
      accent: '#dc2626',
      accentHover: '#b91c1c',
      accentText: '#ffffff',
      success: '#10b981',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#f87171',
      cardBg: '#7f1d1d',
      cardBorder: '#991b1b',
      cardShadow: 'rgba(220, 38, 38, 0.3)',
    },
  },
  
  // PRIMARY COLOR VARIATIONS - GREENS
  forestGreen: {
    id: 'forestGreen',
    name: 'Forest Green',
    description: 'Deep forest green',
    colors: {
      bgPrimary: '#f0fdf4',
      bgSecondary: '#dcfce7',
      bgTertiary: '#bbf7d0',
      bgHover: '#dcfce7',
      textPrimary: '#14532d',
      textSecondary: '#166534',
      textTertiary: '#15803d',
      borderPrimary: '#86efac',
      borderSecondary: '#4ade80',
      accent: '#22c55e',
      accentHover: '#16a34a',
      accentText: '#ffffff',
      success: '#22c55e',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#3b82f6',
      cardBg: '#ffffff',
      cardBorder: '#86efac',
      cardShadow: 'rgba(34, 197, 94, 0.2)',
    },
  },
  
  jade: {
    id: 'jade',
    name: 'Jade',
    description: 'Elegant jade green',
    colors: {
      bgPrimary: '#ecfdf5',
      bgSecondary: '#d1fae5',
      bgTertiary: '#a7f3d0',
      bgHover: '#d1fae5',
      textPrimary: '#064e3b',
      textSecondary: '#065f46',
      textTertiary: '#047857',
      borderPrimary: '#6ee7b7',
      borderSecondary: '#34d399',
      accent: '#10b981',
      accentHover: '#059669',
      accentText: '#ffffff',
      success: '#10b981',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#06b6d4',
      cardBg: '#ffffff',
      cardBorder: '#6ee7b7',
      cardShadow: 'rgba(16, 185, 129, 0.2)',
    },
  },
  
  olive: {
    id: 'olive',
    name: 'Olive',
    description: 'Earthy olive green',
    colors: {
      bgPrimary: '#f7fee7',
      bgSecondary: '#ecfccb',
      bgTertiary: '#d9f99d',
      bgHover: '#ecfccb',
      textPrimary: '#365314',
      textSecondary: '#3f6212',
      textTertiary: '#4d7c0f',
      borderPrimary: '#bef264',
      borderSecondary: '#a3e635',
      accent: '#84cc16',
      accentHover: '#65a30d',
      accentText: '#ffffff',
      success: '#84cc16',
      error: '#ef4444',
      warning: '#eab308',
      info: '#3b82f6',
      cardBg: '#ffffff',
      cardBorder: '#bef264',
      cardShadow: 'rgba(132, 204, 22, 0.2)',
    },
  },
  
  // PRIMARY COLOR VARIATIONS - PURPLES
  violet: {
    id: 'violet',
    name: 'Violet',
    description: 'Deep violet purple',
    colors: {
      bgPrimary: '#faf5ff',
      bgSecondary: '#f3e8ff',
      bgTertiary: '#e9d5ff',
      bgHover: '#f3e8ff',
      textPrimary: '#581c87',
      textSecondary: '#6b21a8',
      textTertiary: '#7c3aed',
      borderPrimary: '#d8b4fe',
      borderSecondary: '#c084fc',
      accent: '#a855f7',
      accentHover: '#9333ea',
      accentText: '#ffffff',
      success: '#10b981',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#a855f7',
      cardBg: '#ffffff',
      cardBorder: '#d8b4fe',
      cardShadow: 'rgba(168, 85, 247, 0.2)',
    },
  },
  
  amethyst: {
    id: 'amethyst',
    name: 'Amethyst',
    description: 'Rich amethyst purple',
    colors: {
      bgPrimary: '#3b0764',
      bgSecondary: '#581c87',
      bgTertiary: '#6b21a8',
      bgHover: '#581c87',
      textPrimary: '#e9d5ff',
      textSecondary: '#d8b4fe',
      textTertiary: '#c084fc',
      borderPrimary: '#7c3aed',
      borderSecondary: '#9333ea',
      accent: '#a855f7',
      accentHover: '#9333ea',
      accentText: '#ffffff',
      success: '#10b981',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#c084fc',
      cardBg: '#581c87',
      cardBorder: '#7c3aed',
      cardShadow: 'rgba(168, 85, 247, 0.3)',
    },
  },
  
  // PRIMARY COLOR VARIATIONS - ORANGES
  tangerineOrange: {
    id: 'tangerineOrange',
    name: 'Tangerine Orange',
    description: 'Bright tangerine',
    colors: {
      bgPrimary: '#fff7ed',
      bgSecondary: '#ffedd5',
      bgTertiary: '#fed7aa',
      bgHover: '#ffedd5',
      textPrimary: '#7c2d12',
      textSecondary: '#9a3412',
      textTertiary: '#c2410c',
      borderPrimary: '#fdba74',
      borderSecondary: '#fb923c',
      accent: '#f97316',
      accentHover: '#ea580c',
      accentText: '#ffffff',
      success: '#10b981',
      error: '#dc2626',
      warning: '#f97316',
      info: '#3b82f6',
      cardBg: '#ffffff',
      cardBorder: '#fdba74',
      cardShadow: 'rgba(249, 115, 22, 0.2)',
    },
  },
  
  rust: {
    id: 'rust',
    name: 'Rust',
    description: 'Deep rust orange',
    colors: {
      bgPrimary: '#7c2d12',
      bgSecondary: '#9a3412',
      bgTertiary: '#c2410c',
      bgHover: '#9a3412',
      textPrimary: '#fed7aa',
      textSecondary: '#fdba74',
      textTertiary: '#fb923c',
      borderPrimary: '#c2410c',
      borderSecondary: '#ea580c',
      accent: '#f97316',
      accentHover: '#ea580c',
      accentText: '#ffffff',
      success: '#10b981',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#fb923c',
      cardBg: '#9a3412',
      cardBorder: '#c2410c',
      cardShadow: 'rgba(249, 115, 22, 0.3)',
    },
  },
  
  // PRIMARY COLOR VARIATIONS - PINKS
  blush: {
    id: 'blush',
    name: 'Blush',
    description: 'Soft blush pink',
    colors: {
      bgPrimary: '#fdf2f8',
      bgSecondary: '#fce7f3',
      bgTertiary: '#fbcfe8',
      bgHover: '#fce7f3',
      textPrimary: '#831843',
      textSecondary: '#9d174d',
      textTertiary: '#be185d',
      borderPrimary: '#f9a8d4',
      borderSecondary: '#f472b6',
      accent: '#ec4899',
      accentHover: '#db2777',
      accentText: '#ffffff',
      success: '#10b981',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#ec4899',
      cardBg: '#ffffff',
      cardBorder: '#f9a8d4',
      cardShadow: 'rgba(236, 72, 153, 0.2)',
    },
  },
  
  hotPink: {
    id: 'hotPink',
    name: 'Hot Pink',
    description: 'Vibrant hot pink',
    colors: {
      bgPrimary: '#fdf4ff',
      bgSecondary: '#fae8ff',
      bgTertiary: '#f5d0fe',
      bgHover: '#fae8ff',
      textPrimary: '#701a75',
      textSecondary: '#86198f',
      textTertiary: '#a21caf',
      borderPrimary: '#e879f9',
      borderSecondary: '#d946ef',
      accent: '#c026d3',
      accentHover: '#a21caf',
      accentText: '#ffffff',
      success: '#10b981',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#c026d3',
      cardBg: '#ffffff',
      cardBorder: '#e879f9',
      cardShadow: 'rgba(192, 38, 211, 0.2)',
    },
  },
  
  // PRIMARY COLOR VARIATIONS - TEALS/CYANS
  turquoise: {
    id: 'turquoise',
    name: 'Turquoise',
    description: 'Bright turquoise',
    colors: {
      bgPrimary: '#ecfeff',
      bgSecondary: '#cffafe',
      bgTertiary: '#a5f3fc',
      bgHover: '#cffafe',
      textPrimary: '#164e63',
      textSecondary: '#155e75',
      textTertiary: '#0e7490',
      borderPrimary: '#67e8f9',
      borderSecondary: '#22d3ee',
      accent: '#06b6d4',
      accentHover: '#0891b2',
      accentText: '#ffffff',
      success: '#10b981',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#06b6d4',
      cardBg: '#ffffff',
      cardBorder: '#67e8f9',
      cardShadow: 'rgba(6, 182, 212, 0.2)',
    },
  },
  
  deepSea: {
    id: 'deepSea',
    name: 'Deep Sea',
    description: 'Dark ocean teal',
    colors: {
      bgPrimary: '#134e4a',
      bgSecondary: '#115e59',
      bgTertiary: '#0f766e',
      bgHover: '#115e59',
      textPrimary: '#99f6e4',
      textSecondary: '#5eead4',
      textTertiary: '#2dd4bf',
      borderPrimary: '#0f766e',
      borderSecondary: '#0d9488',
      accent: '#14b8a6',
      accentHover: '#0d9488',
      accentText: '#ffffff',
      success: '#14b8a6',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#2dd4bf',
      cardBg: '#115e59',
      cardBorder: '#0f766e',
      cardShadow: 'rgba(20, 184, 166, 0.3)',
    },
  },
  
  // NEUTRALS AND EARTH TONES
  graphite: {
    id: 'graphite',
    name: 'Graphite',
    description: 'Dark graphite gray',
    colors: {
      bgPrimary: '#18181b',
      bgSecondary: '#27272a',
      bgTertiary: '#3f3f46',
      bgHover: '#27272a',
      textPrimary: '#fafafa',
      textSecondary: '#e4e4e7',
      textTertiary: '#d4d4d8',
      borderPrimary: '#52525b',
      borderSecondary: '#71717a',
      accent: '#a1a1aa',
      accentHover: '#71717a',
      accentText: '#18181b',
      success: '#10b981',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#3b82f6',
      cardBg: '#27272a',
      cardBorder: '#3f3f46',
      cardShadow: 'rgba(161, 161, 170, 0.2)',
    },
  },
  
  sand: {
    id: 'sand',
    name: 'Sand',
    description: 'Warm sandy beige',
    colors: {
      bgPrimary: '#fefce8',
      bgSecondary: '#fef9c3',
      bgTertiary: '#fef08a',
      bgHover: '#fef9c3',
      textPrimary: '#713f12',
      textSecondary: '#854d0e',
      textTertiary: '#a16207',
      borderPrimary: '#fde047',
      borderSecondary: '#facc15',
      accent: '#eab308',
      accentHover: '#ca8a04',
      accentText: '#ffffff',
      success: '#10b981',
      error: '#ef4444',
      warning: '#eab308',
      info: '#3b82f6',
      cardBg: '#ffffff',
      cardBorder: '#fde047',
      cardShadow: 'rgba(234, 179, 8, 0.2)',
    },
  },
  
  chocolate: {
    id: 'chocolate',
    name: 'Chocolate',
    description: 'Rich chocolate brown',
    colors: {
      bgPrimary: '#44403c',
      bgSecondary: '#57534e',
      bgTertiary: '#78716c',
      bgHover: '#57534e',
      textPrimary: '#fafaf9',
      textSecondary: '#e7e5e4',
      textTertiary: '#d6d3d1',
      borderPrimary: '#78716c',
      borderSecondary: '#a8a29e',
      accent: '#d97706',
      accentHover: '#b45309',
      accentText: '#ffffff',
      success: '#10b981',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#3b82f6',
      cardBg: '#57534e',
      cardBorder: '#78716c',
      cardShadow: 'rgba(217, 119, 6, 0.2)',
    },
  },
  
  // UNIQUE COMBINATIONS
  sunrise: {
    id: 'sunrise',
    name: 'Sunrise',
    description: 'Warm sunrise gradient',
    colors: {
      bgPrimary: '#fff1f2',
      bgSecondary: '#ffe4e6',
      bgTertiary: '#fecdd3',
      bgHover: '#ffe4e6',
      textPrimary: '#881337',
      textSecondary: '#9f1239',
      textTertiary: '#be123c',
      borderPrimary: '#fda4af',
      borderSecondary: '#fb7185',
      accent: '#f43f5e',
      accentHover: '#e11d48',
      accentText: '#ffffff',
      success: '#10b981',
      error: '#f43f5e',
      warning: '#fb923c',
      info: '#3b82f6',
      cardBg: '#ffffff',
      cardBorder: '#fda4af',
      cardShadow: 'rgba(244, 63, 94, 0.2)',
    },
  },
  
  twilight: {
    id: 'twilight',
    name: 'Twilight',
    description: 'Purple twilight sky',
    colors: {
      bgPrimary: '#2e1065',
      bgSecondary: '#4c1d95',
      bgTertiary: '#5b21b6',
      bgHover: '#4c1d95',
      textPrimary: '#e9d5ff',
      textSecondary: '#d8b4fe',
      textTertiary: '#c084fc',
      borderPrimary: '#6d28d9',
      borderSecondary: '#7c3aed',
      accent: '#8b5cf6',
      accentHover: '#7c3aed',
      accentText: '#ffffff',
      success: '#10b981',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#a855f7',
      cardBg: '#4c1d95',
      cardBorder: '#6d28d9',
      cardShadow: 'rgba(139, 92, 246, 0.3)',
    },
  },
  
  aurora: {
    id: 'aurora',
    name: 'Aurora',
    description: 'Northern lights inspired',
    colors: {
      bgPrimary: '#022c22',
      bgSecondary: '#064e3b',
      bgTertiary: '#065f46',
      bgHover: '#064e3b',
      textPrimary: '#a7f3d0',
      textSecondary: '#6ee7b7',
      textTertiary: '#34d399',
      borderPrimary: '#047857',
      borderSecondary: '#059669',
      accent: '#10b981',
      accentHover: '#059669',
      accentText: '#ffffff',
      success: '#10b981',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#06b6d4',
      cardBg: '#064e3b',
      cardBorder: '#047857',
      cardShadow: 'rgba(16, 185, 129, 0.3)',
    },
  },
};

interface ThemeContextType {
  currentTheme: string;
  theme: Theme;
  setTheme: (themeId: string) => void;
  availableThemes: Theme[];
  customThemes: Theme[];
  createCustomTheme: (theme: Theme) => void;
  updateCustomTheme: (theme: Theme) => void;
  deleteCustomTheme: (themeId: string) => void;
  isBuiltInTheme: (themeId: string) => boolean;
  isThemeModified: (themeId: string) => boolean;
  restoreThemeToDefault: (themeId: string) => void;
  getDefaultTheme: (themeId: string) => Theme | null;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

// Load custom themes from localStorage
const loadCustomThemes = (): Theme[] => {
  try {
    const stored = localStorage.getItem('custom-themes');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load custom themes:', error);
    return [];
  }
};

// Save custom themes to localStorage
const saveCustomThemes = (themes: Theme[]) => {
  try {
    localStorage.setItem('custom-themes', JSON.stringify(themes));
  } catch (error) {
    console.error('Failed to save custom themes:', error);
  }
};

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<string>(() => {
    // Load theme from localStorage or default to 'light'
    return localStorage.getItem('app-theme') || 'light';
  });

  const [customThemes, setCustomThemes] = useState<Theme[]>(() => loadCustomThemes());

  // Combine built-in and custom themes (memoized to prevent unnecessary recalculations)
  const allThemes = useMemo(() => {
    const combined = { ...themes };
    customThemes.forEach(customTheme => {
      combined[customTheme.id] = customTheme;
    });
    return combined;
  }, [customThemes]);

  const theme = allThemes[currentTheme] || themes.light;
  const availableThemes = useMemo(() => Object.values(allThemes), [allThemes]);

  // Apply theme CSS variables to document root
  useEffect(() => {
    const root = document.documentElement;
    
    Object.entries(theme.colors).forEach(([key, value]) => {
      // Convert camelCase to kebab-case for CSS variables
      const cssVarName = `--color-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
      root.style.setProperty(cssVarName, value);
    });
    
    // Store theme preference
    localStorage.setItem('app-theme', currentTheme);
    
    // Add theme class to root for potential CSS-based targeting
    root.className = `theme-${currentTheme}`;
  }, [currentTheme, theme]);

  const setTheme = useCallback((themeId: string) => {
    if (allThemes[themeId]) {
      setCurrentTheme(themeId);
    }
  }, [allThemes]);

  const createCustomTheme = useCallback((theme: Theme) => {
    const newCustomThemes = [...customThemes, theme];
    setCustomThemes(newCustomThemes);
    saveCustomThemes(newCustomThemes);
  }, [customThemes]);

  const updateCustomTheme = useCallback((updatedTheme: Theme) => {
    const newCustomThemes = customThemes.map(t => 
      t.id === updatedTheme.id ? updatedTheme : t
    );
    setCustomThemes(newCustomThemes);
    saveCustomThemes(newCustomThemes);
  }, [customThemes]);

  const deleteCustomTheme = useCallback((themeId: string) => {
    const newCustomThemes = customThemes.filter(t => t.id !== themeId);
    setCustomThemes(newCustomThemes);
    saveCustomThemes(newCustomThemes);
    
    // If deleting the current theme, switch to light theme
    if (currentTheme === themeId) {
      setCurrentTheme('light');
    }
  }, [customThemes, currentTheme]);

  // Check if a theme is built-in (not custom)
  const isBuiltInTheme = useCallback((themeId: string): boolean => {
    return themeId in themes;
  }, []);

  // Check if a built-in theme has been modified (has a custom version)
  const isThemeModified = useCallback((themeId: string): boolean => {
    if (!(themeId in themes)) return false;
    return customThemes.some(t => t.id === themeId);
  }, [customThemes]);

  // Get the default (built-in) version of a theme
  const getDefaultTheme = useCallback((themeId: string): Theme | null => {
    return themes[themeId] || null;
  }, []);

  // Restore a modified built-in theme to its default values
  const restoreThemeToDefault = useCallback((themeId: string) => {
    if (!(themeId in themes)) {
      console.warn(`Cannot restore ${themeId}: not a built-in theme`);
      return;
    }

    // Remove the custom version (if it exists)
    const newCustomThemes = customThemes.filter(t => t.id !== themeId);
    setCustomThemes(newCustomThemes);
    saveCustomThemes(newCustomThemes);

    // If this was the current theme, force a re-render by temporarily switching themes
    if (currentTheme === themeId) {
      // Temporarily switch to light theme, then back to force re-render
      setCurrentTheme('light');
      setTimeout(() => {
        setCurrentTheme(themeId);
      }, 0);
    }
  }, [customThemes, currentTheme]);

  return (
    <ThemeContext.Provider value={{ 
      currentTheme, 
      theme, 
      setTheme, 
      availableThemes,
      customThemes,
      createCustomTheme,
      updateCustomTheme,
      deleteCustomTheme,
      isBuiltInTheme,
      isThemeModified,
      restoreThemeToDefault,
      getDefaultTheme
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

