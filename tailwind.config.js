/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      gridTemplateColumns: {
        '18': 'repeat(18, minmax(0, 1fr))',
      },
    },
  },
  plugins: [],
};
