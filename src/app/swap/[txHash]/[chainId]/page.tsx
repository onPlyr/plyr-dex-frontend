"use client"

import "@/app/styles/globals.css"

import { AnimatePresence } from "motion/react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { useEffect } from "react"
import React, { use } from "react"
import { twMerge } from "tailwind-merge"
import { isHex } from "viem"

import ScaleInOut from "@/app/components/animations/ScaleInOut"

import SwapStatusIcon from "@/app/components/icons/SwapStatusIcon"
import SwapStatusIndicator from "@/app/components/animations/SwapStatusIndicator"
import ConfettiIcon from "@/app/components/icons/ConfettiIcon"
import { RefreshIcon } from "@/app/components/icons/RefreshIcon"
import SpeedIcon from "@/app/components/icons/SpeedIcon"
import { ChainImageInline } from "@/app/components/images/ChainImage"
import { TokenImage } from "@/app/components/images/TokenImage"

import SwapProgressBar from "@/app/components/swap/SwapProgressBar"
import SwapHistoryEventSummary from "@/app/components/swapQuotes/SwapHistoryEventSummary"
import AlertDetail, { AlertType } from "@/app/components/ui/AlertDetail"
import Button from "@/app/components/ui/Button"
import DecimalAmount from "@/app/components/ui/DecimalAmount"
import { Page } from "@/app/components/ui/Page"
import { Tooltip } from "@/app/components/ui/Tooltip"
import { NumberFormatType } from "@/app/types/numbers"
import { SwapTab } from "@/app/config/pages"
import { iconSizes } from "@/app/config/styling"
import useSwapHistory from "@/app/hooks/swap/useSwapHistory"
import { getChain } from "@/app/lib/chains"
import { formatDuration } from "@/app/lib/datetime"
import { getPercentDifferenceFormatted } from "@/app/lib/numbers"
import { getStatusLabel } from "@/app/lib/utils"
import { CompletedSwapHistory, isCompletedSwapHistory, SwapActionLabel, SwapStatus, SwapTypeLabel } from "@/app/types/swaps"

import { useSearchParams } from 'next/navigation'
import { toTokens } from "thirdweb/utils"
import { useRouter } from "next/navigation"

interface Params {
    txHash: string,
    chainId: string,
}

interface SwapCompleteDetailProps extends React.ComponentPropsWithoutRef<typeof ScaleInOut> {
    swap: CompletedSwapHistory,
}

