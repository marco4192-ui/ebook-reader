import { ChevronRight, Moon, BookOpen, Eye, Layers } from 'lucide-react';

export const highlightColors = {
  yellow: 'bg-yellow-200 dark:bg-yellow-800/50',
  green: 'bg-green-200 dark:bg-green-800/50',
  blue: 'bg-blue-200 dark:bg-blue-800/50',
  pink: 'bg-pink-200 dark:bg-pink-800/50',
  purple: 'bg-purple-200 dark:bg-purple-800/50',
};

export const dyslexiaFontStyle = `
  @font-face {
    font-family: 'OpenDyslexic';
    src: url('https://fonts.cdnfonts.com/s/13604/OpenDyslexic-Regular.woff') format('woff');
    font-weight: normal;
    font-style: normal;
  }
`;

export const colorBlindFilters = {
  none: '',
  protanopia: 'url(#protanopia-filter)',
  deuteranopia: 'url(#deuteranopia-filter)',
  tritanopia: 'url(#tritanopia-filter)',
};

export const colorBlindSVGFilters = `
  <svg style="position: absolute; width: 0; height: 0;">
    <defs>
      <filter id="protanopia-filter">
        <feColorMatrix type="matrix" values="0.567,0.433,0,0,0 0.558,0.442,0,0,0 0,0.242,0.758,0,0 0,0,0,1,0"/>
      </filter>
      <filter id="deuteranopia-filter">
        <feColorMatrix type="matrix" values="0.625,0.375,0,0,0 0.7,0.3,0,0,0 0,0.3,0.7,0,0 0,0,0,1,0"/>
      </filter>
      <filter id="tritanopia-filter">
        <feColorMatrix type="matrix" values="0.95,0.05,0,0,0 0,0.433,0.567,0,0 0,0.475,0.525,0,0 0,0,0,1,0"/>
      </filter>
    </defs>
  </svg>
`;

export const pageAnimations = [
  { id: 'none', name: 'Keine', icon: Eye, description: 'Keine Animation' },
  { id: 'flip', name: 'Blättern', icon: BookOpen, description: 'Klassisches Umblättern' },
  { id: 'slide', name: 'Gleiten', icon: ChevronRight, description: 'Horizontales Gleiten' },
  { id: 'curl', name: 'Rollen', icon: Layers, description: 'Seite rollen' },
  { id: 'fade', name: 'Überblenden', icon: Moon, description: 'Sanftes Überblenden' },
];
