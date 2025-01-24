import type { Config } from "tailwindcss"
import colors from "tailwindcss/colors"
import { RecursiveKeyValuePair } from "tailwindcss/types/config"

const brandLightBlue: RecursiveKeyValuePair<string, string> = {
    DEFAULT: "#daff00", // 500
    50: "#daff00",
    100: "#daff00",
    200: "#daff00",
    300: "#daff00",
    400: "#daff00",
    500: "#daff00",
    600: "#daff00",
    700: "#daff00",
    800: "#daff00",
    900: "#daff00",
    950: "#daff00",
}

const brandDarkBlue: RecursiveKeyValuePair<string, string> = {
    DEFAULT: "#daff00", // 500
    50: "#daff00",
    100: "#daff00",
    200: "#daff00",
    300: "#daff00",
    400: "#daff00",
    500: "#daff00",
    600: "#daff00",
    700: "#daff00",
    800: "#daff00",
    900: "#daff00",
    950: "#daff00",
}

const brandPink: RecursiveKeyValuePair<string, string> = {
    DEFAULT: "#daff00", // 500
    50: "#daff00",
    100: "#daff00",
    200: "#daff00",
    300: "#daff00",
    400: "#daff00",
    500: "#daff00",
    600: "#daff00",
    700: "#daff00",
    800: "#daff00",
    900: "#daff00",
    950: "#daff00",
}

const brandPurple: RecursiveKeyValuePair<string, string> = {
    DEFAULT: "#daff00", // 300
    50: "#daff00",
    100: "#daff00",
    200: "#daff00",
    300: "#daff00",
    400: "#daff00",
    500: "#daff00",
    600: "#daff00",
    700: "#daff00",
    800: "#daff00",
    900: "#daff00",
    950: "#daff00",
}

const brandDarkPurple: RecursiveKeyValuePair<string, string> = {
    DEFAULT: "#daff00", // 50
    50: "#daff00",
    100: "#daff00",
    200: "#daff00",
    300: "#daff00",
    400: "#daff00",
    500: "#daff00",
    600: "#daff00",
    700: "#daff00",
    800: "#daff00",
    900: "#daff00",
    950: "#daff00",
}

const darkZinc: RecursiveKeyValuePair<string, string> = {
    DEFAULT: "#111113", // 900
    50: "#71717A",
    100: "#6C6C74",
    200: "#606067",
    300: "#56565D",
    400: "#4A4A4F",
    500: "#3D3D42",
    600: "#343438",
    700: "#27272A",
    800: "#1D1D20",
    900: "#111113",
    950: "#0C0C0D",
}

export const tailwindCustomColours: Record<string, RecursiveKeyValuePair<string, string>> = {
    brandLightBlue: brandLightBlue,
    brandDarkBlue: brandDarkBlue,
    brandPink: brandPink,
    brandPurple: brandPurple,
    brandDarkPurple: brandDarkPurple,
    darkZinc: darkZinc,
}

