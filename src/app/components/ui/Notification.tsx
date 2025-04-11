"use client"

import { AnimatePresence, motion } from "motion/react"
import { Portal } from "@radix-ui/react-portal"
import React, { useEffect } from "react"
import { twMerge } from "tailwind-merge"

import CloseIcon from "@/app/components/icons/CloseIcon"
import ErrorIcon from "@/app/components/icons/ErrorIcon"
import InfoIcon from "@/app/components/icons/InfoIcon"
import LoadingIcon from "@/app/components/icons/LoadingIcon"
import SuccessIcon from "@/app/components/icons/SuccessIcon"
import Button from "@/app/components/ui/Button"
import { DefaultNotificationRemoveDelay } from "@/app/config/notifications"
import { iconSizes } from "@/app/config/styling"
import useNotifications from "@/app/hooks/notifications/useNotifications"
import { Notification, NotificationStatus } from "@/app/types/notifications"

interface NotificationPortalProps extends React.ComponentPropsWithoutRef<typeof Portal> {
    animationProps?: React.ComponentPropsWithoutRef<typeof motion.div>,
}

interface NotificationIconProps extends React.ComponentPropsWithoutRef<"div"> {
    status: NotificationStatus,
    iconClass?: string,
}

interface NotificationHeaderProps extends React.ComponentPropsWithoutRef<"div"> {
    status: NotificationStatus,
}

interface NotificationContentProps extends React.ComponentPropsWithoutRef<"div"> {
    notification: Notification,
    container: Element | DocumentFragment | null | undefined,
    portalProps?: NotificationPortalProps,
    animationProps?: React.ComponentPropsWithoutRef<typeof motion.div>,
    iconProps?: NotificationIconProps,
    headerProps?: NotificationHeaderProps,
    closeProps?: React.ComponentPropsWithoutRef<"div">,
    bodyProps?: React.ComponentPropsWithoutRef<"div">,
    actionProps?: React.ComponentPropsWithoutRef<"div">,
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
    className,
    initial = "initial",
    animate = "animate",
    exit = "exit",
    layout = true,
    transition = {
        type: "spring",
        duration: 0.4,
    },
    variants = {
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
    },
    ...props
}, ref) => (
    <motion.div
        ref={ref}
        className={twMerge("w-full max-h-fit", className)}
        initial={initial}
        animate={animate}
        exit={exit}
        layout={layout}
        transition={transition}
        variants={variants}
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
    iconClass = iconSizes.sm,
    ...props
}, ref) => (
    <div
        ref={ref}
        className={twMerge("flex flex-row flex-none justify-center items-center", className)}
        {...props}
    >
        {status === NotificationStatus.Success ? (
            <SuccessIcon className={iconClass} highlight={true} />
        ) : status === NotificationStatus.Error ? (
            <ErrorIcon className={iconClass} highlight={true} />
        ) : status === NotificationStatus.Info ? (
            <InfoIcon className={iconClass} highlight={true} />
        ) : (
            <LoadingIcon className={iconClass} highlight={true} />
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
            status === NotificationStatus.Error ? "text-error-500" : status === NotificationStatus.Success ? "text-success-500" : status === NotificationStatus.Info ? "text-info-500" : "text-white",
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

export const NotificationAction = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<"div">>(({
    className,
    ...props
}, ref) => (
    <div
        ref={ref}
        className={twMerge("flex flex-col flex-1", className)}
        {...props}
    />
))
NotificationAction.displayName = "NotificationAction"

export const NotificationContentAnimation = React.forwardRef<React.ComponentRef<typeof motion.div>, React.ComponentPropsWithoutRef<typeof motion.div>>(({
    className,
    initial = "initial",
    animate = "animate",
    exit = "exit",
    transition = {
        type: "tween",
        duration: 0.2,
        ease: "easeInOut",
    },
    variants = {
        initial: {
            y: "10%",
            opacity: 0,
            filter: "blur(4px)",
        },
        animate: {
            y: 0,
            opacity: 1,
            filter: "blur(0px)",
        },
        exit: {
            y: "10%",
            opacity: 0,
            filter: "blur(4px)",
        },
    },
    ...props
}, ref) => (
    <motion.div
        ref={ref}
        className={twMerge("flex flex-col flex-1 gap-4", className)}
        initial={initial}
        animate={animate}
        exit={exit}
        transition={transition}
        variants={variants}
        {...props}
    />
))
NotificationContentAnimation.displayName = "NotificationContentAnimation"

export const NotificationContent = React.forwardRef<HTMLDivElement, NotificationContentProps>(({
    className,
    notification,
    container,
    portalProps,
    animationProps,
    iconProps,
    headerProps,
    closeProps,
    bodyProps,
    actionProps,
    ...props
}, ref) => {

    const { removeNotification } = useNotifications()
    const removeDelay = Math.abs(notification.removeDelayMs ?? DefaultNotificationRemoveDelay[notification.status])

    useEffect(() => {

        const timeoutId = notification.status !== NotificationStatus.Pending && !notification.isManualDismiss ? setTimeout(() => {
            removeNotification(notification.id)
        }, removeDelay) : undefined

        return () => clearTimeout(timeoutId)

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [notification.status])

    return (
        <NotificationPortal
            key={notification.id}
            container={container}
            {...portalProps}
        >
            <div
                ref={ref}
                className={twMerge("container flex flex-col flex-1 p-4 gap-4 w-full max-h-fit overflow-hidden", className)}
                {...props}
            >
                <AnimatePresence mode="wait">
                    <NotificationContentAnimation
                        key={`${notification.type}-${notification.header?.toString() || notification.status}`}
                        {...animationProps}
                    >
                        <div className="flex flex-col flex-1 gap-2">
                            <div className="flex flex-row flex-1 gap-4 items-center">
                                <NotificationIcon
                                    status={notification.status}
                                    {...iconProps}
                                />
                                <NotificationHeader
                                    status={notification.status}
                                    {...headerProps}
                                >
                                    {notification.header}
                                </NotificationHeader>
                                <NotificationClose
                                    onClick={removeNotification.bind(this, notification.id)}
                                    {...closeProps}
                                />
                            </div>
                            <NotificationBody {...bodyProps}>
                                {notification.body}
                            </NotificationBody>
                        </div>
                        {notification.action && (
                            <NotificationAction {...actionProps}>
                                {notification.action}
                            </NotificationAction>
                        )}
                    </NotificationContentAnimation>
                </AnimatePresence>
            </div>
        </NotificationPortal>
    )
})
NotificationContent.displayName = "NotificationContent"