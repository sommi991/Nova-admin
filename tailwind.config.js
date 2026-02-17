/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Legendary color palette
        'obsidian': '#0A0A0C',
        'midnight': '#0F0F13',
        'onyx': '#14141A',
        'eclipse': '#1A1A22',
        'cosmic': {
          400: '#8B5CF6',
          500: '#7C3AED',
          600: '#6D28D9',
        },
        'neon': {
          400: '#2DD4BF',
          500: '#14B8A6',
          600: '#0D9488',
        },
        'electric': {
          400: '#3B82F6',
          500: '#2563EB',
          600: '#1D4ED8',
        },
        'amber': {
          400: '#F59E0B',
          500: '#D97706',
        },
        'emerald': {
          400: '#10B981',
          500: '#059669',
        },
        'ruby': {
          400: '#EF4444',
          500: '#DC2626',
        },
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'spin-slow': 'spin 3s linear infinite',
        'bounce-slow': 'bounce 2s infinite',
        'wave': 'wave 8s linear infinite',
        'gradient-x': 'gradient-x 3s ease infinite',
        'gradient-y': 'gradient-y 3s ease infinite',
        'gradient-xy': 'gradient-xy 3s ease infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: 1, filter: 'brightness(1) blur(0px)' },
          '50%': { opacity: 0.9, filter: 'brightness(1.3) blur(2px)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        'wave': {
          '0%': { transform: 'translateX(0) translateZ(0) scaleY(1)' },
          '50%': { transform: 'translateX(-25%) translateZ(0) scaleY(0.5)' },
          '100%': { transform: 'translateX(-50%) translateZ(0) scaleY(1)' },
        },
        'gradient-y': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'gradient-x': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'gradient-xy': {
          '0%, 100%': { backgroundPosition: '0% 0%' },
          '25%': { backgroundPosition: '100% 0%' },
          '50%': { backgroundPosition: '100% 100%' },
          '75%': { backgroundPosition: '0% 100%' },
        },
      },
      backgroundImage: {
        'gradient-legendary': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'gradient-cosmic': 'radial-gradient(circle at 30% 50%, rgba(139, 92, 246, 0.3), rgba(45, 212, 191, 0.3))',
        'gradient-mesh': 'radial-gradient(at 40% 20%, hsla(258, 90%, 63%, 0.3) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(189, 100%, 56%, 0.3) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(340, 100%, 76%, 0.3) 0px, transparent 50%)',
      },
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
      },
    },
  },
  plugins: [],
}
