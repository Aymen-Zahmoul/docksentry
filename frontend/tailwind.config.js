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
        sentry: {
          darkest: '#07090D',
          bg: '#0A0D12',
          surface: '#111620',
          'surface-hover': '#161F2C',
          'surface-elevated': '#1B2535',
          border: '#1E293B',
          'border-focus': '#334155',
          muted: '#64748B',
          text: '#F1F5F9',
          'text-dim': '#94A3B8',
          accent: '#10B981',
          'accent-glow': 'rgba(16, 185, 129, 0.15)',
          'accent-light': '#34D399',
          critical: '#EF4444',
          'critical-bg': 'rgba(239, 68, 68, 0.12)',
          high: '#F97316',
          'high-bg': 'rgba(249, 115, 22, 0.12)',
          medium: '#F59E0B',
          'medium-bg': 'rgba(245, 158, 11, 0.12)',
          low: '#3B82F6',
          'low-bg': 'rgba(59, 130, 246, 0.12)',
          info: '#64748B',
          'info-bg': 'rgba(100, 116, 139, 0.12)',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.2), 0 1px 2px -1px rgba(0, 0, 0, 0.2)',
        'elevated': '0 4px 20px -2px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'radar': 'radar 2s linear infinite',
      },
      keyframes: {
        radar: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        }
      }
    },
  },
  plugins: [],
}
