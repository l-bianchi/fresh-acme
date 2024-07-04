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
    },
  },
} satisfies Config;
