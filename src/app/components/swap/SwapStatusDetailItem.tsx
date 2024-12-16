"use client"

import * as React from "react"
import { useEffect, useState } from "react"
import { twMerge } from "tailwind-merge"
import { useAccount } from "wagmi"

import AccountHistoryDetailTokenItem from "@/app/components/account/AccountHistoryDetailTokenItem"
import AccountHistoryParameterItem from "@/app/components/account/AccountHistoryParameterItem"
import ArrowIcon from "@/app/components/icons/ArrowIcon"
import LoadingIcon from "@/app/components/icons/LoadingIcon"
import RouteTypeIcon from "@/app/components/icons/RouteTypeIcon"
import SendIcon from "@/app/components/icons/SendIcon"
import StackIcon from "@/app/components/icons/StackIcon"
import SwapStatusIcon from "@/app/components/icons/SwapStatusIcon"
import SwapEventStatusDetailItem from "@/app/components/swap/SwapEventStatusDetailItem"
import ExternalLink from "@/app/components/ui/ExternalLink"
import { Progress } from "@/app/components/ui/Progress"
import { iconSizes } from "@/app/config/styling"
import { swapStatusMessages } from "@/app/config/swaps"
import useWatchSwapStatus from "@/app/hooks/swap/useWatchSwapStatus"
import { getBlockExplorerLink } from "@/app/lib/chains"
import { formatDuration, timestampAgo, timestampToISO } from "@/app/lib/datetime"
import { toShort } from "@/app/lib/strings"
import { getRouteTypeLabel, getSwapHistoryQuoteData, getSwapProgress } from "@/app/lib/swaps"
import { StyleDirection } from "@/app/types/styling"
import { SwapHistory } from "@/app/types/swaps"
import { toTokens, toUnits } from "thirdweb"

interface SwapStatusDetailItemProps extends React.ComponentPropsWithoutRef<"div"> {
    history?: SwapHistory,
    pendingHistory?: SwapHistory,
    initialValue?: number,
    plyrId?: string,
    isPlyrDestination?: boolean,
}

