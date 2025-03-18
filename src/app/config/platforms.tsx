import { Platform } from "@/app/types/platforms"

const basePlatforms: Platform[] = [
    {
        id: "lfj",
        name: "LFJ",
        icon: "square.png",
        img: {
            square: "square.png",
            brandDark: "brand-dark.png",
            brandLight: "brand-light.png",
        },
    },
    {
        id: "pangolin",
        name: "Pangolin",
        icon: "square.svg",
        img: {
            square: "square.svg",
            squareDark: "square-dark.svg",
            squareLight: "square-light.svg",
            brand: "brand.svg",
        },
    },
    {
        id: "uniswap",
        name: "Uniswap",
        icon: "square.svg",
        img: {
            square: "square.svg",
            squareDark: "square-dark.svg",
            squareLight: "square-light.svg",
            brand: "brand.svg",
            brandDark: "brand-dark.svg",
            brandLight: "brand-light.svg",
        },
    },
    {
        id: "dexalot",
        name: "Dexalot",
        icon: "square.svg",
        img: {
            square: "square.svg",
            brand: "brand.svg",
        },
    },
    {
        id: "plyr",
        name: "PLYR",
        icon: "square.svg",
        img: {
            square: "square.svg",
            brand: "brand.svg",
        },
    },
    {
        id: "benqi",
        name: "BENQI",
        icon: "square.svg",
        img: {
            square: "square.svg",
            brand: "brand.svg",
        },
    },
    {
        id: "benqi-savax",
        name: "sAVAX",
        icon: "square.svg",
        img: {
            square: "square.svg",
            squareDark: "square-dark.svg",
            squareLight: "square-light.svg",
        },
    },
    {
        id: "curve",
        name: "Curve",
        icon: "square.svg",
        img: {
            square: "square.svg",
            squareLight: "square-light.svg",
        },
    },
    {
        id: "gmx",
        name: "GMX",
        icon: "square.svg",
        img: {
            square: "square.svg",
            brand: "brand.svg",
        },
    },
    {
        id: "sushi",
        name: "Sushi",
        icon: "square.svg",
        img: {
            square: "square.svg",
        },
    },
    {
        id: "synapse",
        name: "Synapse",
        icon: "square.svg",
        img: {
            square: "square.svg",
        },
    },
    {
        id: "wombat",
        name: "Wombat",
        icon: "square.svg",
        img: {
            square: "square.svg",
            squareDark: "square-dark.svg",
            brand: "brand.svg",
            brandDark: "brand-dark.svg",
        },
    },
    {
        id: "woofi",
        name: "WOOFi",
        icon: "square.svg",
        img: {
            square: "square.svg",
            squareDark: "square-dark.svg",
            brand: "brand.svg",
        },
    },
] as const

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const platformIds = basePlatforms.map((platform) => platform.id)
export type PlatformId = (typeof platformIds)[number]

const platformData: Record<PlatformId, Platform> = {}
basePlatforms.forEach((platform) => {
    platformData[platform.id] = platform
})
export const Platforms: Record<PlatformId, Platform> = {
    ...platformData,
} as const