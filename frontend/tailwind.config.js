/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        gray: { 950: '#030712' },
      },
      animation: {
        'fade-in':          'fadeIn 0.5s ease-in-out',
        'fade-up':          'fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) both',
        'fade-left':        'fadeLeft 0.7s cubic-bezier(0.16,1,0.3,1) both',
        'fade-right':       'fadeRight 0.7s cubic-bezier(0.16,1,0.3,1) both',
        'scale-in':         'scaleIn 0.55s cubic-bezier(0.16,1,0.3,1) both',
        /* ── Fade + Slide variants ── */
        'fade-slide-up':    'fadeSlideUp 0.6s cubic-bezier(0.16,1,0.3,1) both',
        'fade-slide-down':  'fadeSlideDown 0.6s cubic-bezier(0.16,1,0.3,1) both',
        'fade-slide-left':  'fadeSlideLeft 0.6s cubic-bezier(0.16,1,0.3,1) both',
        'fade-slide-right': 'fadeSlideRight 0.6s cubic-bezier(0.16,1,0.3,1) both',
        'fade-zoom':        'fadeZoom 0.55s cubic-bezier(0.16,1,0.3,1) both',
        'fade-blur-in':     'fadeBlurIn 0.6s cubic-bezier(0.16,1,0.3,1) both',
        /* ── Skeleton ── */
        'skeleton':         'skeletonPulse 1.6s ease-in-out infinite',
        /* ── Misc ── */
        'float':       'float 7s ease-in-out infinite',
        'float-slow':  'float 11s ease-in-out infinite reverse',
        'float-fast':  'float 4.5s ease-in-out infinite',
        'glow-pulse':  'glowPulse 2.5s ease-in-out infinite',
        'slide-up':    'slideUp 0.4s ease-out',
        'blob':        'blob 10s ease-in-out infinite alternate',
        'spin-slow':   'spin 14s linear infinite',
        'shimmer':     'shimmer 1.5s infinite linear',
        'bounce-soft': 'bounceSoft 2.5s ease-in-out infinite',
        'theme-swap':  'themeSwap 0.4s cubic-bezier(0.34,1.56,0.64,1)',
        'gradient-x':  'gradientX 5s ease infinite',
        'ping-soft':   'pingSoft 2s cubic-bezier(0,0,0.2,1) infinite',
      },
      keyframes: {
        fadeIn:    { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        fadeUp:    { '0%': { opacity: '0', transform: 'translateY(32px)' },  '100%': { opacity: '1', transform: 'translateY(0)' } },
        fadeLeft:  { '0%': { opacity: '0', transform: 'translateX(32px)' },  '100%': { opacity: '1', transform: 'translateX(0)' } },
        fadeRight: { '0%': { opacity: '0', transform: 'translateX(-32px)' }, '100%': { opacity: '1', transform: 'translateX(0)' } },
        scaleIn:   { '0%': { opacity: '0', transform: 'scale(0.88)' },       '100%': { opacity: '1', transform: 'scale(1)' } },
        /* ── Fade + Slide variants ── */
        fadeSlideUp:    { '0%': { opacity: '0', transform: 'translateY(20px)' },  '100%': { opacity: '1', transform: 'translateY(0)' } },
        fadeSlideDown:  { '0%': { opacity: '0', transform: 'translateY(-20px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        fadeSlideLeft:  { '0%': { opacity: '0', transform: 'translateX(-20px)' }, '100%': { opacity: '1', transform: 'translateX(0)' } },
        fadeSlideRight: { '0%': { opacity: '0', transform: 'translateX(20px)' },  '100%': { opacity: '1', transform: 'translateX(0)' } },
        fadeZoom:    { '0%': { opacity: '0', transform: 'scale(0.92) translateY(10px)' }, '100%': { opacity: '1', transform: 'scale(1) translateY(0)' } },
        fadeBlurIn:  { '0%': { opacity: '0', filter: 'blur(8px)', transform: 'translateY(8px)' }, '100%': { opacity: '1', filter: 'blur(0)', transform: 'translateY(0)' } },
        /* ── Skeleton ── */
        skeletonPulse: {
          '0%':   { backgroundPosition: '-300% 0' },
          '100%': { backgroundPosition: '300% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '33%':      { transform: 'translateY(-20px) rotate(2deg)' },
          '66%':      { transform: 'translateY(-8px) rotate(-1.5deg)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px 0 rgba(139,92,246,0.25)' },
          '50%':      { boxShadow: '0 0 50px 8px rgba(139,92,246,0.55)' },
        },
        slideUp: { '0%': { transform: 'translateY(20px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        blob: {
          '0%':   { borderRadius: '58% 42% 30% 70% / 64% 38% 62% 36%' },
          '33%':  { borderRadius: '42% 58% 68% 32% / 45% 55% 45% 55%' },
          '66%':  { borderRadius: '30% 70% 50% 50% / 50% 30% 70% 50%' },
          '100%': { borderRadius: '58% 42% 30% 70% / 64% 38% 62% 36%' },
        },
        bounceSoft: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        themeSwap: {
          '0%':   { transform: 'scale(0) rotate(-90deg)', opacity: '0' },
          '60%':  { transform: 'scale(1.15) rotate(10deg)', opacity: '1' },
          '100%': { transform: 'scale(1) rotate(0deg)', opacity: '1' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        gradientX: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%':      { backgroundPosition: '100% 50%' },
        },
        pingSoft: {
          '0%':      { transform: 'scale(1)', opacity: '0.8' },
          '75%, 100%': { transform: 'scale(1.8)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
}
