const { withNx } = require("@nx/rollup/with-nx");
const terser = require("@rollup/plugin-terser");
const pkg = require("./package.json");

module.exports = withNx(
  {
    main: "./src/index.ts",
    outputPath: "./dist",
    tsConfig: "./tsconfig.lib.json",
    compiler: "swc",
    format: ["cjs", "esm"],
    assets: [
      {
        input: "packages/zod-validator",
        output: ".",
        glob: "README.md",
      },
      {
        input: "packages/zod-validator",
        output: ".",
        glob: "package.json",
      },
    ],
  },
  {
    plugins: [terser()],
  },
);
