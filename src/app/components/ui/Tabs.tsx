import { motion } from "motion/react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import React from "react"
import { twMerge } from "tailwind-merge"

export const TabsContainer = React.forwardRef<React.ComponentRef<typeof TabsPrimitive.Root>, React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root>>(({
    className,
    orientation = "horizontal",
    ...props
}, ref) => (
    <TabsPrimitive.Root
        ref={ref}
        className={twMerge("flex flex-col flex-none overflow-hidden", className)}
        orientation={orientation}
        {...props}
    />
))
TabsContainer.displayName = TabsPrimitive.Root.displayName

export const TabsList = React.forwardRef<React.ComponentRef<typeof TabsPrimitive.List>, React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>>(({
    className,
    ...props
}, ref) => (
    <TabsPrimitive.List
        ref={ref}
        className={twMerge("flex flex-row flex-1 h-fit", className)}
        {...props}
    />
))
TabsList.displayName = TabsPrimitive.List.displayName

export const TabIndicator = React.forwardRef<React.ComponentRef<typeof motion.div>, React.ComponentPropsWithoutRef<typeof motion.div>>(({
    className,
    layoutId,
    ...props
}, ref) => (
    <motion.div
        ref={ref}
        className={twMerge("tab-indicator", className)}
        layoutId={layoutId ?? "tabIndicator"}
        {...props}
    />
))
TabIndicator.displayName = "TabIndicator"

export const TabTrigger = React.forwardRef<React.ComponentRef<typeof TabsPrimitive.Trigger>, React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>>(({
    className,
    ...props
}, ref) => (
    <TabsPrimitive.Trigger
        ref={ref}
        className={twMerge("group tab", className)}
        {...props}
    />
))
TabTrigger.displayName = TabsPrimitive.Trigger.displayName

export const TabContent = React.forwardRef<React.ComponentRef<typeof TabsPrimitive.Content>, React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>>(({
    className,
    asChild = true,
    ...props
}, ref) => (
    <TabsPrimitive.Content
        ref={ref}
        className={twMerge("flex flex-col flex-none gap-4 w-full h-fit", className)}
        asChild={asChild}
        {...props}
    />
))
TabContent.displayName = TabsPrimitive.Content.displayName
