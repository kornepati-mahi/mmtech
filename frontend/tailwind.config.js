/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        ink: {
          50: '#F5F7FB',
          100: '#E9EDF6',
          200: '#CFD8E8',
          300: '#A7B4CE',
          400: '#6B7A99',
          500: '#47546F',
          600: '#2E3850',
          700: '#1B2337',
          800: '#0E1524',
          900: '#070B18',
        },
        brand: {
          50: '#EFF5FF',
          100: '#DBE8FF',
          200: '#BED5FF',
          300: '#91B9FF',
          400: '#5D92FC',
          500: '#356FF6',
          600: '#1F53EB',
          700: '#183FD7',
          800: '#1A35AE',
          900: '#1C3289',
        },
        accent: {
          50: '#ECFEFF',
          100: '#CFFAFE',
          200: '#A5F3FC',
          300: '#67E8F9',
          400: '#22D3EE',
          500: '#06B6D4',
          600: '#0891B2',
          700: '#0E7490',
          800: '#155E75',
          900: '#164E63',
        },
        violet: {
          400: '#A78BFA',
          500: '#8B5CF6',
          600: '#7C3AED',
        },
      },
      boxShadow: {
        xs: '0 1px 2px rgba(7, 11, 24, 0.05)',
        sm: '0 2px 8px -2px rgba(7, 11, 24, 0.08), 0 4px 16px -6px rgba(7, 11, 24, 0.06)',
        md: '0 8px 24px -6px rgba(7, 11, 24, 0.10), 0 16px 40px -12px rgba(7, 11, 24, 0.10)',
        lg: '0 18px 48px -12px rgba(7, 11, 24, 0.16), 0 32px 80px -24px rgba(7, 11, 24, 0.16)',
        glow: '0 12px 40px -12px rgba(53, 111, 246, 0.55)',
        'glow-accent': '0 12px 40px -12px rgba(34, 211, 238, 0.45)',
      },
      backgroundImage: {
        'grid-light':
          'linear-gradient(to right, rgba(15,23,42,0.055) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,23,42,0.055) 1px, transparent 1px)',
        'grid-dark':
          'linear-gradient(to right, rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.045) 1px, transparent 1px)',
        'brand-gradient': 'linear-gradient(135deg, #1F53EB 0%, #3B82F6 45%, #06B6D4 100%)',
        'hero-gradient': 'linear-gradient(150deg, #070B18 0%, #101A3A 45%, #14224F 100%)',
      },
      backgroundSize: {
        grid: '44px 44px',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translate3d(0,0,0) scale(1)' },
          '50%': { transform: 'translate3d(0,-28px,0) scale(1.06)' },
        },
        drift: {
          '0%, 100%': { transform: 'translate3d(0,0,0)' },
          '50%': { transform: 'translate3d(24px,-18px,0)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.85)', opacity: '0.7' },
          '80%, 100%': { transform: 'scale(1.6)', opacity: '0' },
        },
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        float: 'float 9s ease-in-out infinite',
        drift: 'drift 14s ease-in-out infinite',
        'pulse-ring': 'pulse-ring 2.4s cubic-bezier(0.4,0,0.6,1) infinite',
        shimmer: 'shimmer 6s linear infinite',
        marquee: 'marquee 32s linear infinite',
        'fade-up': 'fade-up 0.6s cubic-bezier(0.16,1,0.3,1) both',
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
}
