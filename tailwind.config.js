/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f5f3ff",
          100: "#ede9fe",
          500: "#6366F1",
          600: "#4F46E5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
        },
        secondary: "#6366F1",
        accent: "#FBBF24",
        background: "#F9FAFB",
        text: "#111827",
      },
    },
  },
  plugins: [],
}
