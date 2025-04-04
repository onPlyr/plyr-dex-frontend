import React from "react"
import { twMerge } from "tailwind-merge"

import { ChainImageInline } from "@/app/components/images/ChainImage"
import { TokenImage } from "@/app/components/images/TokenImage"
import DecimalAmount from "@/app/components/ui/DecimalAmount"
import { isSameChainSwap, Swap, SwapAction, SwapActionLabel, SwapStatus, SwapTypeLabel } from "@/app/types/swaps"

interface NotificationProps extends React.ComponentPropsWithoutRef<"div"> {
    swap: Swap,
    isInitiate?: boolean,
}

export const NotificationHeader = React.forwardRef<HTMLDivElement, Omit<NotificationProps, "isInitiate">>(({
    className,
    swap,
    ...props
}, ref) => (
    <div
        ref={ref}
        className={twMerge("flex flex-row flex-1 gap-2 justify-start items-center", className)}
        {...props}
    >
        {SwapTypeLabel[swap.type]} {isSameChainSwap(swap) ? "on" : "to"} {swap.dstData.chain.name}
        <ChainImageInline
            chain={swap.dstData.chain}
            size="xs"
        />
    </div>
))
NotificationHeader.displayName = "NotificationHeader"

export const NotificationBody = React.forwardRef<HTMLDivElement, NotificationProps>(({
    className,
    swap,
    isInitiate,
    ...props
}, ref) => (
    <div
        ref={ref}
        className={twMerge("flex flex-col flex-1 gap-1", className)}
        {...props}
    >
        {swap.status === SwapStatus.Error ? swap.error || "Unable to fetch transaction data." : (<>
            <div className="flex flex-row flex-1 gap-2 justify-start items-center">
                {SwapActionLabel[swap.type][isInitiate ? SwapAction.Send : SwapAction.Sent]}
                <DecimalAmount
                    amount={swap.srcAmount}
                    symbol={swap.srcData.token.symbol}
                    token={swap.srcData.token}
                    className="flex flex-row flex-1 justify-end items-center font-mono font-bold text-base text-end"
                    replaceClass={true}
                />
                <TokenImage
                    token={swap.srcData.token}
                    size="xs"
                />
            </div>
            <div className="flex flex-row flex-1 gap-2 justify-start items-center">
                {SwapActionLabel[swap.type][isInitiate ? SwapAction.Receive : SwapAction.Received]}
                {isInitiate || (swap.status === SwapStatus.Success && swap.dstAmount) ? (
                    <DecimalAmount
                        amount={isInitiate ? swap.minDstAmount : swap.dstAmount}
                        symbol={swap.dstData.token.symbol}
                        token={swap.dstData.token}
                        className="flex flex-row flex-1 justify-end items-center font-mono font-bold text-base text-end"
                        replaceClass={true}
                    />
                ) : (
                    <div className="flex flex-row flex-1 justify-end items-center font-mono font-bold text-base text-end">
                        Pending
                    </div>
                )}
                <TokenImage
                    token={swap.dstData.token}
                    size="xs"
                />
            </div>
        </>)}
    </div>
))
NotificationBody.displayName = "NotificationBody"
