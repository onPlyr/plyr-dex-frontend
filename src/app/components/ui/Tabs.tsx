import * as TabsPrimitive from "@radix-ui/react-tabs"
import * as React from "react"
import { twMerge } from "tailwind-merge"

export const TabsContainer = React.forwardRef<React.ElementRef<typeof TabsPrimitive.Root>, React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root>>(({
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

export const TabsList = React.forwardRef<React.ElementRef<typeof TabsPrimitive.List>, React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>>(({
    className,
    ...props
}, ref) => (
    <TabsPrimitive.List
        ref={ref}
        className={twMerge("flex flex-row flex-1 h-fit p-1 gap-[3px] rounded gradient-brand-bg animate-bg-wave running", className)}
        {...props}
    />
))
TabsList.displayName = TabsPrimitive.List.displayName

export const TabTrigger = React.forwardRef<React.ElementRef<typeof TabsPrimitive.Trigger>, React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>>(({
    className,
    ...props
}, ref) => (
    <TabsPrimitive.Trigger
        ref={ref}
        className={twMerge("tab", className)}
        {...props}
    />
))
TabTrigger.displayName = TabsPrimitive.Trigger.displayName

export const TabContent = React.forwardRef<React.ElementRef<typeof TabsPrimitive.Content>, React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>>(({
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
