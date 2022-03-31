module.exports = {
  content: [
    "./src/index.html",
    "./src/html/**/*.html",
    "./lib/*",
    "./node_modules/flowbite/**/*.js"
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('flowbite/plugin'),
    require('@tailwindcss/typography'),
  ],
}
