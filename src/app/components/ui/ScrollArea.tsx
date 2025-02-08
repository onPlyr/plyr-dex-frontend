"use client"
 
import React from "react"
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area"
import { twMerge } from "tailwind-merge"

interface ScrollAreaProps extends React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root> {
    orientation?: "vertical" | "horizontal",
}

const ScrollBar = React.forwardRef<React.ComponentRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>, React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>>(({
    className,
    orientation = "vertical",
    ...props
}, ref) => (
    <ScrollAreaPrimitive.ScrollAreaScrollbar
        ref={ref}
        orientation={orientation}
        className={twMerge(
            "flex touch-none select-none transition",
            orientation === "vertical" ? "h-full w-2.5 border-l border-l-transparent p-[1px]" : undefined,
            orientation === "horizontal" ? "h-2.5 flex-col border-t border-t-transparent p-[1px]" : undefined,
            className,
        )}
        {...props}
    >
        <ScrollAreaPrimitive.ScrollAreaThumb className="relative flex-1 rounded-full container-border-as-bg" />
    </ScrollAreaPrimitive.ScrollAreaScrollbar>
))
ScrollBar.displayName = "ScrollBar"

const ScrollArea = React.forwardRef<React.ComponentRef<typeof ScrollAreaPrimitive.Root>, ScrollAreaProps>(({
    children,
    className,
    orientation = "vertical",
    ...props
}, ref) => (
    <ScrollAreaPrimitive.Root
        ref={ref}
        className={twMerge("w-full relative overflow-hidden", className)}
        {...props}
    >
        <ScrollAreaPrimitive.Viewport className="w-full h-full rounded-[inherit]">
            {children}
        </ScrollAreaPrimitive.Viewport>
        <ScrollBar orientation={orientation} />
        <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
))
ScrollArea.displayName = "ScrollArea"

export default ScrollArea
