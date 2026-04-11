/** @type {import("tailwindcss").Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{vue,js,ts,jsx,tsx,svg}",
        "./src/**/*/*.svg"
    ],
    darkMode: "class",
    theme: {
        screens: {
            sm: "480px",
            smd: "840px",
            md: "750px",
            lg: "976px",
            xl: "1440px"
        },
        extend: {
            colors: {
                /* ── Paleta del evento público ── */
                "event-bg": "#252146",
                "event-bg-dark": "#1a1735",
                "event-accent": "#F2780C",
                "event-accent-red": "#F25116",
                "event-accent-burnt": "#E1782C",

                "on-tertiary-fixed": "#1b1c1c",
                "on-secondary": "#ffffff",
                "surface": "#f9f9f9",
                "on-error-container": "#93000a",
                "inverse-on-surface": "#f1f1f1",
                "surface-bright": "#f9f9f9",
                "on-surface": "#1b1b1b",
                "tertiary": "#5c5c5c",
                "on-tertiary-container": "#fefcfc",
                "on-tertiary-fixed-variant": "#464747",
                "surface-container": "#eeeeee",
                "outline": "#946e6c",
                "tertiary-fixed": "#e4e2e2",
                "tertiary-container": "#757474",
                "secondary": "#734f8e",
                "tertiary-fixed-dim": "#c7c6c6",
                "on-secondary-fixed-variant": "#5a3875",
                "on-error": "#ffffff",
                "secondary-fixed-dim": "#e1b6fd",
                "surface-container-lowest": "#ffffff",
                "inverse-surface": "#303030",
                "surface-container-highest": "#e2e2e2",
                "secondary-container": "#e1b6fd",
                "background": "#f9f9f9",
                "error": "#ba1a1a",
                "on-background": "#1b1b1b",
                "error-container": "#ffdad6",
                "on-secondary-fixed": "#2c0746",
                "outline-variant": "#e9bcba",
                "surface-variant": "#e2e2e2",
                "on-surface-variant": "#5f3e3e",
                "on-secondary-container": "#674381",
                "surface-tint": "#bf0029",
                "surface-container-high": "#e8e8e8",
                "secondary-fixed": "#f2daff",
                "on-tertiary": "#ffffff",
                "surface-container-low": "#f3f3f3",
                "surface-dim": "#dadada"
            },
            fontFamily: {
                "headline": [ "Be Vietnam Pro" ],
                "body": [ "Inter" ],
                "label": [ "Inter" ]
            }
        }
    },
    corePlugins: {
        preflight: true, // change this to false if you don't want TailwindCSS to reset your CSS
        enabled: true
    },
    plugins: [ require("tailwindcss-primeui") ]
};