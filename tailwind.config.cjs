/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./client/index.html",
    "./client/src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@multiverse-io/stardust-react/**/*.{js,ts,jsx,tsx}",
  ],
  presets: [require("@multiverse-io/stardust/tailwind-preset.js")],
};
