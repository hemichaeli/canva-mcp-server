import * as esbuild from "esbuild";

await esbuild.build({
  entryPoints: ["src/index.ts"],
  bundle: true,
  outfile: "dist/index.js",
  format: "esm",
  platform: "node",
  packages: "external",
  target: "node20",
  sourcemap: false,
  minify: false,
});

console.log("Build complete: dist/index.js");
