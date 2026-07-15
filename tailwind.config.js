/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        /**
         * Paleta institucional PRODHAB (Gobierno de Costa Rica)
         * primary   = Azul marino institucional (#1B2A4A en el tono 600)
         * secondary = Dorado institucional (#C9A84C en el tono 400)
         * Se incluye la escala completa para hover, focus, fondos y textos.
         */
        primary: {
          DEFAULT: '#1B2A4A',
          50: '#eef1f6',
          100: '#d3dae7',
          200: '#a7b5cf',
          300: '#7a8fb4',
          400: '#4d6491',
          500: '#2c4270',
          600: '#1B2A4A', // Azul marino oficial
          700: '#141f38',
          800: '#0e1526',
          900: '#070b15',
        },
        secondary: {
          DEFAULT: '#C9A84C',
          50: '#faf6ea',
          100: '#f2e8c8',
          200: '#e6d192',
          300: '#d9ba6f',
          400: '#C9A84C', // Dorado oficial
          500: '#b08f3a',
          600: '#8f7230',
          700: '#6d5726',
          800: '#4d3d1b',
          900: '#302610',
        },
        // Colores de estado (alertas / validaciones)
        danger: '#C55A11',   // Naranja
        success: '#16a34a',  // Verde
        warning: '#b45309',  // Ámbar
      }
    },
  },
  plugins: [],
}
