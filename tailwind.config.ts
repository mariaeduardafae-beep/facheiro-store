import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
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
        serif: ["var(--font-cormorant)", "Cormorant Garamond", "serif"],
        display: ["var(--font-ivar)", "Cormorant Garamond", "serif"],
        sans: ["var(--font-inter)", "Inter", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
