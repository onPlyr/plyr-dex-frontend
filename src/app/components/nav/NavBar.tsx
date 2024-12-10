import { ArrowSquareOut } from "@phosphor-icons/react/dist/ssr"
import Link from "next/link"

import AccountDetail from "@/app/components/account/AccountDetail"
import NavLogo from "@/app/components/nav/NavLogo"
import { navLinks } from "@/app/config/nav"
import { iconSizes } from "@/app/config/styling"

const NavBarLinks = () => {
    return (<>
        {navLinks.map((link, i) => (
            <Link
                key={i}
                href={link.disabled !== true ? link.path : ""}
                target={link.isExternal ? "_blank" : undefined}
                className="flex flex-row flex-1 h-full p-6 gap-3 justify-center items-center transition font-bold text-lg hover:text-brand-500"
            >
                {link.name}
                {link.isExternal && <ArrowSquareOut className={iconSizes.sm} />}
            </Link>
        ))}
    </>)
}

// todo: add collapsible/dropdown menu using listicon on small screens
export const NavBar = () => {
    return (
        <nav className="grid grid-cols-2 lg:grid-cols-3 flex flex-row flex-1 w-full justify-start items-center bg-transparent gap-6">
            <div className="col-span-1 flex flex-row flex-1 px-6 gap-6 justify-start items-center">
                <NavLogo />
                <div className="hidden md:flex lg:hidden">
                    <NavBarLinks />
                </div>
            </div>
            <div className="col-span-1 hidden lg:flex flex-row flex-1 w-full h-full justify-evenly items-center">
                <NavBarLinks />
            </div>
            <div className="col-span-1 flex flex-row flex-1 justify-end items-center">
                <AccountDetail />
            </div>
        </nav>
    )
}

export const NavBarFooter = () => {
    return (
        <nav className="flex flex-row flex-1 w-full justify-evenly items-center bg-transparent">
            {navLinks.map((link, i) => (
                <Link
                    key={i}
                    href={link.disabled !== true ? link.path : ""}
                    target={link.isExternal ? "_blank" : undefined}
                    className="flex flex-col flex-1 h-full p-4 gap-2 justify-center items-center transition font-bold hover:text-brand-500"
                >
                    {link.icon && link.icon}
                    <div className="flex flex-row flex-1 justify-center items-center gap-3">
                        {link.name}
                        {link.isExternal && <ArrowSquareOut className={iconSizes.sm} />}
                    </div>
                </Link>
            ))}
        </nav>
    )
}
