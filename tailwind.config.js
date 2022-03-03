module.exports = {
  content: ["./**/*.html"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        'cilk-pink': '#fc3dc2',
        'cornflower-blue': '#2f6efb',
        'dark-blue': '#001c7c',
        'silk-grey': '#eceae9',
        'light-blue': '#bed2fe'
      },
    },
  },
  variants: {},
  plugins: [require("@tailwindcss/typography")],
};
