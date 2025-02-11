"use client"

import { AnimatePresence, motion, Transition, Variants } from "motion/react"
import React, { useCallback, useEffect, useState } from "react"
import { twMerge } from "tailwind-merge"
import { parseUnits } from "viem"

import ApproxEqualIcon from "@/app/components/icons/ApproxEqualIcon"
import ChevronIcon from "@/app/components/icons/ChevronIcon"
import CoinsIcon from "@/app/components/icons/CoinsIcon"
import DifferenceIcon from "@/app/components/icons/DifferenceIcon"
import DurationIcon from "@/app/components/icons/DurationIcon"
import ExchangeRateIcon from "@/app/components/icons/ExchangeRateIcon"
import ReceiveIcon from "@/app/components/icons/ReceiveIcon"
import RouteTypeIcon from "@/app/components/icons/RouteTypeIcon"
import SendIcon from "@/app/components/icons/SendIcon"
import SlippageIcon from "@/app/components/icons/SlippageIcon"
import SwapStatusIcon from "@/app/components/icons/SwapStatusIcon"
//import TesseractIcon from "@/app/components/icons/TesseractIcon"
import { ChainImageInline } from "@/app/components/images/ChainImage"
import { PlatformImage } from "@/app/components/images/PlatformImage"
import { TokenImage } from "@/app/components/images/TokenImage"
import SwapParameter from "@/app/components/swap/SwapParameter"
import DecimalAmount from "@/app/components/ui/DecimalAmount"
import ExternalLink from "@/app/components/ui/ExternalLink"
import { TabContent, TabIndicator, TabsContainer, TabsList, TabTrigger } from "@/app/components/ui/Tabs"
import { Tooltip } from "@/app/components/ui/Tooltip"
import { NumberFormatType } from "@/app/config/numbers"
import { iconSizes, imgSizes } from "@/app/config/styling"
import { defaultSlippageBps, SwapStatus } from "@/app/config/swaps"
import usePreferences from "@/app/hooks/preferences/usePreferences"
import { getBlockExplorerLink } from "@/app/lib/chains"
import { formatDuration } from "@/app/lib/datetime"
import { bpsToPercent } from "@/app/lib/numbers"
import { toShort } from "@/app/lib/strings"
import { getRouteTypeLabel, getSwapEventPlatformData } from "@/app/lib/swaps"
import { getStatusLabel } from "@/app/lib/utils"
import { PreferenceType } from "@/app/types/preferences"
import { StyleDirection } from "@/app/types/styling"
import { RouteType, Swap } from "@/app/types/swaps"
import { ScrollText } from "lucide-react"

interface SwapEventSummaryProps extends React.ComponentPropsWithoutRef<"div"> {
    swap: Swap,
    index?: number,
    isReviewSwap?: boolean,
    animationProps?: React.ComponentPropsWithoutRef<typeof motion.div>,
}

const defaultTransition: Transition = {
    type: "spring",
    duration: 0.15,
}

const defaultEventAnimations: Variants = {
    initial: {
        y: "50%",
        opacity: 0,
    },
    animate: {
        y: 0,
        opacity: 1,
    },
    exit: {
        y: "50%",
        opacity: 0,
    },
}
const SwapEventAnimation = React.forwardRef<React.ComponentRef<typeof motion.div>, React.ComponentPropsWithoutRef<typeof motion.div>>(({
    initial = "initial",
    animate = "animate",
    exit = "exit",
    transition = defaultTransition,
    variants = defaultEventAnimations,
    layout = true,
    ...props
}, ref) => (
    <motion.div
        ref={ref}
        initial={initial}
        animate={animate}
        exit={exit}
        transition={transition}
        layout={layout}
        variants={variants}
        {...props}
    />
))
SwapEventAnimation.displayName = "SwapEventAnimation"

