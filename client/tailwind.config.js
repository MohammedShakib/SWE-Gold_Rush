/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                gold: {
                    100: '#F9F1D8',
                    200: '#F0DEAA',
                    300: '#E6CB7D',
                    400: '#DDB856',
                    500: '#D4AF37', // Base Gold
                    600: '#AA8C2C',
                    700: '#806921',
                    800: '#554616',
                    900: '#2B230B',
                },
                dark: {
                    900: '#121212',
                    800: '#1E1E1E',
                    700: '#2C2C2C',
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                serif: ['Playfair Display', 'serif'],
            },
            animation: {
                marquee: 'marquee 25s linear infinite',
            },
            keyframes: {
                marquee: {
                    '0%': { transform: 'translateX(0)' },
                    '100%': { transform: 'translateX(-100%)' },
                }
            }
        },
    },
    plugins: [],
}
