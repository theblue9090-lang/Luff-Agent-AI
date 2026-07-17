/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        luff: {
          bg: '#0B0507',
          surface: '#140A0D',
          card: '#1A0D11',
          border: 'rgba(255,70,80,0.12)',
          red: '#FF2E3E',
          crimson: '#E01029',
          ember: '#FF6A3D',
          rose: '#FF3B6B',
          text: '#F6F1F2',
          muted: '#A79399',
          up: '#28D67B',
          down: '#FF5A5F',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 40px -8px rgba(255,46,62,0.45)',
        'glow-sm': '0 0 20px -6px rgba(255,46,62,0.5)',
        card: '0 8px 30px -12px rgba(0,0,0,0.7)',
      },
      backgroundImage: {
        'red-grad': 'linear-gradient(135deg,#FF2E3E 0%,#FF6A3D 100%)',
        'red-radial': 'radial-gradient(circle at 50% 0%,rgba(255,46,62,0.18),transparent 60%)',
      },
      keyframes: {
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        pulseGlow: {
          '0%,100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        shimmer: 'shimmer 2s infinite',
        pulseGlow: 'pulseGlow 2.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
