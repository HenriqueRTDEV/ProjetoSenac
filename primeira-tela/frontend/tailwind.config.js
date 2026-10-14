/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.tsx',
    './telas/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {},
  },
  plugins: [],
};