"use client"

import { AnimatePresence } from "motion/react"
import { useCallback, useState } from "react"

import { ToastContext } from "@/app/lib/toasts"
import { RadixToastProvider, Toast, ToastData, ToastViewport } from "@/app/components/ui/Toast"
import { ToastContextType } from "@/app/types/toasts"

const generateToastId = () => {
    return window.crypto.randomUUID()
}

const ToastProvider = ({
    children,
}: {
    children: React.ReactNode,
}) => {

    const [toasts, setToasts] = useState<ToastData[]>([])

    const addToast = useCallback((toast: ToastData) => {

        // avoid duplicates
        const existingIndex = toast.id ? toasts.findIndex((t) => t.id === toast.id) : undefined
        if (existingIndex !== undefined && existingIndex !== -1) {
            return toasts[existingIndex]
        }

        const newToast: ToastData = {
            ...toast,
        }
        if (newToast.id === undefined || newToast.id.trim().length === 0) {
            newToast.id = generateToastId()
        }
        setToasts([
            ...toasts,
            newToast,
        ])
        return newToast
    }, [toasts, setToasts])

    const removeToast = useCallback((id: string) => {
        setToasts(toasts.filter((toast) => toast.id !== id))
    }, [toasts, setToasts])

    const context: ToastContextType = {
        toasts: toasts,
        addToast: addToast,
        removeToast: removeToast,
    }

    return (
        <RadixToastProvider>
            <ToastContext.Provider value={context}>
                {children}
            </ToastContext.Provider>
            <AnimatePresence>
                {toasts.map((toast) => (
                    <Toast
                        key={toast.id}
                        onOpenChange={removeToast.bind(this, toast.id!)}
                        {...toast}
                    />
                ))}
            </AnimatePresence>
            <ToastViewport />
        </RadixToastProvider>
    )
}

export default ToastProvider
