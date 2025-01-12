/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        grand: ['"Grand Hotel"', 'cursive'], // Grand Hotel
        merriweather: ['"Merriweather Sans"', 'sans-serif'], // Merriweather Sans
      },
      screens: {
        'xg': '1400px', // Custom breakpoint if needed
      },
    },
  },
  plugins: [],
};
