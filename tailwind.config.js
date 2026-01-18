module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#8A00C4",
        primaryHover: "#7200A2",
        bg: "#FAFAFB",
        textPrimary: "#1F2937",
        textSecondary: "#6B7280",
        borderSubtle: "#E5E7EB",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
