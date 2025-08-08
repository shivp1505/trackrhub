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
        brandGray: "#E5E5E5", // Background
        brandBlack: "#000000", // Text
        brandButton: "#4B4B4B", // Button background
        brandButtonHover: "#3A3A3A", // Button hover
      },
      fontFamily: {
        instrument: ["var(--font-instrument)"],
        inter: ["var(--font-inter)"],
        arial: ["Arial", "sans-serif"],
      },
      fontSize: {
        logo: "32px",
        nav: "20px",
        heading: "48px",
        subheading: "20px",
        button: "20px",
      },
      borderRadius: {
        button: "8px",
      },
      spacing: {
        navX: "72px", // Navbar horizontal padding
        navY: "32px", // Navbar vertical padding
        navGap: "48px", // Gap between nav links
      },
    },
  },
  plugins: [],
};
export default config;
