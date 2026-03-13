/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#05060A",
        surface: "#0E1016",
        accent: "#F97316",
        accentSoft: "#F97316",
        borderStrong: "#1F2933",
        textPrimary: "#F9FAFB",
        textMuted: "#9CA3AF",
        danger: "#EF4444",
        success: "#22C55E",
        warning: "#FACC15"
      },
      fontFamily: {
        sans: ["system-ui", "ui-sans-serif", "SF Pro Text", "Inter", "sans-serif"]
      }
    }
  },
  plugins: []
};
