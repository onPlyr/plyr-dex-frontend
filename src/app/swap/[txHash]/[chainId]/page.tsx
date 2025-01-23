"use client"

import { AnimatePresence, Transition } from "motion/react"
import { notFound } from "next/navigation"
import { use } from "react"
import { twMerge } from "tailwind-merge"
import { isHex } from "viem"

import "@/app/styles/globals.css"

import { AnimatedBridgeIcon } from "@/app/components/animations/AnimatedBridgeIcon"
import { AnimatedSwapIcon } from "@/app/components/animations/AnimatedSwapIcon"
import SlideInOut from "@/app/components/animations/SlideInOut"
import CoinsIcon from "@/app/components/icons/CoinsIcon"
import DifferenceIcon from "@/app/components/icons/DifferenceIcon"
import DurationIcon from "@/app/components/icons/DurationIcon"
import ReceiveIcon from "@/app/components/icons/ReceiveIcon"
import RouteTypeIcon from "@/app/components/icons/RouteTypeIcon"
import SendIcon from "@/app/components/icons/SendIcon"
import SwapStatusIcon from "@/app/components/icons/SwapStatusIcon"
import { ChainImageInline } from "@/app/components/images/ChainImage"
import { PlatformImage } from "@/app/components/images/PlatformImage"
import RouteEventTokenDetail from "@/app/components/routes/RouteEventTokenDetail"
import SwapParameter from "@/app/components/swap/SwapParameter"
import SwapTokenDetail from "@/app/components/swap/SwapTokenDetail"
import DecimalAmount from "@/app/components/ui/DecimalAmount"
import ExternalLink from "@/app/components/ui/ExternalLink"
import { Page } from "@/app/components/ui/Page"
import { defaultTransition } from "@/app/config/animations"
import { SwapTab } from "@/app/config/pages"
import { NumberFormatType } from "@/app/config/numbers"
import { iconSizes } from "@/app/config/styling"
import { SwapStatus } from "@/app/config/swaps"
import useSwapDetails from "@/app/hooks/swap/useSwapDetails"
import { getBlockExplorerLink, getChain } from "@/app/lib/chains"
import { formatDuration } from "@/app/lib/datetime"
import { getPlatform } from "@/app/lib/platforms"
import { toShort } from "@/app/lib/strings"
import { getRouteTypeLabel } from "@/app/lib/swaps"
import { getStatusLabel } from "@/app/lib/utils"
import { BaseSwapData, RouteType, SwapEvent } from "@/app/types/swaps"

interface Params {
    txHash: string,
    chainId: string,
}

const eventTransition: Transition = {
    ...defaultTransition,
    duration: 0.5,
}

