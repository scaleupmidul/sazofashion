/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./App.tsx",
    "./index.tsx",
    "./components/**/*.tsx",
    "./hooks/**/*.ts",
    "./pages/**/*.tsx",
    "./store/**/*.ts",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Cormorant Garamond"', '"Playfair Display"', '"Bodoni Moda"', 'serif'],
        product: ['"Cormorant Garamond"', '"Playfair Display"', '"Bodoni Moda"', 'serif'],
        fashion: ['"Tenor Sans"', '"Cinzel"', 'serif'],
        display: ['Montserrat', 'sans-serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
        admin: ['Inter', 'sans-serif'],
      },
      colors: {
        brand: {
          offwhite: '#F9F7F2',
          charcoal: '#1A1A1A',
          accent: '#C38B7C',
          border: 'rgba(26, 26, 26, 0.08)',
          muted: '#707070',
        },
        rose: {
          50: '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#f43f5e',
          600: '#e11d48',
          700: '#be123c',
          800: '#9f1239',
          900: '#881337',
        }
      }
    },
  },
  plugins: [],
}
