"use client"

import { useConnectModal } from "@rainbow-me/rainbowkit"
import * as React from "react"
import { twMerge } from "tailwind-merge"

import Button from "@/app/components/ui/Button"
import { client } from "@/lib/thirdweb_client"
//import { useConnectModal } from "thirdweb/react"
import { wallets } from "@/config/wallet"

const ConnectButton = React.forwardRef<React.ElementRef<typeof Button>, React.ButtonHTMLAttributes<HTMLButtonElement>>(({
    className,
    disabled = false,
    ...props
}, ref) => {

    //const { connect, isConnecting } = useConnectModal()
    // async function handleConnect() {
    //     const wallet = await connect({ client, size: 'compact', wallets: wallets }); // opens the connect modal
    //     console.log('connected to', wallet);
    // }

    const { openConnectModal } = useConnectModal()

    return (
        <Button
            ref={ref}
            onClick={openConnectModal?.bind(this)}
            className={twMerge("btn-gradient uppercase !px-4 py-2", className)}
            disabled={disabled}
            {...props}
        >
            Connect
        </Button>
    )
})
ConnectButton.displayName = "ConnectButton"

export default ConnectButton
