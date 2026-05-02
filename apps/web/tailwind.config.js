/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        stellar: {
          purple: {
            50: '#f3f0ff',
            100: '#e9e3ff',
            200: '#d5caff',
            300: '#b8a4ff',
            400: '#9470ff',
            500: '#7c3aed',
            600: '#6d28d9',
            700: '#5b21b6',
            800: '#4c1d95',
            900: '#3b0764',
          },
          gold: {
            50: '#fffbeb',
            100: '#fef3c7',
            200: '#fde68a',
            300: '#fcd34d',
            400: '#fbbf24',
            500: '#f59e0b',
            600: '#d97706',
            700: '#b45309',
            800: '#92400e',
            900: '#78350f',
          },
        },
        space: {
          900: '#0a0a1a',
          800: '#0f0f2e',
          700: '#1a1a3e',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'stellar-gradient': 'linear-gradient(135deg, #7c3aed 0%, #f59e0b 100%)',
        'space-gradient': 'radial-gradient(ellipse at center, #1a1a3e 0%, #0a0a1a 100%)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        float: 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
      },
    },
  },
  plugins: [],
};
