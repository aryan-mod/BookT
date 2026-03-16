/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // NexusRead palette
        nx: {
          bg:       '#080810',
          surface:  '#0f0f1a',
          surface2: '#15152a',
          violet:   '#7c3aed',
          'violet-soft': '#9d6fff',
          'violet-dim':  '#4c1d95',
          cyan:     '#06b6d4',
          amber:    '#f59e0b',
          emerald:  '#10b981',
          red:      '#ef4444',
          border:   'rgba(124,58,237,0.15)',
        },
        // Keep existing colors
        primary: {
          50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe',
          300: '#93c5fd', 400: '#60a5fa', 500: '#3b82f6',
          600: '#2563eb', 700: '#1d4ed8', 800: '#1e40af', 900: '#1e3a8a',
        },
      },
      fontFamily: {
        sans:    ['Plus Jakarta Sans', 'Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        mono:    ['Fira Code', 'JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      backdropBlur: {
        xs: '2px',
        '4xl': '72px',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        'glow-violet': '0 0 30px rgba(124,58,237,0.35)',
        'glow-cyan':   '0 0 30px rgba(6,182,212,0.35)',
        'glow-amber':  '0 0 30px rgba(245,158,11,0.35)',
        'glow-sm':     '0 0 12px rgba(124,58,237,0.25)',
        'glass':       '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
        'card-float':  '0 16px 40px rgba(0,0,0,0.6), 0 0 20px rgba(124,58,237,0.1)',
      },
      animation: {
        'shimmer':       'shimmer 2s linear infinite',
        'float':         'float 6s ease-in-out infinite',
        'pulse-glow':    'pulse-glow 2s ease-in-out infinite',
        'slide-in-right':'slide-in-right 0.4s cubic-bezier(0.4,0,0.2,1)',
        'slide-in-up':   'slide-in-up 0.4s cubic-bezier(0.4,0,0.2,1)',
        'fade-in':       'fade-in 0.3s ease-out',
        'bounce-in':     'bounce-in 0.5s cubic-bezier(0.34,1.56,0.64,1)',
        'fire':          'fire 1s ease-in-out infinite alternate',
        'gradient':      'gradient-shift 4s ease infinite',
        'pulse-slow':    'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'count-up':      'count-up 0.6s ease-out both',
        'spin-slow':     'spin 8s linear infinite',
      },
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '33%': { transform: 'translateY(-12px) rotate(1deg)' },
          '66%': { transform: 'translateY(-6px) rotate(-1deg)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 10px rgba(124,58,237,0.3)' },
          '50%':       { boxShadow: '0 0 30px rgba(124,58,237,0.7), 0 0 60px rgba(124,58,237,0.3)' },
        },
        'slide-in-right': {
          from: { opacity: '0', transform: 'translateX(100%)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        'slide-in-up': {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        'bounce-in': {
          '0%':   { opacity: '0', transform: 'scale(0.7)' },
          '60%':  { transform: 'scale(1.05)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        fire: {
          '0%, 100%': { transform: 'scaleY(1) scaleX(1)' },
          '25%': { transform: 'scaleY(1.05) scaleX(0.97)' },
          '50%': { transform: 'scaleY(0.98) scaleX(1.02)' },
          '75%': { transform: 'scaleY(1.03) scaleX(0.99)' },
        },
        'gradient-shift': {
          '0%':   { backgroundPosition: '0% 50%' },
          '50%':  { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        'count-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}