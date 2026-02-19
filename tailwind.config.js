/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e8f5e9',
          100: '#c8e6c9',
          500: '#03AC0E',
          600: '#028A0C',
          700: '#027009',
        },
        secondary: {
          500: '#FF6200',
          600: '#E55A00',
        },
      },
    },
  },
  plugins: [],
}
