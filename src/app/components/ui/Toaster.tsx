"use client"

import { Toast, ToastProvider, ToastViewport } from "@/app/components/ui/Toast"
import { useToast } from "@/app/hooks/toast/useToast"

export function Toaster() {
    const { toasts } = useToast()

    return (
        <ToastProvider>
            {toasts.map(function ({ id, header, description, action, ...props }) {
                return (
                    <Toast
                        key={id}
                        header={header}
                        action={action}
                        description={description}
                        {...props}
                    />
                )
            })}
            <ToastViewport />
        </ToastProvider>
    )
}