const config: Config = {
    content: [
        "./src/app/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "Liberation Mono", "Courier New", "monospace"],
            },
            borderRadius: {
                DEFAULT: "32px",
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)',
                '2.5xl': '28px',
                '3xl': '36px',
                '4xl': '48px'
            },
            backgroundColor: {
                "brand-gradient": "var(--color-brand-green)",
                "brand-gradient-oklch": "var(--color-brand-green)",
                "brand-gradient-conic": "var(--color-brand-green)",
                "brand-gradient-conic-oklch": "var(--color-brand-green)",
                // "brand-radial-dark-blue": "radial-gradient(var(--color-brand-dark-blue), rgba(0, 0, 0, 0))",
                // "brand-radial-dark-blue-oklch": "radial-gradient(in oklch, var(--color-brand-dark-blue-oklch-start), var(--color-brand-dark-blue-oklch-end), var(--color-brand-dark-blue-oklch-end))",
                // "brand-radial-light-blue": "radial-gradient(var(--color-brand-light-blue), rgba(0, 0, 0, 0))",
                // "brand-radial-light-blue-oklch": "radial-gradient(in oklch, var(--color-brand-light-blue-oklch-start), var(--color-brand-light-blue-oklch-end), var(--color-brand-light-blue-oklch-end))",
                // "brand-radial-purple": "radial-gradient(var(--color-brand-dark-purple), rgba(0, 0, 0, 0), rgba(0, 0, 0, 0))",
                // "brand-radial-purple-oklch": "radial-gradient(in oklch, var(--color-brand-dark-purple-oklch-start), var(--color-brand-dark-purple-oklch-end), var(--color-brand-dark-purple-oklch-end))",
                // "brand-radial-pink": "radial-gradient(var(--color-brand-pink), rgba(0, 0, 0, 0))",
                // "brand-radial-pink-oklch": "radial-gradient(in oklch, var(--color-brand-pink-oklch-start), var(--color-brand-pink-oklch-end), var(--color-brand-pink-oklch-end))",

                "gradient-btn": "var(--color-brand-green)",
                "gradient-btn-oklch": "var(--color-brand-green)",

                // "gradient-border-oklch": "conic-gradient(from var(--angle) in oklch, var(--color-brand-pink-oklch), var(--color-brand-dark-purple-oklch), var(--color-brand-pink-oklch))",
            },
            backgroundSize: {
                "brand-gradient": "400% 200%",
                "brand-gradient-oklch": "400% 200%",
                "gradient-btn": "200% 200%",
                // "gradient-btn-oklch": "200% 200%",
            },
            borderWidth: {
                DEFAULT: "3px",
                1: "1px",
                3: "3px",
            },
            keyframes: {
                // "gradient-btn": {
                //     "0%": {
                //         "background-position": "0% 50%",
                //     },
                //     "100%": {
                //         "background-position": "100% 50%",
                //     },
                // },
                "bg-wave": {
                    "0%": {
                        "background-position": "0% 50%",
                    },
                    "50%": {
                        "background-position": "100% 50%",
                    },
                    "100%": {
                        "background-position": "0% 50%",
                    },
                },
                "gradient-container": {
                    "0%": {
                        "background-position": "0% 50%",
                    },
                    "50%": {
                        "background-position": "100% 50%",
                    },
                    "100%": {
                        "background-position": "0% 50%",
                    },
                },
                "rotate": {
                    to: {
                        "--angle": "360deg",
                    },
                },
                "float-up": {
                    "0%": {
                        "transform": "translateY(0)",
                        "opacity": "1",
                    },
                    "50%": {
                        "scale": "1.5",
                    },
                    "75%": {
                        "opacity": "0",
                        "scale": "1",
                    },
                    "100%": {
                        "transform": "translateY(-200vh)",
                        "opacity": "0",
                    },
                },
            },
            animation: {
                "bg-wave": "bg-wave 10s ease infinite",
                "rotate": "5s rotate linear infinite",
                "float-up": "float-up 5s ease-in-out infinite",
                // "gradient-btn": "gradient-btn 2s ease-in-out",
            },
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",

                destructive: {
                    DEFAULT: 'hsl(var(--destructive))',
                    foreground: 'hsl(var(--destructive-foreground))'
                },

                // todo: review/remove, used for testing
                "layout": tailwindCustomColours.darkZinc,
                "container": tailwindCustomColours.darkZinc,
                "content": tailwindCustomColours.brandPurple,


                "input": tailwindCustomColours.darkZinc,
                "btn": tailwindCustomColours.darkZinc,
                "select": tailwindCustomColours.darkZinc,
                "summary": tailwindCustomColours.brandDarkBlue,

                "muted": colors.zinc,
                "success": colors.green,
                "error": colors.rose,
                "warning": colors.amber,
                "info": tailwindCustomColours.brandLightBlue,

                "link": tailwindCustomColours.brandPink,

                "brand": tailwindCustomColours.brandPink, // tbc: main/default colour
                "brand-light-blue": tailwindCustomColours.brandLightBlue,
                "brand-dark-blue": tailwindCustomColours.brandDarkBlue,
                "brand-pink": tailwindCustomColours.brandPink,
                "brand-purple": tailwindCustomColours.brandPurple,
                "brand-dark-purple": tailwindCustomColours.brandDarkPurple,

            },
        },
    },
    plugins: [
        require("tailwindcss-animate"),
    ],
}

export default config
