/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4472C4',
        secondary: '#70AD47',
        danger: '#C55A11',
        success: '#00B050',
        warning: '#FFC000',
      }
    },
  },
  plugins: [],
}