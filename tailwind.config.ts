import { type Config } from "tailwindcss";
import { flavorEntries } from "https://deno.land/x/catppuccin@v1.2.0/mod.ts";

const colors = Object.fromEntries(
  flavorEntries.map((
    [flavorName, { colorEntries }],
  ) => [
    flavorName,
    Object.fromEntries(
      colorEntries.map(([colorName, { hex }]) => [colorName, hex]),
    ),
  ]),
);

export default {
  content: [
    "{routes,islands,components}/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors,
      keyframes: {
        wiggle: {
          "0%, 100%": { transform: "rotate(-3deg)" },
          "50%": { transform: "rotate(3deg)" },
        },
        move: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(100%)" },
        },
        colorChange: {
          "0%, 100%": { color: "#89b4fa" },
          "50%": { color: "#a6e3a1" },
        },
      },
      animation: {
        rotate: "spin 3s linear infinite",
        wiggle: "wiggle 1s ease-in-out infinite",
        move: "move 5s linear infinite",
        loader: "spin 1s linear infinite, colorChange 4s ease-in-out infinite",
      },
    },
  },
} satisfies Config;
