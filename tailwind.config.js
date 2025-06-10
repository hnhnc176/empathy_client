/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          primary: '#123E23',
          secondary: '#F0F4E6',
          accent: '#DDF4A6',
          background: '#FCFCF4',
        },
        fontFamily: {
            buenard: ['Buenard', 'serif'],
            manrope: ['Manrope', 'sans-serif'],
            dmSans: ['DM Sans', 'sans-serif'],
        }
      },
    },
    plugins: [],
  }