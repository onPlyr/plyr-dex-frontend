import { useConnectModal } from "@rainbow-me/rainbowkit"
import * as React from "react"
import { twMerge } from "tailwind-merge"
import { QueryStatus } from "@tanstack/react-query"

import ErrorIcon from "@/app/components/icons/ErrorIcon"
import LoadingIcon from "@/app/components/icons/LoadingIcon"
import Button from "@/app/components/ui/Button"

export interface ReviewRouteButtonProps extends React.ComponentPropsWithoutRef<typeof Button> {
    err?: string,
    isConnectWalletErr?: boolean,
    queryStatus?: QueryStatus,
}

export const ReviewRouteButton = React.forwardRef<React.ElementRef<typeof Button>, ReviewRouteButtonProps>(({
    className,
    err,
    isConnectWalletErr,
    queryStatus,
    disabled = false,
    ...props
}, ref) => {
    const { openConnectModal } = useConnectModal()
    return (
        <Button
            ref={ref}
            className={twMerge("btn-gradient btn-full", className)}
            onClick={isConnectWalletErr ? openConnectModal?.bind(this) : undefined}
            disabled={isConnectWalletErr !== true && (disabled || err !== undefined || queryStatus === "error")}
            {...props}
        >
            {err ? err : queryStatus === "error" ? (<>
                <ErrorIcon />
                Error Querying Routes
            </>) : queryStatus === "pending" ? (<>
                Finding Routes
                <LoadingIcon />
            </>) : "Review Selected Route"}
        </Button>
    )
})
ReviewRouteButton.displayName = "ReviewRouteButton"
