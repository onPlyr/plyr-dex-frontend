"use client"

import { AnimatePresence, Transition } from "motion/react"
import * as React from "react"
import { useCallback, useState } from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import { twMerge } from "tailwind-merge"

import ScaleInOut from "@/app/components/animations/ScaleInOut"
import { AnimationTransitions, AnimationVariants } from "@/app/types/animations"

interface TooltipProps extends React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Root> {
    trigger: React.ReactNode,
    triggerProps?: React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Trigger>,
    contentProps?: TooltipContentProps,
    portalProps?: React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Portal>,
}

interface TooltipContentProps extends React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content> {
    animations?: AnimationVariants,
    transitions?: AnimationTransitions,
    showArrow?: boolean,
}

const defaultTransition: Transition = {
    type: "spring",
    duration: 0.2,
}
const defaultTooltipTransitions: AnimationTransitions = {
    initial: defaultTransition,
    animate: defaultTransition,
    exit: defaultTransition,
}

export const TooltipProvider = ({
    delayDuration = 0,
    skipDelayDuration = 300,
    ...props
}: React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Provider>) => (
    <TooltipPrimitive.Provider
        delayDuration={delayDuration}
        skipDelayDuration={skipDelayDuration}
        {...props}
    />
)

const TooltipTrigger = React.forwardRef<React.ElementRef<typeof TooltipPrimitive.Trigger>, React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Trigger>>(({
    className,
    asChild = true,
    ...props
}, ref) => (
    <TooltipPrimitive.Trigger
        ref={ref}
        className={className}
        asChild={asChild}
        {...props}
    />
))
TooltipTrigger.displayName = TooltipPrimitive.Trigger.displayName

const TooltipPortal = ({
    forceMount = true,
    ...props
}: TooltipPrimitive.TooltipPortalProps) => (
    <TooltipPrimitive.Portal
        forceMount={forceMount}
        {...props}
    />
)
TooltipPortal.displayName = TooltipPrimitive.Portal.displayName

const TooltipArrow = React.forwardRef<React.ElementRef<typeof TooltipPrimitive.Arrow>, React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Arrow>>(({
    className,
    asChild,
    ...props
}, ref) => (
    <TooltipPrimitive.Arrow
        ref={ref}
        className={className}
        asChild={asChild}
        {...props}
    />
))
TooltipArrow.displayName = TooltipPrimitive.Arrow.displayName

const TooltipContent = React.forwardRef<React.ElementRef<typeof TooltipPrimitive.Content>, TooltipContentProps>(({
    children,
    className,
    asChild,
    forceMount = true,
    sticky = "always",
    collisionPadding = 16,
    animations,
    transitions = defaultTooltipTransitions,
    showArrow = false,
    ...props
}, ref) => (
    <TooltipPrimitive.Content
        ref={ref}
        className="z-[300] max-w-full sm:max-w-96 w-fit max-h-screen h-fit"
        asChild={asChild}
        forceMount={forceMount}
        sticky={sticky}
        collisionPadding={collisionPadding}
        {...props}
    >
        <ScaleInOut
            animations={animations}
            transitions={transitions}
            fadeInOut={true}
        >
            <div className={twMerge("tooltip-container flex flex-row flex-none overflow-hidden", className)}>
                {children}
                {showArrow && <TooltipArrow />}
            </div>
        </ScaleInOut>
    </TooltipPrimitive.Content>
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

export const Tooltip = ({
    children,
    open,
    defaultOpen,
    onOpenChange,
    trigger,
    triggerProps = {},
    contentProps = {},
    portalProps = {},
    ...props
}: TooltipProps) => {

    const [isOpen, setIsOpenState] = useState<boolean>((open || defaultOpen) ? true : false)
    const setIsOpen = useCallback((open: boolean) => {
        onOpenChange?.(open)
        setIsOpenState(open)
    }, [onOpenChange, setIsOpenState])

    return (
        <TooltipPrimitive.Root
            open={open}
            defaultOpen={defaultOpen}
            onOpenChange={setIsOpen}
            {...props}
        >
            <TooltipTrigger {...triggerProps}>
                {trigger}
            </TooltipTrigger>
            <TooltipPortal {...portalProps}>
                <AnimatePresence>
                    {isOpen && (
                        <TooltipContent {...contentProps}>
                            {children}
                        </TooltipContent>
                    )}
                </AnimatePresence>
            </TooltipPortal>
        </TooltipPrimitive.Root>
    )
}
Tooltip.displayName = "Tooltip"