const SwapStatusDetailItem = React.forwardRef<HTMLDivElement, SwapStatusDetailItemProps>(({
    className,
    history,
    pendingHistory,
    initialValue,
    plyrId,
    isPlyrDestination,
    ...props
}, ref) => {

    const initialProgress = initialValue ?? 10
    const { address: accountAddress } = useAccount()
    const [swapProgress, setSwapProgress] = useState<number>(initialProgress)


   

    const confirmedSwapHistory = useWatchSwapStatus({
        accountAddress: accountAddress,
        txid: history?.id,
    })
    const swapHistory = pendingHistory ?? confirmedSwapHistory

    useEffect(() => {
        setSwapProgress(getSwapProgress(swapHistory, initialValue))
    }, [swapHistory, initialValue])

    const swapData = swapHistory ? getSwapHistoryQuoteData(swapHistory) : undefined
    const swapType = swapHistory ? getRouteTypeLabel(swapHistory.type) : undefined
    const finalTx = swapHistory?.dstTx

    const initiateTxUrl = getBlockExplorerLink({
        chain: swapData?.srcChain,
        tx: swapHistory?.id,
    })
    const receivedTxUrl = getBlockExplorerLink({
        chain: swapData?.dstChain,
        tx: finalTx?.hash,
    })

    const addDepositLog = async (plyrId: string, token: string, amount: string, hash: string) => {
        await fetch('/api/addDepositLog', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                plyrId: plyrId,
                gameId: null,
                token: token,
                amount: amount,
                hash: hash,
            })
        });
    }

    useEffect(() => {
        console.log('swapProgress', plyrId, isPlyrDestination, swapProgress);
        if (isPlyrDestination && plyrId && swapProgress >= 100 && finalTx?.hash && swapData?.dstToken?.id && swapData?.dstAmount) {
            addDepositLog(plyrId, swapData?.dstToken?.id, toTokens(swapData?.dstAmount, swapData?.dstToken?.decimals), finalTx?.hash)
        }
    }, [isPlyrDestination, swapProgress, finalTx])

    return (
        <div
            ref={ref}
            className={twMerge("flex flex-col flex-1 gap-4", className)}
            {...props}
        >
            {swapHistory ? (<>
                {swapData && (
                    <div className="flex flex-row flex-1 gap-4">
                        <AccountHistoryDetailTokenItem
                            token={swapData.srcToken}
                            chain={swapData.srcChain}
                            amount={swapData.srcAmount}
                        />
                        <div className="flex flex-row shrink justify-center items-center">
                            <ArrowIcon direction={StyleDirection.Right} />
                        </div>
                        <AccountHistoryDetailTokenItem
                            token={swapData.dstToken}
                            chain={swapData.dstChain}
                            amount={swapData.dstAmount}
                        />
                    </div>
                )}
                <div className="flex flex-row flex-1 py-4 justify-center items-center">
                    <div className="flex flex-row w-3/4 relative items-center">
                        <Progress
                            value={swapProgress}
                            checkpoints={[
                                {
                                    position: 0,
                                    loadingLabel: `${swapType} Starting...`,
                                    successLabel: `${swapType} Started`,
                                },
                                {
                                    position: 50,
                                    loadingLabel: "Confirming...",
                                    successLabel: "Confirmed",
                                    url: initiateTxUrl,
                                },
                                {
                                    position: 100,
                                    loadingLabel: "Pending...",
                                    successLabel: "Completed",
                                    url: receivedTxUrl,
                                },
                            ]}
                        />
                    </div>
                </div>
                <div className="flex flex-col flex-1 gap-2">
                    <AccountHistoryParameterItem
                        label={`${swapType} Status`}
                        value={swapHistory && `${swapStatusMessages[swapHistory.status]}${swapHistory.status === "success" && finalTx ? ` in ${formatDuration(finalTx.timestamp - swapHistory.timestamp)}` : ""}`}
                        icon={swapHistory && <SwapStatusIcon status={swapHistory.status} className={iconSizes.sm} />}
                    />
                    <AccountHistoryParameterItem
                        label={`${swapType} Started`}
                        value={swapHistory && timestampToISO(swapHistory.timestamp)}
                        loadingValue="Confirming..."
                        secondaryLabel={swapHistory && (
                            initiateTxUrl ? (
                                <ExternalLink
                                    href={initiateTxUrl}
                                    iconSize="xs"
                                >
                                    {toShort(swapHistory.id, 6)}
                                </ExternalLink>
                            ) : toShort(swapHistory.id, 6)
                        )}
                        secondaryValue={swapHistory && timestampAgo(swapHistory.timestamp)}
                        icon=<SendIcon className={iconSizes.sm} />
                    />
                    <AccountHistoryParameterItem
                        label={`${swapType} Completed`}
                        value={finalTx && timestampToISO(finalTx.timestamp)}
                        loadingValue="Confirming..."
                        secondaryLabel={finalTx && (
                            finalTx && receivedTxUrl ? (
                                <ExternalLink
                                    href={receivedTxUrl}
                                    iconSize="xs"
                                >
                                    {toShort(finalTx.hash, 6)}
                                </ExternalLink>
                            ) : finalTx && toShort(finalTx.hash, 6)
                        )}
                        secondaryValue={finalTx && timestampAgo(finalTx.timestamp)}
                        icon={swapHistory && <RouteTypeIcon type={swapHistory.type} className={iconSizes.sm} />}
                    />
                </div>
                {swapHistory?.events && swapHistory.events.length > 0 && (<>
                    <div className="flex flex-row flex-1 py-2 gap-4 justify-center items-center font-bold">
                        <StackIcon />
                        {swapType} Steps
                    </div>
                    <div className="flex flex-col flex-1">
                        {swapHistory.events.map((event, i) => (
                            <SwapEventStatusDetailItem
                                key={i}
                                swapHistory={swapHistory}
                                event={event}
                            />
                        ))}
                    </div>
                </>)}
            </>) : (
                <div className="flex flex-row flex-1 gap-4 items-center">
                    <LoadingIcon className={iconSizes.xl} />
                    <div className="text-muted-500">Loading transaction details</div>
                </div>
            )}
        </div>
    )
})
SwapStatusDetailItem.displayName = "SwapStatusDetailItem"

export default SwapStatusDetailItem
