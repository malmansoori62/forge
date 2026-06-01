import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        forge: {
          lime: '#d4ff3f',
          limeDark: '#a8d62e',
          ink: '#0d0f0c',
          coal: '#17191a',
          stone: '#21241f',
          mist: '#2c2f2a',
          ash: '#9aa19a',
          bone: '#e9ebe5'
        }
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace']
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(212,255,63,0.15), 0 8px 32px -8px rgba(212,255,63,0.25)'
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'confetti': 'confetti 1s ease-out forwards'
      },
      keyframes: {
        confetti: {
          '0%': { transform: 'translateY(0) scale(0)', opacity: '1' },
          '100%': { transform: 'translateY(-200px) scale(1)', opacity: '0' }
        }
      }
    }
  },
  plugins: []
};
export default config;
