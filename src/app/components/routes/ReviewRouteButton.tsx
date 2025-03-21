import { useConnectModal } from "@rainbow-me/rainbowkit"
import React from "react"
import { twMerge } from "tailwind-merge"
import { QueryStatus } from "@tanstack/react-query"

import ErrorIcon from "@/app/components/icons/ErrorIcon"
import LoadingIcon from "@/app/components/icons/LoadingIcon"
import Button from "@/app/components/ui/Button"

// export interface ReviewRouteButtonProps extends React.ComponentPropsWithoutRef<typeof AnimatedButton> {
//     err?: string,
//     isConnectWalletErr?: boolean,
//     queryStatus?: QueryStatus,
// }

// export const ReviewRouteButton = React.forwardRef<React.ComponentRef<typeof AnimatedButton>, ReviewRouteButtonProps>(({
//     className,
//     err,
//     isConnectWalletErr,
//     queryStatus,
//     onClick,
//     disabled = false,
//     ...props
// }, ref) => {
//     const { openConnectModal } = useConnectModal()
//     const isDisabled = !isConnectWalletErr && (disabled || err !== undefined || queryStatus === "error" || queryStatus === "pending")
//     return (
//         <AnimatedButton
//             ref={ref}
//             className={twMerge("btn gradient-btn rounded w-full", className)}
//             onClick={isConnectWalletErr ? openConnectModal?.bind(this) : isDisabled ? undefined : onClick?.bind(this)}
//             disabled={isDisabled}
//             {...props}
//         >
//             {err ? err : queryStatus === "error" ? (<>
//                 <ErrorIcon />
//                 Error Querying Routes
//             </>) : queryStatus === "pending" ? (<>
//                 Finding Routes
//                 <LoadingIcon />
//             </>) : "Review"}
//         </AnimatedButton>
//     )
// })
// ReviewRouteButton.displayName = "ReviewRouteButton"

export interface ReviewRouteButtonProps extends React.ComponentPropsWithoutRef<typeof Button> {
    err?: string,
    isConnectWalletErr?: boolean,
    queryStatus?: QueryStatus,
}

export const ReviewRouteButton = React.forwardRef<React.ComponentRef<typeof Button>, ReviewRouteButtonProps>(({
    className,
    err,
    isConnectWalletErr,
    queryStatus,
    onClick,
    disabled = false,
    ...props
}, ref) => {
    const { openConnectModal } = useConnectModal()
    const isDisabled = !isConnectWalletErr && (disabled || err !== undefined || queryStatus === "error" || queryStatus === "pending")
    return (
        <Button
            ref={ref}
            className={twMerge("btn gradient-btn rounded w-full", className)}
            onClick={isConnectWalletErr ? openConnectModal?.bind(this) : isDisabled ? undefined : onClick?.bind(this)}
            disabled={isDisabled}
            {...props}
        >
            {err ? err : queryStatus === "error" ? (<>
                <ErrorIcon />
                Error Querying Routes
            </>) : queryStatus === "pending" ? (<>
                Finding Routes
                <LoadingIcon />
            </>) : "Review"}
        </Button>
    )
})
ReviewRouteButton.displayName = "ReviewRouteButton"