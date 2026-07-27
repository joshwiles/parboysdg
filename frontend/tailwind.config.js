/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'chess-dark': '#2C3E50',
        'chess-light': '#ECF0F1',
        'chess-gold': '#F39C12',
        'chess-silver': '#BDC3C7',
        'chess-brown': '#8B4513',
        'chess-cream': '#FDF5E6'
      },
      fontFamily: {
        'chess': ['Georgia', 'serif'],
        'modern': ['Inter', 'sans-serif']
      },
      backgroundImage: {
        'chess-pattern': "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23f0f0f0\" fill-opacity=\"0.4\"%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"2\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')"
      }
    },
  },
  plugins: [],
} 