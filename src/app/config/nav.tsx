import { NavLinkType } from "@/app/types/nav"
import { Book, Receipt, Swap } from "@phosphor-icons/react/dist/ssr"
import { iconSizes } from "@/app/config/styling"

export const navLinks: NavLinkType[] = [
    {
        name: "Swap",
        path: "/swap",
        icon: <Swap className={iconSizes.default} />,
    },
    {
        name: "Transactions",
        path: "/history",
        icon: <Receipt className={iconSizes.default} />,
    },
    {
        name: "Docs",
        path: "https://docs.tesseract.finance/",
        icon: <Book className={iconSizes.default} />,
        isExternal: true,
    },
]
