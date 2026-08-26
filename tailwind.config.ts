import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#1E3A2D',
        accent: '#A87A3B',
        background: '#F7F4EE',
        secondary: '#F5F0E8',
        surface: '#FDFBF7',
        text: '#2A2A28',
        'text-muted': '#5C5A56',
        success: '#4A6B4A',
        border: 'rgba(42, 42, 40, 0.14)',
      },
      boxShadow: {
        soft: '0 24px 80px rgba(30, 58, 45, 0.12)',
        card: '0 20px 50px rgba(42, 42, 40, 0.08)',
      },
      fontFamily: {
        heading: ['var(--font-heading)', 'serif'],
        body: ['var(--font-body)', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
