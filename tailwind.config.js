/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Kodchasan', 'sans-serif'],
        kodchasan: ['Kodchasan', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

