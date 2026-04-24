// tailwind.config.ts

import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cream: '#fbf7f3',
        ink: '#1A1A1A',
        accent: '#C75B2B',
        muted: '#999999',
        'muted-light': '#CCCCCC',
        border: '#E0DDD8',
      },
      fontFamily: {
        onest: ['Onest', 'sans-serif'],
      },
      fontSize: {
        'page-title': ['3.5rem', { lineHeight: '1.1', fontWeight: '300' }],
        'section-label': ['1.5rem', { lineHeight: '1.3', fontWeight: '400' }],
        'card-title': ['1.25rem', { lineHeight: '1.4', fontWeight: '400' }],
        'tag': ['0.6875rem', { lineHeight: '1', fontWeight: '500', letterSpacing: '0.15em' }],
        'nav': ['0.6875rem', { lineHeight: '1', fontWeight: '500', letterSpacing: '0.2em' }],
        'body': ['0.9375rem', { lineHeight: '1.7', fontWeight: '400' }],
        'body-sm': ['0.8125rem', { lineHeight: '1.6', fontWeight: '400' }],
      },
      spacing: {
        'sidebar': '200px',
        'content-px': '3rem',
        'content-px-end': '5rem',
      },
      letterSpacing: {
        'wide-nav': '0.2em',
        'wide-tag': '0.15em',
      },
      transitionDuration: {
        '400': '400ms',
        '600': '600ms',
      },
    },
  },
  plugins: [],
}

export default config
