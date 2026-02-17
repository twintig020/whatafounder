import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Dimension colors
        'dim-clarity':    '#6366f1', // indigo
        'dim-resilience': '#f59e0b', // amber
        'dim-velocity':   '#10b981', // emerald
        'dim-empathy':    '#ec4899', // pink
        'dim-vision':     '#8b5cf6', // violet
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