const SwapCompleteDetail = React.forwardRef<React.ComponentRef<typeof ScaleInOut>, SwapCompleteDetailProps>(({
    swap,
    ...props
}, ref) => {

    const dstAmountDiff = swap.dstAmount - swap.minDstAmount

    return (
        <ScaleInOut
            ref={ref}
            key={swap.status}
            fadeInOut={true}
            {...props}
        >
            <div className="flex flex-col flex-1 gap-2">
                <div className="relative flex flex-row flex-1 gap-2 justify-center items-center font-bold text-base">
                    <SwapStatusIcon
                        status={swap.status}
                        className={iconSizes.lg}
                        highlight={true}
                    />
                    {SwapTypeLabel[swap.type]} {getStatusLabel(swap.status)}!
                </div>
                <div className="relative flex flex-row flex-1 gap-2 justify-center items-center">
                    {/*<Tooltip
                        trigger=<ChainImageInline
                            chain={swap.srcData.chain}
                            size="xs"
                            className="absolute end-0"
                        />
                    >
                        {swap.srcData.chain.name}
                    </Tooltip>*/}
                    You {SwapActionLabel[swap.type].sent.toLowerCase()}
                    <DecimalAmount
                        amount={swap.srcAmount}
                        symbol={swap.srcData.token.symbol}
                        token={swap.srcData.token}
                        type={NumberFormatType.Precise}
                        className="font-mono font-bold text-base"
                    />
                    <TokenImage
                        token={swap.srcData.token}
                        size="xs"
                    />
                </div>
                <div className="relative flex flex-row flex-1 gap-2 justify-center items-center">
                    {/*<Tooltip
                        trigger=<ChainImageInline
                            chain={swap.dstData.chain}
                            size="xs"
                            className="absolute end-0"
                        />
                    >
                        {swap.dstData.chain.name}
                    </Tooltip>*/}
                    You {SwapActionLabel[swap.type].received.toLowerCase()}
                    <DecimalAmount
                        amount={swap.dstAmount}
                        symbol={swap.dstData.token.symbol}
                        token={swap.dstData.token}
                        type={NumberFormatType.Precise}
                        className="font-mono font-bold text-base"
                    />
                    <TokenImage
                        token={swap.dstData.token}
                        size="xs"
                    />
                </div>
                {dstAmountDiff && dstAmountDiff > BigInt(0) ? (
                    <div className="flex flex-row flex-1 gap-2 justify-center items-center">
                        That&apos;s an extra
                        <DecimalAmount
                            amount={dstAmountDiff}
                            symbol={swap.dstData.token.symbol}
                            token={swap.dstData.token}
                            type={NumberFormatType.PreciseWithSign}
                            className="font-mono font-bold text-base text-success-500"
                        />
                        <ConfettiIcon className={twMerge(iconSizes.sm, "text-success-500")} />
                    </div>
                ) : (
                    <div className="flex flex-row flex-1 gap-2 justify-center items-center">
                        {SwapTypeLabel[swap.type]} {getStatusLabel(swap.status).toLowerCase()} in
                        <span className="font-mono font-bold text-base text-success-500">
                            {formatDuration(swap.duration)}
                        </span>
                        <SpeedIcon className={twMerge(iconSizes.sm, "text-success-500")} />
                    </div>
                )}
            </div>
        </ScaleInOut>
    )
})
SwapCompleteDetail.displayName = "SwapCompleteDetail"

