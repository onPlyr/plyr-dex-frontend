import { ToastData } from "@/app/components/ui/Toast"

export interface ToastContextType {
    toasts: ToastData[],
    addToast: (toast: ToastData) => ToastData,
    removeToast: (id: string) => void,
}
