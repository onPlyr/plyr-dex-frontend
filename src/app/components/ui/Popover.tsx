"use client"
 
import { AnimatePresence } from "motion/react"
import React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"
import { twMerge } from "tailwind-merge"

import Collapse from "@/app/components/animations/Collapse"
import CloseIcon from "@/app/components/icons/CloseIcon"
import { AnimationDelays, AnimationTransitions, AnimationVariants } from "@/app/types/animations"

interface PopoverProps extends React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Root> {
    trigger: React.ReactNode,
    triggerProps?: React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Trigger>,
    contentProps?: React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>,
    portalProps?: React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Portal>,
    showClose?: boolean,
    animations?: AnimationVariants,
    transitions?: AnimationTransitions,
    delays?: AnimationDelays,
}

const PopoverTrigger = React.forwardRef<React.ComponentRef<typeof PopoverPrimitive.Trigger>, React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Trigger>>(({
    className,
    asChild,
    ...props
}, ref) => (
    <PopoverPrimitive.Trigger
        ref={ref}
        className={className}
        asChild={asChild}
        {...props}
    />
))
PopoverTrigger.displayName = PopoverPrimitive.Trigger.displayName

const PopoverPortal = ({
    forceMount = true,
    ...props
}: PopoverPrimitive.PopoverPortalProps) => (
    <PopoverPrimitive.Portal
        forceMount={forceMount}
        {...props}
    />
)
PopoverPortal.displayName = PopoverPrimitive.Portal.displayName

const PopoverClose = React.forwardRef<React.ComponentRef<typeof PopoverPrimitive.Close>, React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Close>>(({
    className,
    children,
    ...props
}, ref) => (
    <PopoverPrimitive.Close
        ref={ref}
        className={twMerge("absolute top-4 end-4 transition text-muted-500 hover:text-white", className)}
        {...props}
    >
        {children ?? <CloseIcon className="hover:rotate-90" />}
    </PopoverPrimitive.Close>
))
PopoverClose.displayName = PopoverPrimitive.Close.displayName

const PopoverContent = React.forwardRef<React.ComponentRef<typeof PopoverPrimitive.Content>, React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>>(({
    children,
    className,
    asChild,
    forceMount,
    sticky = "always",
    ...props
}, ref) => (
    <PopoverPrimitive.Content
        ref={ref}
        className="z-[300] p-4 w-screen sm:w-96 max-h-screen h-fit"
        asChild={asChild}
        forceMount={forceMount}
        sticky={sticky}
        {...props}
    >
        <div className={twMerge("popover-container relative flex flex-col flex-1 overflow-hidden", className)}>
            {children}
        </div>
    </PopoverPrimitive.Content>
))
PopoverContent.displayName = PopoverPrimitive.Content.displayName

const Popover = ({
    children,
    trigger,
    triggerProps = {},
    contentProps = {},
    portalProps = {},
    showClose = false,
    animations,
    transitions,
    delays,
    ...props
}: PopoverProps) => (
    <PopoverPrimitive.Root {...props}>
        <PopoverTrigger {...triggerProps}>
            {trigger}
        </PopoverTrigger>
        <PopoverPortal {...portalProps}>
            <AnimatePresence mode="wait">
                {props.open && (
                    <PopoverContent {...contentProps}>
                        <Collapse
                            animations={animations}
                            transitions={transitions}
                            delays={delays ?? {
                                exit: 0.2,
                            }}
                        >
                            {showClose && <PopoverClose />}
                            {children}
                        </Collapse>
                    </PopoverContent>
                )}
            </AnimatePresence>
        </PopoverPortal>
    </PopoverPrimitive.Root>
)
Popover.displayName = "Popover"

export default Popover
