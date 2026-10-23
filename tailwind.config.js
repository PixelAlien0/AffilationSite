/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#FBF9F6',
        surface: '#F4EFE8',
        ink: '#1E191A',
        muted: '#756C6E',
        line: '#E4DDD5',
        rouge: '#B83253',
        blush: '#F7E8EC',
      },
      fontFamily: {
        serif: ['"Instrument Serif"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', '"Helvetica Neue"', 'sans-serif'],
        mono: ['"Space Mono"', 'monospace'],
      },
      letterSpacing: {
        editorial: '-0.02em',
      },
    },
  },
  plugins: [],
};
