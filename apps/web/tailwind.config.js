/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
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
        sans: ['ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        xl2: '1.25rem',
      },
      boxShadow: {
        brand: '0 8px 24px -8px rgba(120, 64, 255, 0.45)',
      },
    },
  },
  plugins: [],
};
