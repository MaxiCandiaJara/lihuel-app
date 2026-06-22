/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#e8eef5',
          100: '#c5d3e6',
          200: '#9fb5d3',
          300: '#7897c0',
          400: '#5a80b1',
          500: '#3c69a3',
          600: '#2d5a94',
          700: '#1E3A5F',
          800: '#162d4a',
          900: '#0e1f35',
          DEFAULT: '#1E3A5F',
        },
        accent: {
          50:  '#fff4ed',
          100: '#ffe3d0',
          200: '#ffc29e',
          300: '#ff9b6b',
          400: '#f97316',
          500: '#ea6500',
          600: '#cc5500',
          700: '#a34200',
          DEFAULT: '#F97316',
        },
        success: '#22C55E',
        warning: '#F59E0B',
        danger:  '#EF4444',
        surface: '#0F172A',
        card:    '#1E293B',
        border:  '#334155',
        muted:   '#94A3B8',
        textPrimary: '#F8FAFC',
        textSecondary: '#CBD5E1',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      minHeight: {
        touch: '48px',
      },
      animation: {
        'fade-in':    'fadeIn 0.2s ease-in-out',
        'slide-up':   'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'pulse-dot':  'pulseDot 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)',    opacity: '1' },
        },
        slideDown: {
          '0%':   { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',     opacity: '1' },
        },
        pulseDot: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%':      { opacity: '0.5', transform: 'scale(1.2)' },
        },
      },
    },
  },
  plugins: [],
}
