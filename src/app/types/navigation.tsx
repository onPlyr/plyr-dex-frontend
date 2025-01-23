import { SwapTab } from "@/app/config/pages"

export interface NavContextType {
    activeTab: SwapTab,
    previousTab: SwapTab | undefined,
    setTab: (tab: string) => void,
}

export interface SocialLink {
    id: Lowercase<string>,
    name: string,
    href: `https://${string}`,
    icon: React.ReactNode,
}
