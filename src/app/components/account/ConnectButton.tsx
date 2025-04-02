"use client"

import { useConnectModal } from "@rainbow-me/rainbowkit"
import React from "react"
import { twMerge } from "tailwind-merge"

import Button from "@/app/components/ui/Button"

const ConnectButton = React.forwardRef<React.ComponentRef<typeof Button>, React.ButtonHTMLAttributes<HTMLButtonElement>>(({
    className,
    disabled = false,
    ...props
}, ref) => {

    const { openConnectModal } = useConnectModal()

    return (
        <Button
            ref={ref}
            onClick={openConnectModal?.bind(this)}
            className={twMerge("btn gradient-btn px-3 py-2", className)}
            disabled={disabled}
            {...props}
        >
            Connect
        </Button>
    )
})
ConnectButton.displayName = "ConnectButton"

export default ConnectButton
