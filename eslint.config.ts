import { eslint } from "./src";

export default eslint(
  {
    type: "lib",
    react: true,
    solid: true,
    pnpm: false,
    svelte: true,
    astro: true,
    nextjs: true,
    typescript: true,
    formatters: true,
    vue: { a11y: true },
    jsx: { a11y: true },
  },
  { ignores: ["fixtures", "_fixtures", "**/constants-generated.ts"] },
  { files: ["src/**/*.ts"], rules: { "perfectionist/sort-objects": "error" } },
);
