"use client"

import * as ToastPrimitive from "@radix-ui/react-toast"
import * as React from "react"
import { twMerge } from "tailwind-merge"

import CloseIcon from "@/app/components/icons/CloseIcon"
import { iconSizes } from "@/app/config/styling"

export interface ToastProps extends React.ComponentPropsWithoutRef<typeof ToastPrimitive.Root> {
    header: React.ReactNode,
    description: React.ReactNode,
    action?: React.ReactElement<typeof ToastAction>,
    hideBorder?: boolean,
}

export const ToastProvider = ToastPrimitive.Provider

export const ToastViewport = React.forwardRef<React.ElementRef<typeof ToastPrimitive.Viewport>, React.ComponentPropsWithoutRef<typeof ToastPrimitive.Viewport>>(({
    className,
    ...props
}, ref) => (
    <ToastPrimitive.Viewport
        ref={ref}
        className={twMerge("z-[250] flex flex-col-reverse flex-1 fixed bottom-0 end-0 max-w-screen w-full max-h-screen h-fit p-6 gap-4 justify-end items-end transition", className)}
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
        className={twMerge("transition text-muted-400 hover:text-white hover:rotate-90", className)}
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
        className={twMerge("flex flex-row flex-1 gap-4 font-bold text-sm text-white", className)}
        {...props}
    >
        <div className="flex flex-row flex-1 justify-start items-start">
            {children}
        </div>
        <div className="flex flex-row shrink justify-center items-start">
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
        className={twMerge("flex flex-row flex-1 justify-start items-start text-sm text-muted-400", className)}
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

export const Toast = React.forwardRef<React.ElementRef<typeof ToastPrimitive.Root>, ToastProps>(({
    className,
    header,
    description,
    action,
    hideBorder,
    ...props
}, ref) => (
    <ToastPrimitive.Root
        ref={ref}
        className={twMerge(
            "transition overflow-hidden",
            "data-[state=open]:animate-in data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full",
            "data-[swipe=end]:animate-out data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)]",
            "data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none",
            "data-[swipe=cancel]:translate-x-0",
        )}
        {...props}
    >
        <div className={twMerge(hideBorder ? "contents" : "gradient-border")}>
            <div className={twMerge(
                "flex flex-col flex-1 relative p-4 gap-4 w-96 max-h-fit h-fit rounded-lg transition",
                hideBorder ? "bg-container-900" : "bg-container-900/90",
                className,
            )}>
                <ToastHeader>
                    {header}
                </ToastHeader>
                <div className="flex flex-row flex-1 gap-4">
                    <ToastDescription>
                        {description}
                    </ToastDescription>
                    {action && (
                        <div className="flex flex-row shrink justify-center items-center">
                            {action}
                        </div>
                    )}
                </div>
            </div>
        </div>
    </ToastPrimitive.Root>
))
Toast.displayName = ToastPrimitive.Root.displayName
