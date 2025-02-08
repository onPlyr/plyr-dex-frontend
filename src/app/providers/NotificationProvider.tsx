"use client"

import { AnimatePresence } from "motion/react"
import { createContext, useCallback, useState } from "react"
import { Hash } from "viem"

import { NotificationContainer, NotificationContent } from "@/app/components/ui/Notification"
import { Notification } from "@/app/types/notifications"

interface NotificationContextType {
    data: Notification[],
    getNotification: (id?: Hash, txHash?: Hash) => Notification | undefined,
    setNotification: (notification?: Notification) => void,
    removeNotification: (id?: Hash) => void,
}

export const NotificationContext = createContext({} as NotificationContextType)

const NotificationProvider = ({
    children,
}: {
    children: React.ReactNode,
}) => {

    const [container, setContainer] = useState<HTMLDivElement | null>(null)
    const [notificationData, setNotificationData] = useState<Notification[]>([])

    const getNotification = useCallback((id?: Hash, txHash?: Hash) => {
        return id ? notificationData.find((notification) => notification.id.toLowerCase() === id.toLowerCase() || (notification.txHash && txHash && notification.txHash.toLowerCase() === txHash.toLowerCase())) : undefined
    }, [notificationData])

    const setNotification = useCallback((notification?: Notification) => {

        if (notification) {

            const index = notificationData.findIndex((existing) => existing.id.toLowerCase() === notification.id.toLowerCase() || (existing.txHash && notification.txHash && existing.txHash.toLowerCase() === notification.txHash.toLowerCase()))
            const data = [
                ...notificationData,
            ]

            if (index !== -1) {
                data[index] = notification
            }
            else {
                data.push(notification)
            }

            setNotificationData(data)
        }

    }, [notificationData, setNotificationData])

    const removeNotification = useCallback((id?: Hash) => {
        if (id) {
            setNotificationData(notificationData.filter((data) => data.id.toLowerCase() !== id.toLowerCase()))
        }
    }, [notificationData, setNotificationData])

    const context: NotificationContextType = {
        data: notificationData,
        getNotification: getNotification,
        setNotification: setNotification,
        removeNotification: removeNotification,
    }

    // console.log(`>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> notifications: ${serialize(notificationData)} <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<`)

    return (
        <NotificationContext.Provider value={context}>
            {children}
            <NotificationContainer ref={setContainer}>
                <AnimatePresence>
                    {notificationData.map((notification) => (
                        <NotificationContent
                            key={notification.id}
                            notification={notification}
                            removeNotification={removeNotification}
                            container={container}
                        />
                    ))}
                </AnimatePresence>
            </NotificationContainer>
        </NotificationContext.Provider>
    )
}

export default NotificationProvider