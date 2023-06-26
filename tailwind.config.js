/** @type {import('tailwindcss').Config} */

const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
    content: ["./src/**/*.{html,ts}"],
    safelist: ['bg-blue-400', 'bg-green-400', 'bg-red-400'],
    theme: {
        extend: {},
        fontFamily: {
            sans: ['Montserrat', ...defaultTheme.fontFamily.sans]
        },
        plugins: [],
    }
}
