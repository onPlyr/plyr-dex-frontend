import BlogIcon from "@/app/components/icons/social/BlogIcon"
import DiscordIcon from "@/app/components/icons/social/DiscordIcon"
import DocsIcon from "@/app/components/icons/social/DocsIcon"
import GithubIcon from "@/app/components/icons/social/GithubIcon"
import XTwitterIcon from "@/app/components/icons/social/XTwitterIcon"
import TelegramIcon from "../components/icons/social/TelegramIcon"

export const PageType = {
    Swap: "swap",
    Routes: "routes",
    SelectSrc: "select-src",
    SelectDst: "select-dst",
    Review: "review",
    Preferences: "preferences",
    Account: "account",
    SwapHistoryList: "swap-history-list",
    SwapHistoryDetail: "swap-history-detail",
    Intro: "intro",
} as const
export type PageType = (typeof PageType)[keyof typeof PageType]

export const SocialLinkType = {
    Twitter: "twitter",
    Discord: "discord",
    Telegram: "telegram",
    //Blog: "blog",
    Docs: "docs",
} as const
export type SocialLinkType = (typeof SocialLinkType)[keyof typeof SocialLinkType]

export interface SocialLinkData {
    name: string,
    href: `https://${string}`,
    icon: React.ReactNode,
    order: number,
}

export const SocialLink: Record<SocialLinkType, SocialLinkData> = {
    [SocialLinkType.Twitter]: {
        name: "X / Twitter",
        href: "https://x.com/OnPlyr",
        icon: <XTwitterIcon />,
        order: 100,
    },
    [SocialLinkType.Discord]: {
        name: "Discord",
        href: "https://discord.gg/plyr",
        icon: <DiscordIcon />,
        order: 200,
    },
    [SocialLinkType.Telegram]: {
        name: "Telegram",
        href: "https://t.me/plyrchain",
        icon: <TelegramIcon />,
        order: 300,
    },
    // [SocialLinkType.Blog]: {
    //     name: "Blog",
    //     href: "https://blog.tesseract.finance/",
    //     icon: <BlogIcon />,
    //     order: 400,
    // },
    [SocialLinkType.Docs]: {
        name: "Documentation",
        href: "https://medium.com/@onplyr/play-earn-swap-how-plyr-swap-keeps-you-in-the-game-5cacb11b6d5c",
        icon: <DocsIcon />,
        order: 500,
    },
} as const
