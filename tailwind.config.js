/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        gold: "#D4AF37",
        paleGold: "#E5D0A1",
        darkGold: "#8A7E57",
        obsidian: "#0a0a0a",
        charcoal: "#1a1a1a",
      },
      fontFamily: {
        serif: ["Playfair Display", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        goldGlow: "0 0 25px rgba(212,175,55,0.35)",
      },
    },
  },
  plugins: [],
}
