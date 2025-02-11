"use client"

import { motion, Transition, Variants } from "motion/react"
import { Portal } from "@radix-ui/react-portal"
import React, { useEffect } from "react"
import { twMerge } from "tailwind-merge"

import CloseIcon from "@/app/components/icons/CloseIcon"
import ErrorIcon from "@/app/components/icons/ErrorIcon"
import LoadingIcon from "@/app/components/icons/LoadingIcon"
import SuccessIcon from "@/app/components/icons/SuccessIcon"
import Button from "@/app/components/ui/Button"
import { DefaultNotificationRemoveDelayMs } from "@/app/config/notifications"
import { iconSizes } from "@/app/config/styling"
import useNotifications from "@/app/hooks/notifications/useNotifications"
import { Notification, NotificationStatus } from "@/app/types/notifications"

interface NotificationPortalProps extends React.ComponentPropsWithoutRef<typeof Portal> {
    animationProps?: React.ComponentPropsWithoutRef<typeof motion.div>,
}

interface NotificationIconProps extends React.ComponentPropsWithoutRef<"div"> {
    status: NotificationStatus,
}

interface NotificationHeaderProps extends React.ComponentPropsWithoutRef<"div"> {
    status: NotificationStatus,
}

interface NotificationContentProps extends React.ComponentPropsWithoutRef<"div"> {
    notification: Notification,
    container: Element | DocumentFragment | null | undefined,
    removeDelayMs?: number,
    portalProps?: NotificationPortalProps,
    animationProps?: React.ComponentPropsWithoutRef<typeof motion.div>,
    iconProps?: NotificationIconProps,
    headerProps?: NotificationHeaderProps,
    closeProps?: React.ComponentPropsWithoutRef<"div">,
    bodyProps?: React.ComponentPropsWithoutRef<"div">,
}

const defaultTransition: Transition = {
    type: "spring",
    duration: 0.4,
}

const defaultPortalAnimations: Variants = {
    initial: {
        y: "50%",
        opacity: 0,
        height: 0,
    },
    animate: {
        y: 0,
        opacity: 1,
        height: "auto",
    },
    exit: {
        y: "50%",
        opacity: 0,
        height: 0,
    },
}

const defaultContentAnimations: Variants = {
    initial: {
        y: "50%",
        opacity: 0,
    },
    animate: {
        y: 0,
        opacity: 1,
    },
    exit: {
        y: "-50%",
        opacity: 0,
    },
}

export const NotificationContainer = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<"div">>(({
    className,
    ...props
}, ref) => (
    <div
        ref={ref}
        className={twMerge("z-[250] flex flex-col-reverse flex-1 fixed bottom-0 end-0 max-w-screen sm:max-w-96 w-full max-h-screen h-fit p-4 gap-4 justify-end items-end", className)}
        {...props}
    />
))
NotificationContainer.displayName = "NotificationContainer"

export const NotificationPortalAnimation = React.forwardRef<React.ComponentRef<typeof motion.div>, React.ComponentPropsWithoutRef<typeof motion.div>>(({
    initial = "initial",
    animate = "animate",
    exit = "exit",
    transition = defaultTransition,
    variants = defaultPortalAnimations,
    layout = true,
    className,
    ...props
}, ref) => (
    <motion.div
        ref={ref}
        initial={initial}
        animate={animate}
        exit={exit}
        transition={transition}
        layout={layout}
        variants={variants}
        className={twMerge("w-full max-h-fit", className)}
        {...props}
    />
))
NotificationPortalAnimation.displayName = "NotificationPortalAnimation"

export const NotificationPortal = React.forwardRef<React.ComponentRef<typeof Portal>, NotificationPortalProps>(({
    children,
    asChild = true,
    container,
    animationProps,
    ...props
}, ref) => (
    <Portal
        ref={ref}
        asChild={asChild}
        container={container}
        {...props}
    >
        <NotificationPortalAnimation {...animationProps}>
            {children}
        </NotificationPortalAnimation>
    </Portal>
))
NotificationPortal.displayName = "NotificationPortal"

