import { Montserrat, Source_Code_Pro } from "next/font/google"

export const montserrat = Montserrat({
    subsets: ["latin"],
    display: "swap",
    variable: "--font-montserrat",
})

export const sourceCodePro = Source_Code_Pro({
    subsets: ["latin"],
    display: "swap",
    variable: "--font-mono",
})
