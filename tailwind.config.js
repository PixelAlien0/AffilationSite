/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#FAF6F0',
        surface: '#F2ECE1',
        ink: '#181415',
        rouge: '#D91B5C',
        blush: '#FADADD',
        olive: '#2A3B2C',
      },
      fontFamily: {
        serif: ['"Instrument Serif"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', '"Helvetica Neue"', 'sans-serif'],
        mono: ['"Space Mono"', 'monospace'],
      },
      letterSpacing: {
        editorial: '-0.025em',
      },
    },
  },
  plugins: [],
};