export const NotificationClose = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<"div">>(({
    children,
    className,
    ...props
}, ref) => (
    <div
        ref={ref}
        className={twMerge("flex flex-row flex-none justify-end items-start", className)}
        {...props}
    >
        {children ?? (
            <Button
                label="Close"
                className="icon-btn transition hover:rotate-180"
                replaceClass={true}
            >
                <CloseIcon className={iconSizes.sm} />
            </Button>
        )}
    </div>
))
NotificationClose.displayName = "NotificationClose"

export const NotificationIcon = React.forwardRef<HTMLDivElement, NotificationIconProps>(({
    className,
    status,
    ...props
}, ref) => (
    <div
        ref={ref}
        className={twMerge("flex flex-row flex-none justify-center items-center", className)}
        {...props}
    >
        {status === NotificationStatus.Success ? (
            <SuccessIcon highlight={true} />
        ) : status === NotificationStatus.Error ? (
            <ErrorIcon highlight={true} />
        ) : (
            <LoadingIcon highlight={true} />
        )}
    </div>
))
NotificationIcon.displayName = "NotificationIcon"

export const NotificationHeader = React.forwardRef<HTMLDivElement, NotificationHeaderProps>(({
    className,
    status,
    ...props
}, ref) => (
    <div
        ref={ref}
        className={twMerge(
            "flex flex-row flex-1 justify-start items-center font-bold",
            status === NotificationStatus.Error ? "text-error-500" : status === NotificationStatus.Success ? "text-success-500" : "text-white",
            className,
        )}
        {...props}
    />
))
NotificationHeader.displayName = "NotificationHeader"

export const NotificationBody = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<"div">>(({
    className,
    ...props
}, ref) => (
    <div
        ref={ref}
        className={twMerge("flex flex-col flex-1", className)}
        {...props}
    />
))
NotificationBody.displayName = "NotificationBody"

export const NotificationContentAnimation = React.forwardRef<React.ComponentRef<typeof motion.div>, React.ComponentPropsWithoutRef<typeof motion.div>>(({
    initial = "initial",
    animate = "animate",
    exit = "exit",
    transition = defaultTransition,
    variants = defaultContentAnimations,
    className,
    ...props
}, ref) => (
    <motion.div
        ref={ref}
        initial={initial}
        animate={animate}
        exit={exit}
        transition={transition}
        variants={variants}
        className={twMerge("flex flex-row flex-1 gap-4", className)}
        {...props}
    />
))
NotificationContentAnimation.displayName = "NotificationContentAnimation"

export const NotificationContent = React.forwardRef<HTMLDivElement, NotificationContentProps>(({
    className,
    notification,
    container,
    removeDelayMs,
    portalProps,
    animationProps,
    iconProps,
    headerProps,
    closeProps,
    bodyProps,
    ...props
}, ref) => {

    const { removeNotification } = useNotifications()
    const removeDelay = Math.abs(removeDelayMs ?? DefaultNotificationRemoveDelayMs)

    useEffect(() => {

        const timeoutId = notification.status !== NotificationStatus.Pending ? setTimeout(() => {
            removeNotification(notification.id)
        }, removeDelay) : undefined

        return () => {
            clearTimeout(timeoutId)
        }
    }, [notification.status])

    return (
        <NotificationPortal
            container={container}
            {...portalProps}
        >
            <div
                ref={ref}
                className={twMerge("container flex flex-col flex-1 p-4 gap-4 w-full max-h-fit overflow-hidden", className)}
                {...props}
            >
                <NotificationContentAnimation
                    key={notification.type}
                    {...animationProps}
                >
                    <NotificationIcon
                        {...iconProps}
                        status={notification.status}
                    />
                    <div className="flex flex-col flex-1 gap-1">
                        <div className="flex flex-row flex-1 gap-4">
                            <NotificationHeader
                                {...headerProps}
                                status={notification.status}
                            >
                                {notification.header}
                            </NotificationHeader>
                            <NotificationClose
                                {...closeProps}
                                onClick={removeNotification.bind(this, notification.id)}
                            />
                        </div>
                        <NotificationBody {...bodyProps}>
                            {notification.body}
                        </NotificationBody>
                    </div>
                </NotificationContentAnimation>
            </div>
        </NotificationPortal>
    )
})
NotificationContent.displayName = "NotificationContent"