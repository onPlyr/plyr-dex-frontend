import { useContext } from "react"

import { NotificationContext } from "@/app/providers/NotificationProvider"

const useNotifications = () => {
    return useContext(NotificationContext)
}

export default useNotifications
