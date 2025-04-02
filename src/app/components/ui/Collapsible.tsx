"use client"
 
import { AnimatePresence } from "motion/react"
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible"
import React from "react"
import { useCallback, useState } from "react"
import { twMerge } from "tailwind-merge"

import Collapse from "@/app/components/animations/Collapse"
import ChevronIcon from "@/app/components/icons/ChevronIcon"
import { StyleDirection } from "@/app/types/styling"
import { AnimationDelays, AnimationTransitions, AnimationVariants } from "@/app/types/animations"

interface CollapsibleProps extends React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Root> {
    trigger: React.ReactNode,
    animations?: AnimationVariants,
    transitions?: AnimationTransitions,
    delays?: AnimationDelays,
    triggerProps?: CollapsibleTriggerProps,
    contentProps?: React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.CollapsibleContent>,
}

interface CollapsibleTriggerProps extends React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.CollapsibleTrigger> {
    isOpen?: boolean,
    iconClass?: string,
    replaceClass?: boolean,
}
 
const CollapsibleTrigger = React.forwardRef<React.ComponentRef<typeof CollapsiblePrimitive.CollapsibleTrigger>, CollapsibleTriggerProps>(({
    children,
    className,
    isOpen,
    iconClass,
    replaceClass,
    ...props
}, ref) => (
    <CollapsiblePrimitive.CollapsibleTrigger
        ref={ref}
        className={replaceClass ? className : twMerge("container-select flex flex-row flex-1 p-4 gap-4 font-bold justify-between items-center", className)}
        {...props}
    >
        {children}
        <ChevronIcon direction={isOpen ? StyleDirection.Up : StyleDirection.Down} className={iconClass} />
    </CollapsiblePrimitive.CollapsibleTrigger>
))
CollapsibleTrigger.displayName = CollapsiblePrimitive.CollapsibleTrigger.displayName

const CollapsibleContent = React.forwardRef<React.ComponentRef<typeof CollapsiblePrimitive.CollapsibleContent>, React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.CollapsibleContent>>(({
    className,
    forceMount = true,
    ...props
}, ref) => (
    <CollapsiblePrimitive.CollapsibleContent
        ref={ref}
        className={twMerge("flex flex-col flex-1 mt-4 gap-4", className)}
        forceMount={forceMount}
        {...props}
    />
))
CollapsibleContent.displayName = CollapsiblePrimitive.CollapsibleContent.displayName

const Collapsible = React.forwardRef<React.ComponentRef<typeof CollapsiblePrimitive.Root>, CollapsibleProps>(({
    children,
    className,
    open,
    trigger,
    animations,
    transitions,
    delays,
    triggerProps,
    contentProps,
    ...props
}, ref) => {

    const [isOpen, setIsOpenState] = useState<boolean>(open ? true : false)
    const setIsOpen = useCallback((open: boolean) => {
        setIsOpenState(open)
    }, [setIsOpenState])

    return (
        <CollapsiblePrimitive.Root
            ref={ref}
            className={twMerge("flex flex-col flex-none h-fit", className)}
            open={isOpen}
            onOpenChange={setIsOpen.bind(this, isOpen ? false : true)}
            {...props}
        >
            <CollapsibleTrigger isOpen={isOpen} {...triggerProps}>
                {trigger}
            </CollapsibleTrigger>
            <AnimatePresence mode="wait">
                {isOpen && (
                    <Collapse
                        animations={animations}
                        transitions={transitions}
                        delays={delays ?? {
                            exit: 0.2,
                        }}
                    >
                        <CollapsibleContent {...contentProps}>
                            {children}
                        </CollapsibleContent>
                    </Collapse>
                )}
            </AnimatePresence>
        </CollapsiblePrimitive.Root>
    )
})
Collapsible.displayName = CollapsiblePrimitive.Root.displayName

export default Collapsible
