module.exports = {
  // https://github.com/IanVS/prettier-plugin-sort-imports
  importOrder: [
    "^(react/(.*)$)|^(react$)",
    "<THIRD_PARTY_MODULES>",
    "^~/(.*)$",
    "^[./]",
  ],
  importOrderParserPlugins: ["typescript", "jsx", "decorators-legacy"],
  importOrderTypeScriptVersion: "5.3.3",

  // https://github.com/tailwindlabs/prettier-plugin-tailwindcss
  // https://github.com/tailwindlabs/prettier-plugin-tailwindcss/issues/59
  tailwindConfig: "./tailwind.config.ts",
  plugins: [
    "@ianvs/prettier-plugin-sort-imports",
    "prettier-plugin-tailwindcss", // MUST come last
  ],
};
