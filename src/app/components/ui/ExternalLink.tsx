import Link from "next/link"
import React from "react"
import { twMerge } from "tailwind-merge"

import ExternalLinkIcon from "@/app/components/icons/ExternalLinkIcon"
import { iconSizes } from "@/app/config/styling"
import { DefaultLinkProps } from "@/app/config/urls"
import { StyleSize } from "@/app/types/styling"

interface ExternalLinkProps extends React.ComponentPropsWithoutRef<typeof Link> {
    iconSize?: StyleSize,
    hideIcon?: boolean,
    stopPropagation?: boolean,
    replaceClass?: boolean,
}

const ExternalLink = React.forwardRef<React.ComponentRef<typeof Link>, ExternalLinkProps>(({
    children,
    className,
    iconSize,
    hideIcon,
    stopPropagation,
    replaceClass,
    target = DefaultLinkProps.Target,
    rel = DefaultLinkProps.Rel,
    ...props
}, ref) => (
    <Link
        ref={ref}
        className={replaceClass ? className : twMerge("inline-flex flex-row items-center gap-2 transition text-muted-500 hover:text-link-500", className)}
        onClick={stopPropagation ? (e) => e.stopPropagation() : undefined}
        target={target || DefaultLinkProps.Target}
        rel={rel || DefaultLinkProps.Rel}
        {...props}
    >
        {children}
        {hideIcon !== true && <ExternalLinkIcon className={iconSize ? iconSizes[iconSize] : iconSizes.default} />}
    </Link>
))
ExternalLink.displayName = "ExternalLink"

export default ExternalLink
