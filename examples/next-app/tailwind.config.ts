import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: ["./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}"],
} satisfies Config;
