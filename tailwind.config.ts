import type { Config } from 'tailwindcss'

export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#F44336',
        'primary-light': '#FFF6F4',
        'neutral-light': '#FAFBFD',
        black: '#000',
        white: '#FFF',
        background: 'var(--background)',
        foreground: 'var(--foreground)',
      },
      fontFamily: {
        raleway: ['var(--font-raleway)', 'sans-serif'],
        rubik: ['var(--font-rubik)', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config