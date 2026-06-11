import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        facheiro: {
          off: "#F3F1EC",
          linen: "#D6CEC1",
          leather: "#B8845A",
          brown: "#4A2E20",
          black: "#1A1A1A"
        }
      },
      fontFamily: {
        serif: ["var(--font-din-condensed)", "DIN Condensed", "sans-serif"],
        display: ["var(--font-din-condensed)", "DIN Condensed", "sans-serif"],
        sans: ["var(--font-din-medium)", "DIN Medium", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
