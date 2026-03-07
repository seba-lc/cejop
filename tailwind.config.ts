import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "cejop-blue": "#2C46BF",
        "cejop-blue-secondary": "#5267C9",
        "cejop-blue-light": "#B7BFE7",
        "cejop-blue-variant": "#2D4BC1",
        "cejop-dark": "#1A1A2E",
        "cejop-bg": "#F0F2FA",
      },
      fontFamily: {
        montserrat: ["var(--font-montserrat)", "sans-serif"],
        encode: ["var(--font-encode)", "sans-serif"],
        source: ["var(--font-source)", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-out forwards",
        "slide-up": "slideUp 0.6s ease-out forwards",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(40px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
