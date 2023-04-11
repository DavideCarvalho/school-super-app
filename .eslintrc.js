/** @type {import("eslint").Linter.Config} */
const config = {
  root: true,
  extends: ["acme"], // uses the config in `packages/config/eslint`
  parser: "@typescript-eslint/parser",
  rules: {
    "@typescript-eslint/no-misused-promises": [
      "error",
      {"checksVoidReturn": {"attributes": false}}
    ]
  },
  parserOptions: {
    ecmaVersion: "latest",
    tsconfigRootDir: __dirname,
    project: [
      "./tsconfig.json",
      "./apps/*/tsconfig.json",
      "./packages/*/tsconfig.json",
    ],
  },
  settings: {
    next: {
      rootDir: ["apps/nextjs"],
    },
  },
};

module.exports = config;
