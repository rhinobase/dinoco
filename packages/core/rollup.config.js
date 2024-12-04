const { withNx } = require("@nx/rollup/with-nx");
const terser = require("@rollup/plugin-terser");

module.exports = withNx(
  {
    main: "./src/index.ts",
    outputPath: "./dist",
    tsConfig: "./tsconfig.lib.json",
    compiler: "swc",
    format: ["esm"],
    assets: [
      { input: ".", output: ".", glob: "README.md" },
      { input: ".", output: ".", glob: "packages/core/package.json" },
    ],
  },
  {
    input: {
      index: "./src/index.ts",
      validator: "./src/validator/index.ts",
    },
    plugins: [terser()],
  },
);
