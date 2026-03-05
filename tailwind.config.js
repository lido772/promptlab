/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Linear/Modern Design System - Dark Mode
        background: {
          deep: '#020203',
          base: '#050506',
          elevated: '#0a0a0c',
        },
        surface: {
          DEFAULT: 'rgba(0,0,0,0.3)',
          hover: 'rgba(0,0,0,0.4)',
        },
        foreground: {
          DEFAULT: '#EDEDEF',
          muted: '#8A8F98',
          subtle: 'rgba(255,255,255,0.60)',
        },
        accent: {
          DEFAULT: '#5E6AD2',
          bright: '#6872D9',
          glow: 'rgba(94,106,210,0.3)',
        },
        border: {
          DEFAULT: 'rgba(255,255,255,0.04)',
          hover: 'rgba(255,255,255,0.08)',
          accent: 'rgba(94,106,210,0.30)',
        },

        // Light Mode Colors
        light: {
          background: {
            base: '#FFFFFF',
            elevated: '#F9FAFB',
            surface: '#F3F4F6',
          },
          surface: {
            DEFAULT: 'rgba(0,0,0,0.015)',
            hover: 'rgba(0,0,0,0.03)',
          },
          foreground: {
            DEFAULT: '#111827',
            muted: '#6B7280',
            subtle: 'rgba(0,0,0,0.60)',
          },
          border: {
            DEFAULT: 'rgba(0,0,0,0.06)',
            hover: 'rgba(0,0,0,0.10)',
            accent: 'rgba(94,106,210,0.20)',
          },
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          'Geist Sans',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        mono: [
          'SF Mono',
          'Monaco',
          'Cascadia Code',
          'Roboto Mono',
          'monospace',
        ],
      },
      fontSize: {
        'display': ['4.5rem', { lineHeight: '1', letterSpacing: '-0.03em' }],
        'heading-xl': ['3.75rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'heading-lg': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'heading-md': ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        'heading-sm': ['1.875rem', { lineHeight: '1.3', letterSpacing: '-0.01em' }],
      },
      animation: {
        'float': 'float 8s ease-in-out infinite',
        'float-delayed': 'float 10s ease-in-out 4s infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 3s linear infinite',
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'slide-up': 'slideUp 0.6s ease-out forwards',
        'scale-in': 'scaleIn 0.4s ease-out forwards',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-20px) rotate(1deg)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '0.5' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'base-gradient': 'radial-gradient(ellipse at top, #0a0a0f 0%, #050506 50%, #020203 100%)',
        'base-gradient-light': 'radial-gradient(ellipse at top, #FFFFFF 0%, #F9FAFB 50%, #F3F4F6 100%)',
        'text-gradient': 'linear-gradient(to bottom, #ffffff, #fffffff2, #ffffffb3)',
        'text-gradient-light': 'linear-gradient(to bottom, #111827, #111827f2, #111827b3)',
        'text-accent-gradient': 'linear-gradient(to right, #5E6AD2, #818cf8, #5E6AD2)',
      },
      boxShadow: {
        'card': '0 0 0 1px rgba(255,255,255,0.06), 0 2px 20px rgba(0,0,0,0.4), 0 0 40px rgba(0,0,0,0.2)',
        'card-hover': '0 0 0 1px rgba(255,255,255,0.1), 0 8px 40px rgba(0,0,0,0.5), 0 0 80px rgba(94,106,210,0.1)',
        'card-light': '0 0 0 1px rgba(0,0,0,0.03), 0 2px 20px rgba(0,0,0,0.02), 0 0 40px rgba(0,0,0,0.01)',
        'card-light-hover': '0 0 0 1px rgba(0,0,0,0.06), 0 8px 40px rgba(0,0,0,0.04), 0 0 80px rgba(94,106,210,0.08)',
        'glow': '0 0 0 1px rgba(94,106,210,0.5), 0 4px 12px rgba(94,106,210,0.3), inset 0 1px 0 0 rgba(255,255,255,0.2)',
        'glow-lg': '0 0 0 1px rgba(94,106,210,0.5), 0 8px 30px rgba(94,106,210,0.4), inset 0 1px 0 0 rgba(255,255,255,0.2)',
        'inner-light': 'inset 0 1px 0 0 rgba(255,255,255,0.06)',
      },
      backdropBlur: {
        xs: '2px',
      },
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      transitionDuration: {
        '200': '200ms',
        '300': '300ms',
      },
      transitionTimingFunction: {
        'expo-out': '[0.16, 1, 0.3, 1]',
      },
    },
  },
  plugins: [],
};
