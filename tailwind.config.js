/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        accent: 'rgb(var(--accent) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'spin-slow': 'spin 8s linear infinite',
        blob: 'blob 20s infinite ease-in-out',
        flame: 'flame 1.5s infinite ease-in-out',
      },
      keyframes: {
        blob: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(30px, -40px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 30px) scale(0.95)' },
        },
        flame: {
          '0%, 100%': { transform: 'scale(1) rotate(-3deg)', opacity: '1' },
          '50%': { transform: 'scale(1.15) rotate(3deg)', opacity: '0.8' },
        },
      },
    },
  },
  plugins: [],
}