const SwapDetailPage = ({
    params,
}: {
    params: Promise<Params>,
}) => {

    const pageParams = use(params)
    const chainId = parseInt(pageParams.chainId)
    const chain = getChain(chainId)
    const txHash = isHex(pageParams.txHash) ? pageParams.txHash : undefined

    if (!chain || !txHash) {
        notFound()
    }

    const { data: swap } = useSwapDetails({
        chain: chain,
        txHash: txHash,
    })

    const txString = toShort(txHash)
    const swapType = swap?.type ? getRouteTypeLabel(swap.type) : "Transaction"
    const diffEstAmount = swap && swap.estAmount && swap.dstData?.amount ? swap.dstData.amount - swap.estAmount : undefined

    let srcData: BaseSwapData | undefined = swap?.srcData
    let dstData: BaseSwapData | undefined = swap?.dstData
    let latestEvent: SwapEvent | undefined = undefined

    if (!swap || swap.status !== SwapStatus.Success) {

        const completeEvent = swap?.events.findLast((event) => event.status === SwapStatus.Success)
        const pendingEvent = !completeEvent ? swap?.events.findLast((event) => event.status !== SwapStatus.Success) : undefined

        if (completeEvent) {
            srcData = completeEvent.srcData
            dstData = completeEvent.dstData
            latestEvent = completeEvent
        }
        else if (pendingEvent) {
            srcData = pendingEvent.srcData
            dstData = pendingEvent.dstData
            latestEvent = pendingEvent
        }
        else {
            srcData = swap?.srcData
            dstData = swap?.dstData
            latestEvent = undefined
        }
    }

    // todo: add suspense / loading state

    // todo: add proper loading details below
    // todo: update phrasing - currently says complete

    return swap && (
        <Page
            key={SwapTab.Transactions}
            header={`${swapType}: ${txString}`}
            backUrl="/swap/history"
        >
            <div className="flex flex-col flex-none gap-4 w-full h-fit">
                <div className="container p-4">
                    <div className="flex flex-col flex-1 gap-4">
                        <div className="flex flex-row flex-1 gap-4 justify-center items-center font-bold text-base">
                            {swapType} {getStatusLabel(swap.status)}
                            <SwapStatusIcon status={swap.status} highlight={true} />
                        </div>
                        <AnimatePresence mode="popLayout">
                            {srcData && dstData ? (
                                <SlideInOut
                                    key={`${swap.id}-${latestEvent ? `${latestEvent.hopIndex}-${srcData.token.id}-${dstData.token.id}-${latestEvent.status}` : `${swap.status}`}`}
                                    from="right"
                                    to="left"
                                    transitions={{
                                        initial: eventTransition,
                                        animate: eventTransition,
                                        exit: eventTransition,
                                    }}
                                    layout={true}
                                >
                                    <div className="flex flex-col flex-1 gap-4">
                                        <div className="flex flex-row flex-1 gap-4 justify-between items-center">
                                            <SwapTokenDetail
                                                label="From"
                                                token={srcData.token}
                                                chain={srcData.chain}
                                            />
                                            <div className="flex flex-row flex-1 max-w-16 max-h-16 justify-center items-center text-success-500">
                                                {swapType === RouteType.Bridge ? <AnimatedBridgeIcon /> : <AnimatedSwapIcon />}
                                            </div>
                                            <SwapTokenDetail
                                                label="To"
                                                token={dstData.token}
                                                chain={dstData.chain}
                                            />
                                        </div>
                                        <div className="flex flex-row flex-1 flex-wrap gap-x-1 gap-y-2 justify-center items-center font-bold">
                                            {swap.status === SwapStatus.Success ? (<>
                                                You received&nbsp;
                                                <div
                                                    className="swap-label border-1"
                                                    style={{
                                                        borderColor: dstData.token.iconBackground,
                                                    }}
                                                >
                                                    <DecimalAmount
                                                        amount={dstData.amount}
                                                        symbol={dstData.token.symbol}
                                                        token={dstData.token}
                                                        type={NumberFormatType.Precise}
                                                    />
                                                    &nbsp;on {dstData.chain.name}
                                                </div>
                                                {swap.duration !== undefined && (<>
                                                    &nbsp;in
                                                    <div
                                                        className="swap-label"
                                                        data-selected={true}
                                                    >
                                                        {formatDuration(swap.duration)}
                                                    </div>
                                                </>)}
                                            </>) : latestEvent?.type === RouteType.Bridge ? (<>
                                                Transferring from&nbsp;
                                                <ChainImageInline chain={srcData.chain} size="xs" />
                                                {srcData.chain.name} to&nbsp;
                                                <ChainImageInline chain={dstData.chain} size="xs" />
                                                {dstData.chain.name}
                                            </>) : latestEvent?.type === RouteType.Swap && (<>
                                                Swapping from&nbsp;
                                                <div
                                                    className="swap-label border-1"
                                                    style={{
                                                        borderColor: srcData.token.iconBackground,
                                                    }}
                                                >
                                                    <DecimalAmount
                                                        amount={srcData.amount}
                                                        symbol={srcData.token.symbol}
                                                        token={srcData.token}
                                                        type={NumberFormatType.Precise}
                                                    />
                                                    &nbsp;on {srcData.chain.name}
                                                </div>&nbsp;
                                                to&nbsp;
                                                <div
                                                    className="swap-label border-1"
                                                    style={{
                                                        borderColor: dstData.token.iconBackground,
                                                    }}
                                                >
                                                    <DecimalAmount
                                                        amount={dstData.amount}
                                                        symbol={dstData.token.symbol}
                                                        token={dstData.token}
                                                        type={NumberFormatType.Precise}
                                                    />
                                                    &nbsp;on {dstData.chain.name}
                                                </div>
                                            </>)}
                                        </div>
                                    </div>
                                </SlideInOut>
                            ) : "todo: loading swap details"}
                        </AnimatePresence>
                    </div>
                </div>
                <div className="container p-4">
                    <div className="flex flex-col flex-1 gap-1">
                        <SwapParameter
                            icon=<SendIcon className={iconSizes.sm} />
                            label="Sent"
                            value=<DecimalAmount
                                amount={swap.srcData.amount}
                                symbol={swap.srcData.token.symbol}
                                token={swap.srcData.token}
                                type={NumberFormatType.Precise}
                                className="font-mono text-base"
                            />
                        />
                        <SwapParameter
                            icon=<ReceiveIcon className={iconSizes.sm} />
                            label="Received"
                            value={swap.dstData ? (
                                <DecimalAmount
                                    amount={swap.dstData.amount}
                                    symbol={swap.dstData.token.symbol}
                                    token={swap.dstData.token}
                                    type={NumberFormatType.Precise}
                                />
                            ) : "Pending"}
                            valueClass="font-mono text-base"
                        />
                        {swap.estAmount && (<>
                            <SwapParameter
                                icon=<CoinsIcon className={iconSizes.sm} />
                                label="Est. to receive"
                                value={swap.dstData ? (
                                    <DecimalAmount
                                        amount={swap.estAmount}
                                        symbol={swap.dstData.token.symbol}
                                        token={swap.dstData.token}
                                        type={NumberFormatType.Precise}
                                        className="font-mono text-base text-muted-400"
                                    />
                                ) : "Pending"}
                            />
                            {(diffEstAmount !== undefined || swap.status === SwapStatus.Pending) && (
                                <SwapParameter
                                    icon=<DifferenceIcon className={iconSizes.sm} />
                                    label="Difference"
                                    value={swap.dstData && diffEstAmount !== undefined ? (
                                        <DecimalAmount
                                            amount={diffEstAmount}
                                            symbol={swap.dstData.token.symbol}
                                            token={swap.dstData.token}
                                            type={NumberFormatType.Precise}
                                            className={twMerge("font-mono text-base", diffEstAmount ? (diffEstAmount < BigInt(0) ? "text-error-500" : "text-success-500") : "text-muted-400")}
                                        />
                                    ) : "Pending"}
                                />
                            )}
                        </>)}
                        <SwapParameter
                            icon=<DurationIcon className={iconSizes.sm} />
                            label="Duration"
                            value={swap.duration !== undefined ? formatDuration(swap.duration) : "Pending"}
                        />
                    </div>
                </div>
                {swap.events.length > 0 && (
                    <div className="flex flex-col flex-1 gap-4">
                        <AnimatePresence>
                            {swap.events.map((event, i) => {

                                const platform = event.adapter?.platform ? getPlatform(event.adapter.platform) : undefined
                                const platformName = (event.type === RouteType.Bridge ? event.bridge : platform?.name) || (event.adapterAddress && toShort(event.adapterAddress))
                                const eventTxUrl = getBlockExplorerLink({
                                    chain: event.srcData.chain,
                                    tx: event.txHash,
                                })

                                return (
                                    <SlideInOut
                                        key={`${swap.id}-${i}`}
                                        from="left"
                                        to="right"
                                        delays={{
                                            animate: i * 0.1,
                                            exit: (swap.events.length - 1 - i) * 0.05,
                                        }}
                                    >
                                        <div className="container flex flex-col flex-1 p-4 gap-4">
                                            <div className="flex flex-row flex-1 gap-4 justify-between">
                                                <div className="group flex flex-row flex-none justify-start items-center gap-4 font-bold">
                                                    {platform ? (
                                                        <PlatformImage platform={platform} size="xs" />
                                                    ) : event.type && (
                                                        <RouteTypeIcon type={event.type} className={twMerge(iconSizes.sm, "me-1")} />
                                                    )}
                                                    {`${event.type ? getRouteTypeLabel(event.type) : "Transaction"}${platformName && ` via ${platformName}`}`}
                                                    <SwapStatusIcon status={event.status} className={iconSizes.sm} />
                                                </div>
                                                <div className="flex flex-row flex-1 justify-end items-center text-muted-500 text-end">
                                                    {eventTxUrl && event.txHash ? (
                                                        <ExternalLink
                                                            href={eventTxUrl}
                                                            iconSize="xs"
                                                        >
                                                            <div className="hidden sm:inline-flex">{toShort(event.txHash)}</div>
                                                        </ExternalLink>
                                                    ) : event.txHash && toShort(event.txHash)}
                                                </div>
                                            </div>
                                            <div className="flex flex-col flex-1 w-full gap-1">
                                                <RouteEventTokenDetail
                                                    label="From"
                                                    chain={event.srcData.chain}
                                                    token={event.srcData.token}
                                                    amount={event.srcData.amount}
                                                />
                                                {event.dstData && (
                                                    <RouteEventTokenDetail
                                                        label="To"
                                                        chain={event.dstData.chain}
                                                        token={event.dstData.token}
                                                        amount={event.dstData.amount}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    </SlideInOut>
                                )
                            })}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </Page>
    )
}

export default SwapDetailPage
