// tailwind.config.js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        cosmic: ['Orbitron', 'sans-serif'],
      },
      colors: {
        galaxy: '#0f172a', // deep navy
        neon: '#00f5ff',
        star: '#f0f8ff',
      },
      fontWeight: {
        extrabold: '800',
        bold: '700',
        semibold: '600',
      },
      backgroundImage: {
        stars: "url('/stardust2.jpg')", // Replace with your image path
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        twinkle: "twinkle 20s ease-in-out infinite",
        drift: "drift 120s linear infinite",
        'text-glow': 'text-glow 3s ease-in-out infinite',
        'spin-slow': 'spin-slow 20s linear infinite',
        'pulse-bright': 'pulseBright 2s infinite',
        'fade-in': 'fadeIn 0.3s ease-out',
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        twinkle: {
          "0%, 100%": { opacity: 0.6 },
          "50%": { opacity: 1 },
        },
        drift: {
          "0%": { transform: "translateY(0)" },
          "100%": { transform: "translateY(-1000px)" },
        },
        'text-glow': {
          "0%, 100%": {
            textShadow: "0 0 20px #8be9fd, 0 0 40px #bd93f9",
          },
          "50%": {
            textShadow: "0 0 30px #ff79c6, 0 0 60px #50fa7b",
          },
        },
        'spin-slow': {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        pulseBright: {
          '0%, 100%': {
            boxShadow: '0 0 10px #38bdf8aa, 0 0 20px #38bdf8aa',
            transform: 'scale(1.05)',
          },
          '50%': {
            boxShadow: '0 0 20px #38bdf8ff, 0 0 40px #38bdf8ff',
            transform: 'scale(1.08)',
          },
        }
        ,fadeIn: {
          '0%': { opacity: 0, transform: 'scale(0.95)' },
          '100%': { opacity: 1, transform: 'scale(1)' },
        },
        
      },
    }
  },
  plugins: []
}
