import { motion } from "motion/react"
import React from "react"
import { twMerge } from "tailwind-merge"

import SlideInOut from "@/app/components/animations/SlideInOut"
import ExternalLinkIcon from "@/app/components/icons/ExternalLinkIcon"
import ExternalLink from "@/app/components/ui/ExternalLink"
import { iconSizes } from "@/app/config/styling"
import { AnimationDelays } from "@/app/types/animations"
import Link from "next/link"

interface AccountMenuItemProps extends React.ComponentPropsWithoutRef<typeof motion.div> {
    icon?: React.ReactNode,
    iconClass?: string,
    contentClass?: string,
    url?: `/${string}`,
    externalUrl?: `https://${string}`,
    idx: number,
    numItems: number,
}

const AccountMenuItem = React.forwardRef<React.ComponentRef<typeof motion.div>, AccountMenuItemProps>(({
    children,
    className,
    icon,
    iconClass,
    contentClass,
    onClick,
    url,
    externalUrl,
    idx,
    numItems,
    ...props
}, ref) => {

    const delays: AnimationDelays = {
        animate: idx * 0.05,
        exit: (numItems - 1 - idx) * 0.05,
    }

    const content = <SlideInOut
        ref={ref}
        from="right"
        to="right"
        delays={delays}
        className={twMerge("group flex flex-row flex-1 p-4 gap-4 transition bg-transparent hover:container-bg-hover", onClick || url || externalUrl ? "cursor-pointer" : "cursor-auto", className)}
        onClick={onClick?.bind(this)}
        {...props}
    >
        {icon && (
            <div className={twMerge("flex flex-row flex-none justify-center items-center", iconClass)}>
                {icon}
            </div>
        )}
        <div className={twMerge("flex flex-row flex-1 flex-wrap", contentClass)}>
            {children as React.ReactNode}
        </div>
        {externalUrl && (
            <div className="flex flex-row flex-none justify-center items-center transition text-muted-500 group-hover:text-white">
                <ExternalLinkIcon className={iconSizes.sm} />
            </div>
        )}
    </SlideInOut>

    return url ? (
        <Link href={url}>
            {content}
        </Link>
    ) : externalUrl ? (
        <ExternalLink
            href={externalUrl}
            className="contents"
            replaceClass={true}
            hideIcon={true}
        >
            {content}
        </ExternalLink>
    ) : content
})
AccountMenuItem.displayName = "AccountMenuItem"

export default AccountMenuItem
