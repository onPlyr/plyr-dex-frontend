import { Platform } from "@/app/types/platforms"

const basePlatforms: Platform[] = [
    {
        id: "lfj",
        name: "LFJ",
        img: {
            square: "square.png",
            brandDark: "brand-dark.png",
            brandLight: "brand-light.png",
        },
    },
    {
        id: "pangolin",
        name: "Pangolin",
        img: {
            square: "square.svg",
            squareDark: "square-dark.svg",
            squareLight: "square-light.svg",
            brand: "brand.svg",
        },
    },
    {
        id: "uniswap",
        name: "PLYR[SWAP]",
        img: {
            square: "square.svg",
            squareDark: "square-dark.svg",
            squareLight: "square-light.svg",
            brand: "brand.svg",
            brandDark: "brand-dark.svg",
            brandLight: "brand-light.svg",
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
