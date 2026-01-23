/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Premium Dark Theme Palette
        background: '#030014', // Deep space blue/black
        surface: '#0F0B29',    // Slightly lighter for cards
        primary: {
          DEFAULT: '#7000FF',  // Electric Violet
          glow: '#B57BFF',     // Lighter violet for glows
          dark: '#4B00AD',
        },
        secondary: {
          DEFAULT: '#00F0FF',  // Cyan Neon
          glow: '#7BFFFF',
          dark: '#00A3AD',
        },
        accent: {
          DEFAULT: '#FF0055',  // Neon Pink
          glow: '#FF7B9C',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#B4B0D8',
          muted: '#6E6A8E',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'slide-up': 'slideUp 0.5s ease-out forwards',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px #7000FF, 0 0 10px #7000FF' },
          '100%': { boxShadow: '0 0 20px #00F0FF, 0 0 30px #00F0FF' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      },
      backdropBlur: {
        xs: '2px',
        xl: '20px',
      },
    },
  },
  plugins: [],
}