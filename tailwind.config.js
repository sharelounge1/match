/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.html",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#6366F1',
        secondary: '#22C55E',
        'role-dev': '#3B82F6',
        'role-biz': '#8B5CF6',
        'role-marketing': '#F59E0B',
        'role-design': '#EC4899',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
