/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Material Design 3 (M3) Rose & Terracotta Fashion Theme Tokens
        'md-background': '#FFF8F7',
        'md-on-background': '#22191B',
        'md-surface': '#FFF8F7',
        'md-surface-low': '#FFF0F2',
        'md-surface-container': '#FCEAECE0',
        'md-surface-high': '#F5E4E6',
        'md-surface-highest': '#EFE0E2',
        'md-on-surface': '#22191B',
        'md-on-surface-variant': '#524346',
        'md-primary': '#9C3B56',
        'md-on-primary': '#FFFFFF',
        'md-primary-container': '#FFD9E0',
        'md-on-primary-container': '#3F0016',
        'md-secondary-container': '#FBD9DF',
        'md-on-secondary-container': '#2B151A',
        'md-tertiary-container': '#FFDCC4',
        'md-on-tertiary-container': '#2E1500',
        'md-outline': '#847376',
        'md-outline-variant': '#D7C1C5',
      },
      fontFamily: {
        serif: ['"Instrument Serif"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        'm3-xs': '4px',
        'm3-sm': '8px',
        'm3-md': '12px',
        'm3-lg': '16px',
        'm3-xl': '28px',
      },
    },
  },
  plugins: [],
};
