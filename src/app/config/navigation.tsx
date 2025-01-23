import { Article, DiscordLogo, GithubLogo, XLogo } from "@phosphor-icons/react/dist/ssr"

import { SocialLink } from "@/app/types/navigation"

export const socialLinks: SocialLink[] = [
    {
        id: "twitter",
        name: "X / Twitter",
        href: "https://x.com/Tesseract_avax",
        icon: <XLogo className="w-full h-full" />,
    },
    {
        id: "discord",
        name: "Discord",
        href: "https://discord.gg/44MRN24ksj",
        icon: <DiscordLogo className="w-full h-full" />,
    },
    {
        id: "github",
        name: "GitHub",
        href: "https://github.com/tesseract-protocol",
        icon: <GithubLogo className="w-full h-full" />,
    },
    {
        id: "blog",
        name: "Blog",
        href: "https://blog.tesseract.finance/",
        icon: <Article className="w-full h-full" />,
    },
]
