//import { useConnectModal } from "@rainbow-me/rainbowkit"
import * as React from "react"
import { twMerge } from "tailwind-merge"
import { QueryStatus } from "@tanstack/react-query"

import ErrorIcon from "@/app/components/icons/ErrorIcon"
import LoadingIcon from "@/app/components/icons/LoadingIcon"
import Button from "@/app/components/ui/Button"
import { useConnectModal } from "thirdweb/react"
import { getRouteTypeLabel } from "@/app/lib/swaps"
import { Route } from "@/app/types/swaps"
import { client } from "@/lib/thirdweb_client"
import { wallets } from "@/config/wallet"

export interface ReviewRouteButtonProps extends React.ComponentPropsWithoutRef<typeof Button> {
    route?: Route,
    err?: string,
    isConnectWalletErr?: boolean,
    queryStatus?: QueryStatus,
}

export const ReviewRouteButton = React.forwardRef<React.ElementRef<typeof Button>, ReviewRouteButtonProps>(({
    className,
    route,
    err,
    isConnectWalletErr,
    queryStatus,
    disabled = false,
    ...props
}, ref) => {
    const { connect, isConnecting } = useConnectModal()
    async function handleConnect() {
        const wallet = await connect({ client, size: 'compact', wallets: wallets }); // opens the connect modal
        console.log('connected to', wallet);
    }
    return (
        <Button
            ref={ref}
            // className={twMerge("btn-gradient btn-full", className)}
            className={twMerge("btn gradient-btn rounded w-full", className)}
            onClick={isConnectWalletErr ? handleConnect : undefined}
            disabled={isConnectWalletErr !== true && (disabled || err !== undefined || queryStatus === "error")}
            {...props}
        >
            {err ? err : queryStatus === "error" ? (<>
                <ErrorIcon />
                Error Querying Routes
            </>) : queryStatus === "pending" ? (<>
                Finding Routes
                <LoadingIcon />
            </>) : `Review ${route ? getRouteTypeLabel(route.type) : "Route"}`}
        </Button>
    )
})
ReviewRouteButton.displayName = "ReviewRouteButton"
