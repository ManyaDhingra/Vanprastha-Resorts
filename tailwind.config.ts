import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#234E70',
        accent: '#F97316',
        background: '#FAFAF8',
        secondary: '#EEF2F3',
        text: '#2D3748',
        success: '#2F855A'
      },
      boxShadow: {
        soft: '0 24px 80px rgba(35, 78, 112, 0.12)',
        card: '0 20px 50px rgba(45, 55, 72, 0.08)'
      },
      fontFamily: {
        heading: ['var(--font-heading)', 'serif'],
        body: ['var(--font-body)', 'sans-serif'],
        accent: ['var(--font-accent)', 'sans-serif']
      },
      backgroundImage: {
        'hero-glow': 'radial-gradient(circle at top, rgba(249, 115, 22, 0.14), transparent 36%)'
      }
    }
  },
  plugins: []
}

export default config
