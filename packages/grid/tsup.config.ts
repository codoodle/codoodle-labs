import { readFile, writeFile } from "node:fs/promises";
import path from "path";
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  minify: false,
  onSuccess: async () => {
    const sourceFile = path.join("src/styles/codoodle.module.css");
    const targetDir = "dist";
    const targetFile = path.join(targetDir, "index.css");
    try {
      const css = await readFile(sourceFile, "utf-8");
      await writeFile(targetFile, css);
    } catch (err) {
      console.warn("CSS copy warning:", err);
    }
  },
});
