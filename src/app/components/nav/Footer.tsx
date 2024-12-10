import Link from "next/link"
import { DiscordLogo, GithubLogo, XLogo } from "@phosphor-icons/react/dist/ssr"

const SocialLink = ({
    link,
    children,
}: {
    link: `https://${string}`,
    children: React.ReactNode,
}) => (
    <Link
        href={link}
        target="_blank"
        className="flex flex-row p-3 w-12 h-12 justify-center items-center rounded-full bg-white text-black"
    >
        {children}
    </Link>
)

// todo: tbc
const Footer = () => {
    return (
        <div className="flex flex-row flex-1 w-full p-6 gap-6 justify-start items-center bg-transparent">
            <div className="flex flex-row flex-1 gap-6 justify-end">
                <SocialLink link="https://x.com/Tesseract_avax">
                    {<XLogo className="w-full h-full" />}
                </SocialLink>
                <SocialLink link="https://discord.gg/44MRN24ksj">
                    {<DiscordLogo className="w-full h-full" />}
                </SocialLink>
                <SocialLink link="https://github.com/tesseract-protocol">
                    {<GithubLogo className="w-full h-full" />}
                </SocialLink>
            </div>
        </div>
    )
}

export default Footer
