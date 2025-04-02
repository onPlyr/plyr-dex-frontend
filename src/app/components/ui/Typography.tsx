import React from "react"
import { twMerge } from "tailwind-merge"

export const Bold = React.forwardRef<HTMLSpanElement, React.ComponentPropsWithoutRef<"span">>(({
    className,
    ...props
}, ref) => (
    <span
        ref={ref}
        className={twMerge("contents font-bold", className)}
        {...props}
    />
))
Bold.displayName = "Bold"