const SwapEventSummary = React.forwardRef<HTMLDivElement, SwapEventSummaryProps>(({
    className,
    swap,
    index,
    isReviewSwap = false,
    animationProps,
    ...props
}, ref) => {

    const { preferences } = usePreferences()
    const exchangeRate = isReviewSwap && swap.srcData.amount && swap.dstData?.amount ? (swap.dstData.amount * parseUnits("1", swap.srcData.token.decimals)) / swap.srcData.amount : undefined

    const statusTab = 100
    const defaultTab = swap.status === SwapStatus.Success || isReviewSwap ? statusTab.toString() : "0"
    const [eventTab, setEventTabState] = useState(defaultTab)

    const setEventTab = useCallback((tab: string) => {
        const tabIndex = parseInt(tab)
        setEventTabState(tabIndex === statusTab || swap.events.length > tabIndex ? tabIndex.toString() : defaultTab)
    }, [swap.events.length, setEventTabState, defaultTab])

    useEffect(() => {
        if (!isReviewSwap) {
            const eventIndex = swap.events.findLastIndex((event) => event.status === SwapStatus.Success)
            setEventTab(swap.status === SwapStatus.Success || eventIndex === -1 ? defaultTab : eventIndex.toString())
        }
    }, [swap.status, swap.events])

    const diffEstAmount = swap.estAmount && swap.dstData?.amount ? swap.dstData.amount - swap.estAmount : undefined

    const swapSrcTxUrl = !isReviewSwap && getBlockExplorerLink({
        chain: swap.srcData.chain,
        tx: swap.id,
    })
    const swapDstTxUrl = !isReviewSwap && swap.dstData && swap.status === SwapStatus.Success && getBlockExplorerLink({
        chain: swap.dstData.chain,
        tx: swap.hops[swap.hops.length - 1].txHash,
    })

    return swap.events.length > 0 && (
        <div
            ref={ref}
            className={twMerge("flex flex-col flex-1 gap-4 overflow-hidden", className)}
            {...props}
        >

            <TabsContainer
                value={eventTab}
                onValueChange={(tab) => setEventTab(tab)}
                className="gap-4"
            >
                <TabsList className="container flex flex-row flex-1 flex-wrap gap-2">
                    {swap.events.map((event, i) => {
                        const { platform, platformName } = getSwapEventPlatformData(event)
                        const eventKey = `${index ?? swap.id}-${i}`
                        return event.type && event.dstData && (
                            <React.Fragment key={eventKey}>
                                <TabTrigger
                                    key={eventKey}
                                    value={i.toString()}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <Tooltip
                                        trigger=<div className="flex flex-row flex-1 justify-center items-center">
                                            {eventTab === i.toString() && <TabIndicator />}
                                            {event.type === RouteType.Swap ? (<>
                                                <TokenImage token={event.srcData.token} size="xs" />
                                                <TokenImage token={event.dstData.token} size="xs" className="-ms-3" />
                                            </>) : (
                                                <ChainImageInline chain={event.dstData.chain} size="xs" />
                                            )}
                                        </div>
                                    >
                                        <div className="flex flex-row flex-1 gap-2 items-center">
                                            {`${getRouteTypeLabel(event.type)} ${event.type === RouteType.Swap ? `from ${event.srcData.token.symbol} to ${event.dstData.token.symbol}` : `to ${event.dstData.chain.name}`} ${platformName && `via ${platformName}`}`}
                                            {platform && <PlatformImage platform={platform} size="xs" />}
                                        </div>
                                    </Tooltip>
                                </TabTrigger>
                                <div className="flex flex-row flex-none items-center">
                                    <ChevronIcon direction={StyleDirection.Right} className={iconSizes.xs} />
                                </div>
                            </React.Fragment>
                        )
                    })}
                    <TabTrigger
                        key={`${index ?? swap.id}-swap-status}`}
                        value={statusTab.toString()}
                        className="contents"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Tooltip
                            trigger=<div className="group relative flex flex-row flex-1 p-2 justify-center items-center">
                                {eventTab.toString() === statusTab.toString() && <TabIndicator />}
                                <ScrollText className={`${eventTab.toString() === '100' ? 'text-black' : 'text-white'} transition-colors duration-300 font-bold`} style={{ strokeWidth: 1.5 }} />
                            </div>
                        >
                            {isReviewSwap && "Review "}{`${swap.type && getRouteTypeLabel(swap.type)} `}{!isReviewSwap && getStatusLabel(swap.status)}
                        </Tooltip>
                    </TabTrigger>
                </TabsList>
                <AnimatePresence mode="wait">
                    {swap.events.map((event, i) => {

                        const { platform, platformName } = getSwapEventPlatformData(event)
                        const eventTxUrl = getBlockExplorerLink({
                            chain: event.srcData.chain,
                            tx: event.txHash,
                        })

                        return eventTab === i.toString() && (
                            <SwapEventAnimation
                                key={`${index ?? swap.id}-${i}`}
                                {...animationProps}
                            >
                                <TabContent
                                    value={i.toString()}
                                    forceMount={true}
                                >
                                    <div className="container flex flex-col flex-1 p-4 gap-4">
                                        <div className="flex flex-row flex-1 gap-4 justify-between">
                                            <div className="group flex flex-row flex-none justify-start items-center gap-4 font-bold">
                                                {platform ? (
                                                    <PlatformImage
                                                        platform={platform}
                                                        size="xs"
                                                    />
                                                ) : (
                                                    <RouteTypeIcon
                                                        type={event.type}
                                                        className={imgSizes.xs}
                                                    />
                                                )}
                                                {`${event.type ? getRouteTypeLabel(event.type) : "Transaction"}${platformName && ` via ${platformName}`}`}
                                                {!isReviewSwap && <SwapStatusIcon status={event.status} className={iconSizes.sm} />}
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
                                            <div className="flex flex-row flex-1 justify-between">
                                                <div className="flex flex-row flex-none gap-4 items-center text-muted-500">
                                                    From
                                                </div>
                                                <div className="flex flex-row flex-1 gap-4 justify-end items-center font-bold text-end">
                                                    {event.type === RouteType.Bridge ? (<>
                                                        {event.srcData.chain.name}
                                                        <ChainImageInline chain={event.srcData.chain} size="xs" />
                                                    </>) : (<>
                                                        <DecimalAmount
                                                            amount={!isReviewSwap ? event.srcData.amount : undefined}
                                                            symbol={event.srcData.token.symbol}
                                                            token={event.srcData.token}
                                                            className="justify-end text-end"
                                                        />
                                                        <TokenImage token={event.srcData.token} size="xs" />
                                                    </>)}
                                                </div>
                                            </div>
                                            {event.dstData && (
                                                <div className="flex flex-row flex-1 justify-between">
                                                    <div className="flex flex-row flex-none gap-4 items-center text-muted-500">
                                                        To
                                                    </div>
                                                    <div className="flex flex-row flex-1 gap-4 justify-end items-center font-bold text-end">
                                                        {event.type === RouteType.Bridge ? (<>
                                                            {event.dstData.chain.name}
                                                            <ChainImageInline chain={event.dstData.chain} size="xs" />
                                                        </>) : (<>
                                                            <DecimalAmount
                                                                amount={!isReviewSwap ? event.dstData.amount : undefined}
                                                                symbol={event.dstData.token.symbol}
                                                                token={event.dstData.token}
                                                                className="justify-end text-end"
                                                            />
                                                            <TokenImage token={event.dstData.token} size="xs" />
                                                        </>)}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </TabContent>
                            </SwapEventAnimation>
                        )
                    })}
                    {eventTab === statusTab.toString() && (
                        <SwapEventAnimation
                            key={`${index ?? swap.id}-${statusTab}`}
                            {...animationProps}
                        >
                            <TabContent
                                value={statusTab.toString()}
                                forceMount={true}
                            >
                                <div className="container p-4">
                                    <div className="flex flex-col flex-1 gap-1">
                                        <SwapParameter
                                            icon=<SendIcon className={iconSizes.sm} />
                                            label={isReviewSwap ? "To send" : (<>
                                                Sent
                                                {swapSrcTxUrl && (
                                                    <ExternalLink
                                                        href={swapSrcTxUrl}
                                                        iconSize="xs"
                                                    />
                                                )}
                                            </>)}
                                            labelClass="gap-2"
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
                                            label={isReviewSwap ? "To receive" : (<>
                                                Received
                                                {swapDstTxUrl && (
                                                    <ExternalLink
                                                        href={swapDstTxUrl}
                                                        iconSize="xs"
                                                    />
                                                )}
                                            </>)}
                                            labelClass="gap-2"
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
                                            {!isReviewSwap && (diffEstAmount !== undefined || swap.status === SwapStatus.Pending) && (
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
                                        {isReviewSwap ? (<>
                                            <SwapParameter
                                                icon=<ExchangeRateIcon className={iconSizes.sm} />
                                                label="Exchange rate"
                                                value=<div className="contents font-mono text-base">
                                                    {swap.dstData && exchangeRate !== undefined ? (<>
                                                        1 {swap.srcData.token.symbol}&nbsp;
                                                        <ApproxEqualIcon className={iconSizes.xs} />&nbsp;
                                                        <DecimalAmount
                                                            amount={exchangeRate}
                                                            symbol={swap.dstData.token.symbol}
                                                            token={swap.dstData.token}
                                                            type={NumberFormatType.Precise}
                                                        />
                                                    </>) : "-"}
                                                </div>
                                            />
                                            <SwapParameter
                                                icon={<SlippageIcon className={iconSizes.sm} />}
                                                label="Max. slippage"
                                                value={`${bpsToPercent(preferences[PreferenceType.Slippage] ?? defaultSlippageBps)}%`}
                                                valueClass="font-mono text-base"
                                            />
                                        </>) : (
                                            <SwapParameter
                                                icon=<DurationIcon className={iconSizes.sm} />
                                                label="Duration"
                                                value={swap.duration !== undefined ? formatDuration(swap.duration) : "Pending"}
                                            />
                                        )}
                                    </div>
                                </div>
                            </TabContent>
                        </SwapEventAnimation>
                    )}
                </AnimatePresence>
            </TabsContainer>
        </div>
    )
})
SwapEventSummary.displayName = "SwapEventSummary"

export default SwapEventSummary
