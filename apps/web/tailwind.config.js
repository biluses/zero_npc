/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Paleta XD (design system real)
        magenta: '#FF00F2',
        yellow: '#EEFF00',
        cyan: '#00FBFB',
        accept: '#3BCB36',
        reject: '#E63946',
        night: '#101010',
        surface: '#F2F1F5',
        'border-soft': '#EAE8F0',
        'text-muted': '#78757E',

        // Compat con MVP previo
        brand: {
          50: '#f5f2ff',
          100: '#ece5ff',
          200: '#d7c8ff',
          300: '#b79aff',
          400: '#9567ff',
          500: '#7840ff',
          600: '#6b27f7',
          700: '#5b17de',
          800: '#4b14b6',
          900: '#3f1595',
        },
        ink: {
          900: '#0b0b10',
          800: '#16161f',
          700: '#22222d',
          600: '#2e2e3b',
          500: '#40404f',
        },
      },
      fontFamily: {
        sans: ['var(--font-montserrat)', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['var(--font-montserrat)', 'ui-sans-serif', 'system-ui'],
        mono: ['var(--font-inter)', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      borderRadius: {
        xl2: '1.25rem',
      },
      boxShadow: {
        brand: '0 8px 24px -8px rgba(120, 64, 255, 0.45)',
        nav: '0 -4px 12px rgba(0, 0, 0, 0.08)',
        card: '0 2px 8px rgba(0, 0, 0, 0.04)',
      },
      screens: {
        xs: '400px',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        ringSpin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.6s ease-out both',
        'ring-spin': 'ringSpin 6s linear infinite',
      },
    },
  },
  plugins: [],
};
