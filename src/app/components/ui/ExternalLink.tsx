import Link from "next/link"
import * as React from "react"
import { twMerge } from "tailwind-merge"

import ExternalLinkIcon from "@/app/components/icons/ExternalLinkIcon"
import { iconSizes } from "@/app/config/styling"
import { StyleSize } from "@/app/types/styling"

interface ExternalLinkProps extends React.ComponentPropsWithoutRef<typeof Link> {
    iconSize?: StyleSize,
    hideIcon?: boolean,
    stopPropagation?: boolean,
    replaceClass?: boolean,
}

const ExternalLink = React.forwardRef<React.ElementRef<typeof Link>, ExternalLinkProps>(({
    children,
    className,
    iconSize,
    hideIcon,
    stopPropagation,
    replaceClass,
    target,
    ...props
}, ref) => (
    <Link
        ref={ref}
        className={replaceClass ? className : twMerge("inline-flex flex-row items-center gap-2 transition text-muted-500 hover:text-link-500", className)}
        onClick={stopPropagation ? (e) => e.stopPropagation() : undefined}
        target={target || "_blank"}
        {...props}
    >
        {children}
        {hideIcon !== true && <ExternalLinkIcon className={iconSize ? iconSizes[iconSize] : iconSizes.default} />}
    </Link>
))
ExternalLink.displayName = "ExternalLink"

export default ExternalLink
