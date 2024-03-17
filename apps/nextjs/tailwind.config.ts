import type { Config } from "tailwindcss";

import baseConfig from "@acme/tailwind-config";

module.exports = {
  content: ["./src/**/*.tsx"],
  // @ts-ignore
  presets: [baseConfig],
} satisfies Config;