import { defineConfig } from "tsup";
import { copyFileSync } from "node:fs";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  target: "es2020",
  external: ["react", "react-dom"],
  treeshake: true,
  minify: true,
  outExtension: () => ({ js: ".mjs" }),
  async onSuccess() {
    copyFileSync("src/styles.css", "dist/styles.css");
  },
});
