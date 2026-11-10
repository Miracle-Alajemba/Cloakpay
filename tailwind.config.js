/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        zcash: {
          yellow: '#f4b728',
          amber: '#d97706',
          emerald: '#10b981',
          glow: '#34d399',
          shield: '#059669',
          dark: '#064e3b',
        },
        cloak: {
          950: '#06080d',
          900: '#0a0d14',
          850: '#0f1420',
          800: '#151b2b',
          700: '#1f293d',
          600: '#2e3a53',
        }
      },
      fontFamily: {
        display: ['Outfit', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      letterSpacing: {
        tightest: '-0.025em',
      },
      boxShadow: {
        'shield-glow': '0 0 35px -5px rgba(16, 185, 129, 0.25)',
        'shield-glow-strong': '0 0 50px 0px rgba(16, 185, 129, 0.4)',
        'amber-glow': '0 0 35px -5px rgba(244, 183, 40, 0.25)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float-slow': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}

