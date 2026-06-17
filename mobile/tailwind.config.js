/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        cream: '#FCF8F4',
        'serenity-green': '#5A6838',
        'mindful-brown': '#6B5843',
        'trust-blue': '#2B5F8A',
        'dark-green': '#2D3E26',
        light: '#FCF8F4',
      },
      fontFamily: {
        sans: ['Urbanist_400Regular'],
        'sans-semibold': ['Urbanist_600SemiBold'],
      },
    },
  },
  plugins: [],
};
