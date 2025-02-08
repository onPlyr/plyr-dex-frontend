"use client"

import { Portal } from "@radix-ui/react-portal"
import React, { useEffect, useState } from "react"
import { twMerge } from "tailwind-merge"
import { Hash } from "viem"

import SlideInOut from "@/app/components/animations/SlideInOut"
import CloseIcon from "@/app/components/icons/CloseIcon"
import ErrorIcon from "@/app/components/icons/ErrorIcon"
import LoadingIcon from "@/app/components/icons/LoadingIcon"
import SuccessIcon from "@/app/components/icons/SuccessIcon"
import Button from "@/app/components/ui/Button"
import { defaultNotificationRemoveDelayMs } from "@/app/config/notifications"
import { iconSizes } from "@/app/config/styling"
import { Notification, NotificationStatus, NotificationStatusType } from "@/app/types/notifications"

interface BaseNotificationProps extends React.ComponentPropsWithoutRef<"div"> {
    notification: Notification,
    removeNotification: (id?: Hash) => void,
}

interface NotificationHeaderProps extends BaseNotificationProps {
    icon?: React.ReactNode,
}

interface NotificationContentProps extends BaseNotificationProps {
    container: Element | DocumentFragment | null | undefined,
    removeOnStatus?: NotificationStatusType,
    removeDelayMs?: number,
    portalProps?: React.ComponentPropsWithoutRef<typeof Portal>,
    headerProps?: React.ComponentPropsWithoutRef<"div">,
    bodyProps?: React.ComponentPropsWithoutRef<"div">,
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

export const NotificationPortal = React.forwardRef<React.ComponentRef<typeof Portal>, React.ComponentPropsWithoutRef<typeof Portal>>(({
    asChild = true,
    container,
    ...props
}, ref) => (
    <Portal
        ref={ref}
        asChild={asChild}
        container={container}
        {...props}
    />
))
NotificationPortal.displayName = "NotificationPortal"

export const NotificationClose = React.forwardRef<HTMLDivElement, BaseNotificationProps>(({
    children,
    className,
    notification,
    removeNotification,
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
                onClick={removeNotification.bind(this, notification.id)}
            >
                <CloseIcon className={iconSizes.sm} />
            </Button>
        )}
    </div>
))
NotificationClose.displayName = "NotificationClose"

export const NotificationHeader = React.forwardRef<HTMLDivElement, NotificationHeaderProps>(({
    children,
    className,
    notification,
    removeNotification,
    icon,
    ...props
}, ref) => (
    <div
        ref={ref}
        className={twMerge("flex flex-row flex-1 gap-4", className)}
        {...props}
    >
        {children ?? (<>
            <div className={twMerge(icon ? "flex" : "hidden", "flex-row flex-none justify-start items-center")}>
                {icon}
            </div>
            <div className={twMerge("flex flex-row flex-1 justify-start items-center font-bold", notification.status === NotificationStatus.Error ? "text-error-500" : notification.status === NotificationStatus.Success ? "text-success-500" : "text-white")}>
                {notification.header}
            </div>
            <NotificationClose
                notification={notification}
                removeNotification={removeNotification}
            />
        </>)}
    </div>
))
NotificationHeader.displayName = "NotificationHeader"

export const NotificationContent = React.forwardRef<HTMLDivElement, NotificationContentProps>(({
    className,
    notification,
    removeNotification,
    container,
    removeOnStatus,
    removeDelayMs,
    portalProps,
    headerProps,
    bodyProps,
    ...props
}, ref) => {

    const removeStatus = removeOnStatus ?? NotificationStatus.Success
    const removeDelay = Math.abs(removeDelayMs ?? defaultNotificationRemoveDelayMs)
    const [statusIcon, setStatusIcon] = useState<React.ReactNode>()

    useEffect(() => {
        setStatusIcon(notification.status === "success" ? <SuccessIcon highlight={true} /> : notification.status === "error" ? <ErrorIcon highlight={true} /> : <LoadingIcon highlight={true} />)
        if (notification.status === removeStatus) {
            setTimeout(() => {
                removeNotification(notification.id)
            }, removeDelay)
        }
    }, [notification.status])

    return (
        <NotificationPortal
            container={container}
            {...portalProps}
        >
            <SlideInOut
                from="right"
                to="right"
                className="w-full"
            >
                <div
                    ref={ref}
                    className={twMerge("container flex flex-col flex-1 p-4 gap-4 w-full max-h-fit h-fit overflow-hidden", className)}
                    {...props}
                >
                    <NotificationHeader
                        notification={notification}
                        removeNotification={removeNotification}
                        icon={statusIcon}
                        {...headerProps}
                    />
                    <div
                        {...bodyProps}
                        className={twMerge("flex flex-col flex-1", bodyProps?.className)}
                    >
                        {notification.body}
                    </div>
                </div>
            </SlideInOut>
        </NotificationPortal>
    )
})
NotificationContent.displayName = "NotificationContent"