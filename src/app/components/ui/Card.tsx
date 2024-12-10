import * as React from "react"
import { twMerge } from "tailwind-merge"

export const CardHeader = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<"div">>(({
    className,
    ...props
}, ref) => (
    <div
        ref={ref}
        className={twMerge("flex flex-row flex-1 px-6 gap-4 justify-start items-center", className)}
        {...props}
    />
))
CardHeader.displayName = "CardHeader"

export const CardTitle = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<"div">>(({
    className,
    ...props
}, ref) => (
    <div
        ref={ref}
        className={twMerge("flex flex-row flex-1 gap-4 justify-start items-center font-bold text-xl", className)}
        {...props}
    />
))
CardTitle.displayName = "CardTitle"

export const CardActions = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<"div">>(({
    className,
    ...props
}, ref) => (
    <div
        ref={ref}
        className={twMerge("flex flex-row shrink gap-6 justify-end items-center", className)}
        {...props}
    />
))
CardActions.displayName = "CardActions"

export const CardContent = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<"div">>(({
    className,
    ...props
}, ref) => (
    <div
        ref={ref}
        className={twMerge("flex flex-col flex-1 h-fit px-6 pb-6 gap-4 rounded-lg overflow-auto", className)}
        {...props}
    />
))
CardContent.displayName = "CardContent"

export interface CardProps extends React.ComponentPropsWithoutRef<"div"> {
    borderClassName?: string,
    hideBorder?: boolean,
    glow?: boolean,
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(({
    className,
    borderClassName,
    hideBorder = false,
    glow = false,
    ...props
}, ref) => (
    <div className={twMerge(hideBorder ? "contents" : "gradient-border", borderClassName)}>
        <div
            ref={ref}
            className={twMerge("flex flex-col flex-1 h-fit pt-6 gap-6 rounded-lg transition overflow-hidden", hideBorder ? "bg-container-900" : "bg-container-900/90", className)}
            {...props}
        />
        {glow && <div className="gradient-glow" />}
    </div>
))
Card.displayName = "Card"
