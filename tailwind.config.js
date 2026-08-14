/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        sans: ['system-ui', 'sans-serif'],
        outfit: ['system-ui', 'sans-serif'],
        'outfit-medium': ['system-ui', 'sans-serif'],
        'outfit-semibold': ['system-ui', 'sans-serif'],
        'outfit-bold': ['system-ui', 'sans-serif'],
        'outfit-black': ['system-ui', 'sans-serif'],
        mono: ['monospace'],
        'mono-bold': ['monospace'],
      },
      colors: {
        primary: {
          DEFAULT: '#4F46E5', // Indigo
          dark: '#3730A3',
        },
        background: '#FAFAFA',
      }
    },
  },
  plugins: [],
}
