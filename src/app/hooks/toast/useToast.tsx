import { useContext } from "react"

import { ToastContext } from "@/app/lib/toasts" 

const useToast = () => {
    return useContext(ToastContext)
}

export default useToast
