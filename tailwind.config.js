/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#FFFFFF',
        surface: '#F9F9FB',
        ink: '#000000',
        rule: '#E5E5E5',
        signal: '#FF2A00',
        cobalt: '#0038FF',
      },
      fontFamily: {
        sans: ['"Archivo"', '"Inter Tight"', '"Helvetica Neue"', 'Arial', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Space Mono"', 'monospace'],
      },
      letterSpacing: {
        swiss: '-0.035em',
      },
    },
  },
  plugins: [],
};
