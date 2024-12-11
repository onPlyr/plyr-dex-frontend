import * as DialogPrimitive from "@radix-ui/react-dialog"
import * as React from "react"
import { twMerge } from "tailwind-merge"

import CloseIcon from "@/app/components/icons/CloseIcon"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/Card"
import { StyleSide } from "@/app/types/styling"

export interface DialogProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Root> {
    trigger: React.ReactNode,
    header: React.ReactNode,
    description?: React.ReactNode,
    footer?: React.ReactNode,
    side?: StyleSide,
    className?: string,
    disabled?: boolean,
    contentProps?: DialogContentProps,
    preventOutsideClose?: boolean,
}

export interface DialogCloseProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Close> {
    ariaLabel?: string,
}

export interface DialogContentProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
    header: React.ReactNode,
    description?: React.ReactNode,
    footer?: React.ReactNode,
    side?: StyleSide,
    preventOutsideClose?: boolean,
}

const defaultDialogMaxDimensions = "w-full max-w-full md:max-w-screen-md lg:max-w-screen-md h-fit max-h-[90vh]"
const dialogSideMaxDimensions: Record<StyleSide, string> = {
    "left": "w-full max-w-full md:max-w-screen-sm h-full",
    "right": "w-full max-w-full md:max-w-screen-sm h-full",
    "top": "w-full max-h-[80vh]",
    "bottom": "w-full max-h-[80vh]",
}
const dialogSideStyles: Record<StyleSide, string> = {
    "left": twMerge(dialogSideMaxDimensions.left, "inset-y-0 left-0 animate-slide-in-out-left"),
    "right": twMerge(dialogSideMaxDimensions.right, "inset-y-0 right-0 animate-slide-in-out-right"),
    "top": twMerge(dialogSideMaxDimensions.top, "inset-x-0 top-0 animate-slide-in-out-top"),
    "bottom": twMerge(dialogSideMaxDimensions.bottom, "inset-x-0 bottom-0 animate-slide-in-out-bottom"),
}

export const DialogTrigger = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Trigger>, React.ComponentPropsWithoutRef<typeof DialogPrimitive.Trigger>>(({
    className,
    asChild = true,
    disabled = false,
    ...props
}, ref) => (
    <DialogPrimitive.Trigger
        ref={ref}
        className={twMerge("flex flex-row flex-initial", disabled ? "cursor-not-allowed" : "cursor-pointer", className)}
        asChild={asChild}
        {...props}
    />
))
DialogTrigger.displayName = DialogPrimitive.Trigger.displayName

export const DialogClose = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Close>, DialogCloseProps>(({
    children,
    className,
    ariaLabel = "Close",
    ...props
}, ref) => (
    <DialogPrimitive.Close
        ref={ref}
        className={twMerge("z-[200] absolute top-6 end-6 transition zoom-in-105 text-muted-400 hover:text-white hover:rotate-90", className)}
        aria-label={ariaLabel}
        {...props}
    >
        {children ?? <CloseIcon className="w-8 h-8"/>}
    </DialogPrimitive.Close>
))
DialogClose.displayName = DialogPrimitive.Close.displayName

export const DialogOverlay = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Overlay>, React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>>(({
    className,
    ...props
}, ref) => (
    <DialogPrimitive.Overlay
        ref={ref}
        className={twMerge("z-[100] fixed inset-0 transition bg-black/80 backdrop-blur-3xl animate-fade-in-out", className)}
        {...props}
    />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

export const DialogHeader = React.forwardRef<React.ElementRef<typeof CardHeader>, React.ComponentPropsWithoutRef<typeof CardHeader>>(({
    className,
    ...props
}, ref) => (
    <CardHeader
        ref={ref}
        className={twMerge("flex-initial", className)}
        {...props}
    />
))
DialogHeader.displayName = "DialogHeader"

export const DialogTitle = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Title>, React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>>(({
    children,
    className,
    asChild = true,
    ...props
}, ref) => (
    <DialogPrimitive.Title
        ref={ref}
        className={asChild ? undefined : className}
        asChild={asChild}
        {...props}
    >
        <CardTitle className={twMerge("justify-center", asChild ? className : undefined)}>
            {children}
        </CardTitle>
    </DialogPrimitive.Title>
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

export const DialogDescription = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Description>, React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>>(({
    className,
    ...props
}, ref) => (
    <DialogPrimitive.Description
        ref={ref}
        className={twMerge("hidden", className)}
        {...props}
    />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

export const DialogFooter = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<"div">>(({
    className,
    ...props
}, ref) => (
    <div
        ref={ref}
        className={twMerge("flex flex-row flex-1 px-6 gap-4 justify-start items-center", className)}
        {...props}
    />
))
DialogFooter.displayName = "DialogFooter"

export const DialogContent = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Content>, DialogContentProps>(({
    children,
    className,
    header,
    description,
    footer,
    side,
    preventOutsideClose = false,
    asChild = true,
    onOpenAutoFocus = (e) => e.preventDefault(),
    onCloseAutoFocus = (e) => e.preventDefault(),
    "aria-describedby": ariaDescribedBy,
    ...props
}, ref) => (

    
        <DialogPrimitive.Content
            ref={ref}
            asChild={asChild}
            onOpenAutoFocus={onOpenAutoFocus}
            onCloseAutoFocus={onCloseAutoFocus}
            onPointerDownOutside={preventOutsideClose ? (e) => e.preventDefault() : undefined}
            onInteractOutside={preventOutsideClose ? (e) => e.preventDefault() : undefined}
            aria-describedby={description ? ariaDescribedBy : undefined}
            {...props}
        >
            <div
                className={twMerge(
                    "z-[150] fixed transition px-6",
                    side ? dialogSideStyles[side] : twMerge(
                        "md:px-0 left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] animate-fade-zoom-slide-in-out",
                        defaultDialogMaxDimensions,
                    ),
                )}
            >
                <Card
                    className={twMerge("gradient-border-neon pb-6", side ? dialogSideMaxDimensions[side] : defaultDialogMaxDimensions, className)}
                    borderClassName="h-full"
                    glow={true}
                >
                    <DialogClose className="mr-6 md:mr-0"/>
                    <DialogHeader>
                        <DialogTitle>
                            {header}
                        </DialogTitle>
                        {description && (
                            <DialogDescription>
                                {description}
                            </DialogDescription>
                        )}
                    </DialogHeader>
                    <CardContent className="pb-0 flex-initial">
                        {children}
                    </CardContent>
                    {footer && (
                        <DialogFooter>
                            {footer}
                        </DialogFooter>
                    )}
                </Card>
            </div>
        </DialogPrimitive.Content>
    
))
DialogContent.displayName = DialogPrimitive.Content.displayName

export const Dialog = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Root>, DialogProps>(({
    children,
    trigger,
    header,
    description,
    footer,
    side,
    preventOutsideClose = false,
    className,
    disabled = false,
    contentProps,
    ...props
}, ref) => (
    <DialogPrimitive.Root {...props}>
        <DialogTrigger disabled={disabled}>
            {trigger}
        </DialogTrigger>
        <DialogPrimitive.Portal>
            <DialogOverlay />
            <DialogContent
                ref={ref}
                header={header}
                description={description}
                footer={footer}
                className={className}
                side={side}
                preventOutsideClose={preventOutsideClose}
                {...contentProps}
            >
                {children}
            </DialogContent>
        </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
))
Dialog.displayName = DialogPrimitive.Root.displayName
