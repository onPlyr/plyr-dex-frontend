"use client"

import { AnimatePresence } from "motion/react"
import { createContext, useCallback, useState } from "react"
import { Hash } from "viem"

import { NotificationContainer, NotificationContent } from "@/app/components/ui/Notification"
import { Notification } from "@/app/types/notifications"

interface GetNotificationArgs {
    id?: string,
    txHash?: Hash,
}

type GetNotificationFunction = (args: GetNotificationArgs) => Notification | undefined
type NotificationDataMap = Map<string, Notification>

interface NotificationContextType {
    data: NotificationDataMap,
    getNotification: GetNotificationFunction,
    setNotification: (notification?: Notification) => void,
    removeNotification: (id?: string) => void,
}

export const NotificationContext = createContext({} as NotificationContextType)

const NotificationProvider = ({
    children,
}: {
    children: React.ReactNode,
}) => {

    const [container, setContainer] = useState<HTMLDivElement | null>(null)
    const [notificationData, setNotificationData] = useState<NotificationDataMap>(new Map([]))
    const getNotification: GetNotificationFunction = useCallback(({ id, txHash }) => (id && notificationData.get(id)) || (txHash && Array.from(notificationData.values()).find((notification) => notification.txHash && notification.txHash === txHash)), [notificationData])

    const setNotification = useCallback((notification?: Notification) => {
        if (notification) {
            setNotificationData((prev) => new Map(prev).set(notification.id, notification))
        }
    }, [setNotificationData])

    const removeNotification = useCallback((id?: string) => {
        if (id) {
            setNotificationData((prev) => {
                const data = new Map(prev)
                data.delete(id)
                return data
            })
        }
    }, [setNotificationData])

    const context: NotificationContextType = {
        data: notificationData,
        getNotification: getNotification,
        setNotification: setNotification,
        removeNotification: removeNotification,
    }

    return (
        <NotificationContext.Provider value={context}>
            {children}
            <NotificationContainer ref={setContainer}>
                <AnimatePresence mode="popLayout">
                    {Array.from(notificationData.values()).map((notification) => (
                        <NotificationContent
                            key={notification.id}
                            notification={notification}
                            container={container}
                        />
                    ))}
                </AnimatePresence>
            </NotificationContainer>
        </NotificationContext.Provider>
    )
}

export default NotificationProvider
