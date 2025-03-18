export interface SocialLink {
    id: Lowercase<string>,
    name: string,
    href: `https://${string}`,
    icon: React.ReactNode,
}

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