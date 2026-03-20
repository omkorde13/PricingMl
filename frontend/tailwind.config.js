/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        heading: ['"Syne"',    'sans-serif'],
        mono:    ['"DM Mono"', 'monospace'],
      },
      colors: {
        bg: {
          DEFAULT: '#0a0c10',
          2:       '#111520',
          3:       '#1a1f2e',
        },
        border: {
          subtle:  'rgba(255,255,255,0.07)',
          DEFAULT: 'rgba(255,255,255,0.12)',
        },
        accent: {
          blue:   '#4f8ef7',
          purple: '#7c3aed',
          green:  '#10b981',
          amber:  '#f59e0b',
          red:    '#ef4444',
        },
        model: {
          ridge: '#6b7280',
          rf:    '#3b82f6',
          xgb:   '#8b5cf6',
          lgbm:  '#10b981',
        },
      },
      animation: {
        'pulse-slow': 'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite',
        'fade-in':    'fadeIn 0.4s ease forwards',
        'slide-up':   'slideUp 0.4s ease forwards',
      },
      keyframes: {
        fadeIn:  { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(12px)' },
          to:   { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
}