import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";

export default {
  input: "src/index.js",
  output: [
    {
      file: "dist/wiringdiagram.esm.js",
      format: "es",
      sourcemap: true
    },
    {
      file: "dist/wiringdiagram.cjs",
      format: "cjs",
      sourcemap: true,
      exports: "named"
    },
    {
      file: "dist/wiringdiagram.umd.js",
      format: "umd",
      name: "WiringDiagram",
      sourcemap: true
    }
  ],
  plugins: [resolve(), commonjs()]
};
