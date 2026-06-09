import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'bg-base':      'var(--bg-base)',
        'bg-surface':   'var(--bg-surface)',
        'bg-elevated':  'var(--bg-elevated)',
        'bg-hover':     'var(--bg-hover)',
        'border':       'var(--border)',
        'border-subtle':'var(--border-subtle)',
        'border-focus': 'var(--border-focus)',
        'accent':       'var(--accent)',
        'accent-hover': 'var(--accent-hover)',
        'green':        'var(--green)',
        'yellow':       'var(--yellow)',
        'red':          'var(--red)',
        'blue':         'var(--blue)',
        'text-primary':   'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted':     'var(--text-muted)',
        'text-disabled':  'var(--text-disabled)',
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
        mono: ['var(--font-mono)'],
      },
      borderRadius: {
        sm:   'var(--radius-sm)',
        DEFAULT: 'var(--radius)',
        lg:   'var(--radius-lg)',
        xl:   'var(--radius-xl)',
        full: 'var(--radius-full)',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        DEFAULT: 'var(--shadow)',
        lg: 'var(--shadow-lg)',
        glow: 'var(--accent-glow)',
      },
    },
  },
  plugins: [],
};

export default config;