const SwapDetailPage = ({
    params,
}: {
    params: Promise<Params>,
}) => {

    const pageParams = use(params)
    const chainId = parseInt(pageParams.chainId)
    const chain = getChain(chainId)
    const txHash = isHex(pageParams.txHash) ? pageParams.txHash : undefined

    const { getSwapHistory, refetchSwapHistory } = useSwapHistory()
    const swap = txHash && getSwapHistory(txHash)

    const router = useRouter()
    const searchParams = useSearchParams()
    let plyrId = searchParams.get('plyrId');

    if (!chain || !txHash || !swap) {
        notFound()
    }

    // Add to Depositlog //
    const addDepositLog = async (plyrId: string, token: string, amount: string, hash: string) => {
        await fetch('/api/addDepositLog/', {
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

    // Logic to add to Depositlog //
    useEffect(() => {
        console.log('swap', swap)
        if (swap && swap.status === SwapStatus.Success && plyrId && swap.events.length > 0) {
            // get last event dst token //
            //const lastEventDstToken = swap.events[swap.events.length - 1]

            if (swap.dstData && swap.dstData.token.id && swap.dstAmount) {

                addDepositLog(plyrId, swap.dstData.token.id, toTokens(swap.dstAmount, swap.dstData.token.decimals), txHash)

                // remove plyrId from search params
                router.replace(`/swap/${txHash}/${swap.srcData.chain.id}`)
            }
        }
    }, [swap?.status, plyrId])

    // todo: add suspense / loading state
    return swap && (
        <Page
            key={SwapTab.Transactions}
            header=<div className="relative flex flex-row flex-1 gap-2 justify-center items-center">
                {SwapTypeLabel[swap.type]} to {swap.dstData.chain.name}
                <ChainImageInline
                    chain={swap.dstData.chain}
                    size="xs"
                />
                {swap.status !== SwapStatus.Success && (
                    <Tooltip
                        trigger=<Button
                            label="Refetch"
                            className="icon-btn absolute end-0 transition hover:rotate-180"
                            replaceClass={true}
                            onClick={refetchSwapHistory.bind(this, swap)}
                        >
                            <RefreshIcon className={iconSizes.sm} />
                        </Button>
                    >
                        Refetch {SwapTypeLabel[swap.type]}
                    </Tooltip>
                )}
            </div>
            footer={swap.status === SwapStatus.Success && (
                <Link
                    href="/swap"
                    className="btn gradient-btn rounded w-full"
                >
                    New Swap
                </Link>
            )}
            backUrl="/swap"
        >
            <div className="flex flex-col flex-none gap-4 w-full h-fit">
                <div className="container p-4">
                    {isCompletedSwapHistory(swap) ? (
                        <SwapCompleteDetail swap={swap} />
                    ) : (
                        <div className="flex flex-col flex-1 gap-4">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="flex flex-row flex-1 justify-center items-center font-bold text-muted-500">
                                    From
                                </div>
                                <div className="flex flex-row flex-1 gap-4 justify-center items-center font-bold text-center">
                                    {getStatusLabel(swap.status)}
                                </div>
                                <div className="flex flex-row flex-1 justify-center items-center font-bold text-muted-500">
                                    To
                                </div>
                                <div className="flex flex-col flex-1 justify-center items-center">
                                    <TokenImage token={swap.srcData.token} size="lg" />
                                </div>
                                <div className="flex flex-row flex-1 gap-2 justify-center items-center">
                                    <AnimatePresence mode="wait">
                                        <SwapStatusIndicator swap={swap} />
                                    </AnimatePresence>
                                </div>
                                <div className="flex flex-col flex-1 justify-center items-center">
                                    <TokenImage
                                        token={swap.dstData.token}
                                        size="lg"
                                    />
                                </div>
                                <div className="flex flex-row flex-1 gap-2 justify-center items-center font-bold">
                                    <ChainImageInline chain={swap.srcData.chain} size="xs" />
                                    {swap.srcData.token.symbol}
                                </div>
                                <div className={twMerge("flex flex-row flex-1 gap-2 flex-wrap justify-center items-center font-bold font-mono text-base text-center", swap.status === SwapStatus.Success ? "text-success-500" : "text-muted-500")}>
                                    <DecimalAmount
                                        amount={swap.status === SwapStatus.Success ? swap.dstAmount && swap.dstAmount - swap.minDstAmount : swap.minDstAmount}
                                        symbol={swap.dstData.token.symbol}
                                        token={swap.dstData.token}
                                        type={swap.status === SwapStatus.Success ? NumberFormatType.PreciseWithSign : NumberFormatType.Precise}
                                        className="hidden sm:flex"
                                    />
                                    <div className="flex sm:hidden">
                                        {swap.status === SwapStatus.Success && swap.dstAmount && `${getPercentDifferenceFormatted(swap.minDstAmount, swap.dstAmount, swap.dstData.token.decimals, true)} ${swap.dstData.token.symbol}`}
                                    </div>
                                </div>
                                <div className="flex flex-row flex-1 gap-2 justify-center items-center font-bold">
                                    <ChainImageInline chain={swap.dstData.chain} size="xs" />
                                    {swap.dstData.token.symbol}
                                </div>
                            </div>
                            <SwapProgressBar swap={swap} />
                        </div>
                    )}
                </div>
                {(swap.status === SwapStatus.Error || swap.error) && (
                    <AlertDetail
                        type={AlertType.Error}
                        header={`${SwapTypeLabel[swap.type]} Error`}
                        msg={swap.error ?? `An unknown error was encountered confirming your ${SwapTypeLabel[swap.type]}.`}
                    />
                )}
                {/*@ts-ignore*/}
                <SwapHistoryEventSummary swap={swap} />
            </div>
        </Page>
    )
}

export default SwapDetailPage
