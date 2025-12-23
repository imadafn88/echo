export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#ffffff",
        fg: "#000000",
        muted: "#6b6b6b",
        border: "#e5e5e5",
        accent: "#ff2b2b", // sharp red (Nothing vibe)
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
