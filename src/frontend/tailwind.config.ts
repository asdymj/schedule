import type { Config } from 'tailwindcss';

// 디자인스타일가이드(#13) §10 토큰 네이밍 규칙을 Tailwind theme.extend로 매핑.
// 컬러는 CSS 변수(globals.css의 :root / [data-theme="dark"])를 참조하여 라이트/다크 자동 전환.
const config: Config = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary)',
          dark: 'var(--color-primary-dark)',
          light: 'var(--color-primary-light)',
        },
        secondary: 'var(--color-secondary)',
        accent: 'var(--color-accent)',
        background: 'var(--color-bg)',
        surface: {
          DEFAULT: 'var(--color-surface)',
          sunken: 'var(--color-surface-sunken)',
        },
        overlay: 'var(--color-overlay)',
        text: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          tertiary: 'var(--color-text-tertiary)',
          'on-primary': 'var(--color-text-on-primary)',
        },
        border: {
          DEFAULT: 'var(--color-border)',
          strong: 'var(--color-border-strong)',
        },
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        danger: 'var(--color-danger)',
        info: 'var(--color-info)',
        group: {
          1: 'var(--color-group-1)',
          2: 'var(--color-group-2)',
          3: 'var(--color-group-3)',
          4: 'var(--color-group-4)',
          5: 'var(--color-group-5)',
          6: 'var(--color-group-6)',
          7: 'var(--color-group-7)',
          8: 'var(--color-group-8)',
        },
      },
      fontFamily: {
        sans: ['var(--font-pretendard)', 'Inter', '-apple-system', 'sans-serif'],
        hand: ['var(--font-handwriting)', 'cursive'],
      },
      fontSize: {
        display: ['28px', { lineHeight: '36px', fontWeight: '700' }],
        h1: ['22px', { lineHeight: '30px', fontWeight: '700' }],
        h2: ['18px', { lineHeight: '26px', fontWeight: '600' }],
        h3: ['16px', { lineHeight: '24px', fontWeight: '600' }],
        body: ['15px', { lineHeight: '22px', fontWeight: '400' }],
        'body-strong': ['15px', { lineHeight: '22px', fontWeight: '600' }],
        'body-sm': ['13px', { lineHeight: '19px', fontWeight: '400' }],
        caption: ['12px', { lineHeight: '16px', fontWeight: '400' }],
        overline: ['11px', { lineHeight: '14px', fontWeight: '700', letterSpacing: '0.08em' }],
      },
      spacing: {
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '24px',
        '6': '32px',
        '7': '48px',
        '8': '64px',
      },
      borderRadius: {
        card: '8px',
        button: '12px',
        modal: '16px',
        pill: '9999px',
      },
      boxShadow: {
        card: '0 2px 8px rgba(0,0,0,0.06)',
        modal: '0 12px 32px rgba(0,0,0,0.16)',
      },
      transitionDuration: {
        micro: '100ms',
        fast: '200ms',
        normal: '300ms',
        slow: '500ms',
      },
    },
  },
  plugins: [],
};

export default config;
