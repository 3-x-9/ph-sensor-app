/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./App.{js,jsx,ts,tsx}",
        "./app/**/*.{js,jsx,ts,tsx}",
        "./components/**/*.{js,jsx,ts,tsx}"
    ],
    theme: {
        extend: {
            colors: {
                primary: '#030014',
                secondary: '#000000',
                light: {
                    100: '#f3f4f6',
                    200: '#9ca3af',
                    300: '#111827',
                },
                dark: {
                    100: '#1f2937',
                    200: '#4b5563',
                    300: '#f9fafb',
                },
                accent: '#AB8BFF',
            },
        },
    },
    plugins: [],
    presets: [require("nativewind/preset")],
};
