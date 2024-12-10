import * as React from "react"
import { twMerge } from "tailwind-merge"

const Badge = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<"div">>(({
    children,
    className,
    ...props
}, ref) => (
    <div
        ref={ref}
        className={twMerge("badge", className)}
        {...props}
    >
        {children}
    </div>
))
Badge.displayName = "Badge"

export default Badge
