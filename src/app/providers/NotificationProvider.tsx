"use client"

import { AnimatePresence } from "motion/react"
import { createContext, useCallback, useState } from "react"
import { Hash } from "viem"

import { NotificationContainer, NotificationContent } from "@/app/components/ui/Notification"
import { Notification } from "@/app/types/notifications"

interface NotificationData {
    [id: string]: Notification,
}

interface NotificationContextType {
    data: NotificationData,
    getNotification: ({
        id,
        txHash,
    }: {
        id?: string,
        txHash?: Hash,
    }) => Notification | undefined,
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
    const [notificationData, setNotificationData] = useState<NotificationData>({})

    const getNotification = useCallback(({
        id,
        txHash,
    }: {
        id?: string,
        txHash?: Hash,
    }) => {

        const byId = id ? notificationData[id] : undefined
        const byTxHash = txHash && !byId ? Object.values(notificationData).find((data) => data.txHash && data.txHash.toLowerCase() === txHash.toLowerCase()) : undefined

        return byId ?? byTxHash

    }, [notificationData])

    const setNotification = useCallback((notification?: Notification) => {
        if (notification) {
            setNotificationData((prevData) => {
                return {
                    ...prevData,
                    [notification.id]: notification,
                }
            })
        }
    }, [setNotificationData])

    const removeNotification = useCallback((id?: string) => {
        if (id) {
            setNotificationData((prevData) => {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { [id]: _, ...data } = prevData
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
                    {Object.values(notificationData).map((notification) => (
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
