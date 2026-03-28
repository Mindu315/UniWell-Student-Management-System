/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1E3A5F',
        secondary: '#1F5F73',
        accent: '#2BB673',
        warning: '#F2994A',
        background: '#F7F9FB',
        card: '#FFFFFF',
        textPrimary: '#1C2A39',
        textSecondary: '#6B7280',
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #1E3A5F 0%, #1F5F73 50%, #2BB673 100%)',
        'hero-gradient-soft': 'linear-gradient(135deg, #1E3A5F08 0%, #1F5F7310 50%, #2BB67308 100%)',
        'card-shimmer': 'linear-gradient(90deg, transparent 0%, rgba(30,58,95,0.04) 50%, transparent 100%)',
        'accent-gradient': 'linear-gradient(135deg, #2BB673 0%, #1F5F73 100%)',
        'primary-gradient': 'linear-gradient(135deg, #1E3A5F 0%, #1F5F73 100%)',
        'warm-gradient': 'linear-gradient(135deg, #F2994A 0%, #F2994A80 100%)',
      },
      boxShadow: {
        'glow-primary': '0 0 20px rgba(30,58,95,0.15)',
        'glow-accent': '0 0 20px rgba(43,182,115,0.15)',
        'glow-warning': '0 0 20px rgba(242,153,74,0.15)',
        'card-hover': '0 10px 40px rgba(30,58,95,0.08), 0 2px 8px rgba(30,58,95,0.04)',
        'elevated': '0 4px 24px rgba(30,58,95,0.06)',
        'nav-active': '0 2px 12px rgba(30,58,95,0.2)',
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-in-scale': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        'slide-in-right': {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'slide-in-left': {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'count-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '60%': { opacity: '1', transform: 'translateY(-2px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'gradient-x': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.5s ease-out both',
        'fade-in': 'fade-in 0.4s ease-out both',
        'fade-in-scale': 'fade-in-scale 0.4s ease-out both',
        'shimmer': 'shimmer 2s linear infinite',
        'float': 'float 3s ease-in-out infinite',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
        'slide-in-right': 'slide-in-right 0.4s ease-out both',
        'slide-in-left': 'slide-in-left 0.4s ease-out both',
        'count-up': 'count-up 0.6s ease-out both',
        'gradient-x': 'gradient-x 3s ease infinite',
      },
    },
  },
  plugins: [],
}
