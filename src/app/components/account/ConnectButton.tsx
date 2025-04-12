"use client"

import { useConnectModal } from "@rainbow-me/rainbowkit"
import React from "react"
import { twMerge } from "tailwind-merge"

import Button, { ButtonProps } from "@/app/components/ui/Button"

const ConnectButton = React.forwardRef<HTMLButtonElement, ButtonProps>(({
    className,
    disabled = false,
    ...props
}, ref) => {

    const { openConnectModal } = useConnectModal()

    return (
        <Button
            ref={ref}
            onClick={openConnectModal?.bind(this)}
            className={twMerge("btn gradient-btn px-3 py-2 rounded-[12px]", className)}
            disabled={disabled}
            {...props}
        >
            Connect
        </Button>
    )
})
ConnectButton.displayName = "ConnectButton"

export default ConnectButton
