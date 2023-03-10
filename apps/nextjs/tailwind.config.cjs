/** @type {import("tailwindcss").Config} */
const config = {
  content: [
    "./src/**/*.tsx",
    "../../node_modules/tailwind-datepicker-react/dist/**/*.js",
  ],
  // @ts-ignore
  presets: [require("@acme/tailwind-config")],
};

module.exports = config;
