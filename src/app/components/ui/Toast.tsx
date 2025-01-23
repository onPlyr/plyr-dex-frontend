"use client"

import * as ToastPrimitive from "@radix-ui/react-toast"
import * as React from "react"
import { twMerge } from "tailwind-merge"

import SlideInOut from "@/app/components/animations/SlideInOut"
import CloseIcon from "@/app/components/icons/CloseIcon"
import { iconSizes } from "@/app/config/styling"
import { AnimationDelays, AnimationTransitions, AnimationVariants } from "@/app/types/animations"

export interface ToastData extends React.ComponentPropsWithoutRef<typeof ToastPrimitive.Root> {
    id?: string,
    header: React.ReactNode,
    description: React.ReactNode,
    action?: React.ReactElement<typeof ToastAction>,
    animations?: AnimationVariants,
    transitions?: AnimationTransitions,
    delays?: AnimationDelays,
}

export const RadixToastProvider = ToastPrimitive.Provider

export const ToastViewport = React.forwardRef<React.ElementRef<typeof ToastPrimitive.Viewport>, React.ComponentPropsWithoutRef<typeof ToastPrimitive.Viewport>>(({
    className,
    ...props
}, ref) => (
    <ToastPrimitive.Viewport
        ref={ref}
        className={twMerge("z-[250] flex flex-col-reverse flex-1 fixed bottom-0 end-0 max-w-screen sm:max-w-96 w-full max-h-screen h-fit p-4 gap-4 justify-end items-end", className)}
        {...props}
    />
))
ToastViewport.displayName = ToastPrimitive.Viewport.displayName

export const ToastClose = React.forwardRef<React.ElementRef<typeof ToastPrimitive.Close>, React.ComponentPropsWithoutRef<typeof ToastPrimitive.Close>>(({
    children,
    className,
    ...props
}, ref) => (
    <ToastPrimitive.Close
        ref={ref}
        className={twMerge("transition text-muted-500 hover:text-white hover:rotate-90", className)}
        {...props}
    >
        {children ?? <CloseIcon className={iconSizes.sm} />}
    </ToastPrimitive.Close>
))
ToastClose.displayName = ToastPrimitive.Close.displayName

export const ToastHeader = React.forwardRef<React.ElementRef<typeof ToastPrimitive.Title>, React.ComponentPropsWithoutRef<typeof ToastPrimitive.Title>>(({
    className,
    children,
    ...props
}, ref) => (
    <ToastPrimitive.Title
        ref={ref}
        className={twMerge("flex flex-row flex-1 gap-4 justify-between font-bold text-white", className)}
        {...props}
    >
        <div className="flex flex-row flex-1 gap-4 justify-start items-center">
            {children}
        </div>
        <div className="flex flex-row flex-none justify-end items-start">
            <ToastClose />
        </div>
    </ToastPrimitive.Title>
))
ToastHeader.displayName = ToastPrimitive.Title.displayName

export const ToastDescription = React.forwardRef<React.ElementRef<typeof ToastPrimitive.Description>, React.ComponentPropsWithoutRef<typeof ToastPrimitive.Description>>(({
    className,
    ...props
}, ref) => (
    <ToastPrimitive.Description
        ref={ref}
        className={twMerge("flex flex-col flex-1 justify-start items-start", className)}
        {...props}
    />
))
ToastDescription.displayName = ToastPrimitive.Description.displayName

export const ToastAction = React.forwardRef<React.ElementRef<typeof ToastPrimitive.Action>, React.ComponentPropsWithoutRef<typeof ToastPrimitive.Action>>(({
    className,
    asChild = true,
    ...props
}, ref) => (
    <ToastPrimitive.Action
        ref={ref}
        className={className}
        asChild={asChild}
        {...props}
    />
))
ToastAction.displayName = ToastPrimitive.Action.displayName

export const Toast = React.forwardRef<React.ElementRef<typeof ToastPrimitive.Root>, ToastData>(({
    className,
    forceMount = true,
    asChild = true,
    header,
    description,
    action,
    animations,
    transitions,
    delays,
    ...props
}, ref) => {
    return (
        <ToastPrimitive.Root
            ref={ref}
            className={twMerge(
                "bg-black flex flex-col flex-1 relative p-4 gap-4 w-full max-h-fit h-fit rounded overflow-hidden",
                // "data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom-full",
                // "data-[state=closed]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full",
                // "data-[swipe=end]:animate-out data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)]",
                // "data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none",
                // "data-[swipe=cancel]:translate-x-0",
                className,
            )}
            forceMount={forceMount}
            asChild={asChild}
            data-selected={true}
            {...props}
        >
            <SlideInOut
                from="right"
                to="right"
                animations={animations}
                transitions={transitions}
                delays={delays}
            >
                <ToastHeader>
                    {header}
                    {action && action}
                </ToastHeader>
                <ToastDescription>
                    {description}
                </ToastDescription>
            </SlideInOut>
        </ToastPrimitive.Root>
    )
})
Toast.displayName = ToastPrimitive.Root.displayName
