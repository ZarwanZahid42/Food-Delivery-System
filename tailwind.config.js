/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        customer: {
          primary: '#3b82f6',
          secondary: '#60a5fa',
          light: '#dbeafe',
        },
        restaurant: {
          primary: '#10b981',
          secondary: '#34d399',
          light: '#d1fae5',
        },
        driver: {
          primary: '#f59e0b',
          secondary: '#fbbf24',
          light: '#fef3c7',
        },
      },
    },
  },
  plugins: [],
}