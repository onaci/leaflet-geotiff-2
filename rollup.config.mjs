import babel from "@rollup/plugin-babel";
export default [
  {
    input: "src/leaflet-geotiff.js",
    output: [
      {
        dir: "dist",
        format: 'iife',
        name: 'main',
        globals: {
          "@babel/runtime/regenerator": "regeneratorRuntime",
        },
      },
    ],
    plugins: [babel({ exclude: "node_modules/**" })],
    external: ["geotiff", "plotty"],
  }
];
