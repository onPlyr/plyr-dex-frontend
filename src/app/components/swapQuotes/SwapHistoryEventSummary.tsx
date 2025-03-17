"use client"

import { AnimatePresence, motion, Transition, Variants } from "motion/react"
import React, { useCallback, useEffect, useState } from "react"
import { twMerge } from "tailwind-merge"

import ApproxEqualIcon from "@/app/components/icons/ApproxEqualIcon"
import ChevronIcon from "@/app/components/icons/ChevronIcon"
import ConfettiIcon from "@/app/components/icons/ConfettiIcon"
import DurationIcon from "@/app/components/icons/DurationIcon"
import EditIcon from "@/app/components/icons/EditIcon"
import ErrorIcon from "@/app/components/icons/ErrorIcon"
import ExchangeRateIcon from "@/app/components/icons/ExchangeRateIcon"
import ReceiveIcon from "@/app/components/icons/ReceiveIcon"
import SendIcon from "@/app/components/icons/SendIcon"
import SlippageIcon from "@/app/components/icons/SlippageIcon"
import SpeedIcon from "@/app/components/icons/SpeedIcon"
import SwapStatusIcon from "@/app/components/icons/SwapStatusIcon"
import SwapTypeIcon from "@/app/components/icons/SwapTypeIcon"
import TesseractIcon from "@/app/components/icons/TesseractIcon"
import { ChainImageInline } from "@/app/components/images/ChainImage"
import { PlatformImage } from "@/app/components/images/PlatformImage"
import { TokenImage } from "@/app/components/images/TokenImage"
import SwapParameter from "@/app/components/swap/SwapParameter"
import AlertDetail, { AlertType } from "@/app/components/ui/AlertDetail"
import Button from "@/app/components/ui/Button"
import DecimalAmount from "@/app/components/ui/DecimalAmount"
import ExternalLink from "@/app/components/ui/ExternalLink"
import { TabContent, TabIndicator, TabsContainer, TabsList, TabTrigger } from "@/app/components/ui/Tabs"
import { Tooltip } from "@/app/components/ui/Tooltip"
import { iconSizes, imgSizes } from "@/app/config/styling"
import { SwapQuoteConfig } from "@/app/config/swaps"
import usePreferences from "@/app/hooks/preferences/usePreferences"
import { UseSwapSlippageReturnType } from "@/app/hooks/swap/useSwapSlippage"
import { getBlockExplorerLink } from "@/app/lib/chains"
import { formatDuration } from "@/app/lib/datetime"
import { bpsToPercent, getExchangeRate } from "@/app/lib/numbers"
import { toShort } from "@/app/lib/strings"
import { getHopEventPlatformData } from "@/app/lib/swaps"
import { getStatusLabel } from "@/app/lib/utils"
import { NumberFormatType } from "@/app/types/numbers"
import { PreferenceType, SlippageConfig } from "@/app/types/preferences"
import { StyleDirection } from "@/app/types/styling"
import { isEventHistory, isSwapHistory, isSwapType, isTransferType, isValidSwapQuote, Swap, SwapAction, SwapActionLabel, SwapStatus, SwapTypeLabel } from "@/app/types/swaps"

interface SwapHistoryEventSummaryProps extends React.ComponentPropsWithoutRef<"div"> {
    swap: Swap,
    useSwapSlippageData?: UseSwapSlippageReturnType,
    index?: number,
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

const SwapHistoryEventSummary = React.forwardRef<HTMLDivElement, SwapHistoryEventSummaryProps>(({
    className,
    swap,
    useSwapSlippageData,
    index,
    animationProps,
    ...props
}, ref) => {

    const { preferences } = usePreferences()
    const isHistory = isSwapHistory(swap)
    const isQuote = isValidSwapQuote(swap)
    const dstAmountDiff = isHistory && swap.dstAmount && swap.dstAmount - swap.minDstAmount
    const durationDiff = isHistory && swap.duration !== undefined && swap.estDuration - swap.duration

    const statusTab = 100
    const defaultTab = isQuote || swap.status === SwapStatus.Success || swap.status === SwapStatus.Error ? statusTab.toString() : "0"
    const [eventTab, setEventTabState] = useState(defaultTab)

    const setEventTab = useCallback((tab: string) => {
        const tabIndex = parseInt(tab)
        setEventTabState(tabIndex === statusTab || swap.events.length > tabIndex ? tabIndex.toString() : defaultTab)
    }, [swap.events.length, setEventTabState, defaultTab])

    useEffect(() => {
        if (isHistory) {
            const eventIndex = swap.events.findLastIndex((event) => event.status === SwapStatus.Success)
            setEventTab(swap.status === SwapStatus.Success || eventIndex === -1 ? defaultTab : eventIndex.toString())
        }
    }, [swap.status, swap.events])

    const swapSrcTxUrl = isHistory && getBlockExplorerLink({
        chain: swap.srcData.chain,
        tx: swap.txHash,
    })
    const swapDstTxUrl = isHistory && swap.dstTxHash && getBlockExplorerLink({
        chain: swap.dstData.chain,
        tx: swap.dstTxHash,
    })

    const exchangeRateData = getExchangeRate({
        srcToken: swap.srcData.token,
        srcAmount: swap.srcAmount,
        dstToken: swap.dstData.token,
        dstAmount: swap.dstAmount || swap.estDstAmount || swap.minDstAmount,
    })

    const [exchangeRate, setExchangeRate] = useState(exchangeRateData.exchangeRate)
    const [isInverseExchangeRate, setIsInverseExchangeRate] = useState(false)

    const switchExchangeRate = useCallback((isInverse: boolean) => {
        setExchangeRate(isInverse ? exchangeRateData.inverseRate : exchangeRateData.exchangeRate)
        setIsInverseExchangeRate(isInverse)
    }, [swap, exchangeRateData, setExchangeRate, setIsInverseExchangeRate])

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

                        const { platform, platformName } = getHopEventPlatformData(event)
                        const eventKey = `${index ?? swap.id}-${i}`
                        const eventHop = swap.hops.find((hop) => hop.index === event.hopIndex)

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
                                            {isSwapType(event.type) ? (<>
                                                <TokenImage token={event.srcData.token} size="xs" />
                                                <TokenImage token={event.dstData.token} size="xs" className="-ms-3" />
                                            </>) : (
                                                <ChainImageInline chain={event.dstData.chain} size="xs" />
                                            )}
                                        </div>
                                    >
                                        <div className="flex flex-row flex-1 gap-2 items-center">
                                            {`${SwapTypeLabel[event.type]} ${isSwapType(event.type) ? `from ${event.srcData.token.symbol} to ${event.dstData.token.symbol}` : `to ${event.dstData.chain.name}`} ${platformName && `via ${platformName}`}`}
                                            {platform && <PlatformImage platform={platform} size="xs" />}
                                        </div>
                                    </Tooltip>
                                    {eventHop && (eventHop.status === SwapStatus.Error || eventHop.error) && (
                                        <ErrorIcon className={twMerge("absolute top-0 end-0", iconSizes.sm)} highlight={true} />
                                    )}
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
                                <TesseractIcon />
                            </div>
                        >
                            {SwapTypeLabel[swap.type]} {isHistory && getStatusLabel(swap.status)}
                        </Tooltip>
                    </TabTrigger>
                </TabsList>
                <AnimatePresence mode="wait">
                    {swap.events.map((event, i) => {

                        const eventIsHistory = isEventHistory(event)
                        const eventHop = swap.hops.find((hop) => hop.index === event.hopIndex)
                        const { platform, platformName } = getHopEventPlatformData(event)
                        const eventTxUrl = isHistory && getBlockExplorerLink({
                            chain: event.srcData.chain,
                            tx: eventHop?.txHash,
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
                                    <div className="flex flex-col flex-1 gap-4">
                                        {eventHop && (eventHop.status === SwapStatus.Error || eventHop.error) && (
                                            <AlertDetail
                                                type={AlertType.Error}
                                                header={`${SwapTypeLabel[event.type]} Error`}
                                                msg={eventHop.error ?? `An unknown error was encountered confirming this ${SwapTypeLabel[event.type]}.`}
                                            />
                                        )}
                                        <div className="container flex flex-col flex-1 p-4 gap-4">
                                            <div className="flex flex-row flex-1 gap-4 justify-between">
                                                <div className="group flex flex-row flex-none justify-start items-center gap-4 font-bold">
                                                    {platform ? (
                                                        <PlatformImage
                                                            platform={platform}
                                                            size="xs"
                                                        />
                                                    ) : (
                                                        <SwapTypeIcon
                                                            type={event.type}
                                                            className={imgSizes.xs}
                                                        />
                                                    )}
                                                    {SwapTypeLabel[event.type]}{platformName && ` via ${platformName}`}
                                                    {eventIsHistory && <SwapStatusIcon status={event.status} className={iconSizes.sm} />}
                                                </div>
                                                <div className="flex flex-row flex-1 justify-end items-center text-muted-500 text-end">
                                                    {eventTxUrl && eventHop?.txHash ? (
                                                        <ExternalLink
                                                            href={eventTxUrl}
                                                            iconSize="xs"
                                                        >
                                                            <div className="hidden sm:inline-flex">{toShort(eventHop.txHash)}</div>
                                                        </ExternalLink>
                                                    ) : eventHop?.txHash && toShort(eventHop.txHash)}
                                                </div>
                                            </div>
                                            <div className="flex flex-col flex-1 w-full gap-1">
                                                <div className="flex flex-row flex-1 justify-between">
                                                    <div className="flex flex-row flex-none gap-4 items-center text-muted-500">
                                                        From
                                                    </div>
                                                    <div className="flex flex-row flex-1 gap-4 justify-end items-center font-bold text-end">
                                                        {isTransferType(event.type) ? (<>
                                                            {event.srcData.chain.name}
                                                            <ChainImageInline chain={event.srcData.chain} size="xs" />
                                                        </>) : (<>
                                                            <DecimalAmount
                                                                amount={eventIsHistory ? event.srcData.amount : undefined}
                                                                symbol={event.srcData.token.symbol}
                                                                token={event.srcData.token}
                                                                className="justify-end text-end"
                                                            />
                                                            <TokenImage token={event.srcData.token} size="xs" />
                                                        </>)}
                                                    </div>
                                                </div>
                                                <div className="flex flex-row flex-1 justify-between">
                                                    <div className="flex flex-row flex-none gap-4 items-center text-muted-500">
                                                        To
                                                    </div>
                                                    <div className="flex flex-row flex-1 gap-4 justify-end items-center font-bold text-end">
                                                        {isTransferType(event.type) ? (<>
                                                            {event.dstData.chain.name}
                                                            <ChainImageInline chain={event.dstData.chain} size="xs" />
                                                        </>) : (<>
                                                            <DecimalAmount
                                                                amount={eventIsHistory ? event.dstData.amount : undefined}
                                                                symbol={event.dstData.token.symbol}
                                                                token={event.dstData.token}
                                                                className="justify-end text-end"
                                                            />
                                                            <TokenImage token={event.dstData.token} size="xs" />
                                                        </>)}
                                                    </div>
                                                </div>
                                            </div>
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
                                            label=<>
                                                {SwapActionLabel[swap.type][isHistory ? SwapAction.Sent : SwapAction.Send]}
                                                {swapSrcTxUrl && (
                                                    <ExternalLink
                                                        href={swapSrcTxUrl}
                                                        iconSize="xs"
                                                    />
                                                )}
                                            </>
                                            labelClass="gap-2"
                                            value=<DecimalAmount
                                                amount={swap.srcAmount}
                                                symbol={swap.srcData.token.symbol}
                                                token={swap.srcData.token}
                                                type={NumberFormatType.Precise}
                                            />
                                            valueClass="font-mono text-base"
                                        />
                                        <SwapParameter
                                            icon=<ReceiveIcon className={iconSizes.sm} />
                                            label=<>
                                                {SwapActionLabel[swap.type][isHistory ? SwapAction.Received : SwapAction.Receive]}
                                                {swapDstTxUrl && (
                                                    <ExternalLink
                                                        href={swapDstTxUrl}
                                                        iconSize="xs"
                                                    />
                                                )}
                                            </>
                                            labelClass="gap-2"
                                            value={isQuote || (isHistory && swap.dstAmount) ? (
                                                <DecimalAmount
                                                    amount={isHistory ? swap.dstAmount : swap.minDstAmount}
                                                    symbol={swap.dstData.token.symbol}
                                                    token={swap.dstData.token}
                                                    type={NumberFormatType.Precise}
                                                />
                                            ) : swap.status === SwapStatus.Error ? "Error" : "Pending"}
                                            valueClass={twMerge("font-mono text-base", swap.status === SwapStatus.Error && "text-error-500")}
                                        />
                                        {isHistory && dstAmountDiff && dstAmountDiff > BigInt(0) && (
                                            <SwapParameter
                                                label="vs. estimate"
                                                labelClass="text-muted-500"
                                                value=<>
                                                    <DecimalAmount
                                                        amount={dstAmountDiff}
                                                        symbol={swap.dstData.token.symbol}
                                                        token={swap.dstData.token}
                                                        type={NumberFormatType.PreciseWithSign}
                                                        className="font-mono font-bold text-base text-success-500"
                                                    />
                                                    <ConfettiIcon className={iconSizes.sm} />
                                                </>
                                                valueClass="gap-2 text-success-500"
                                            />
                                        )}
                                        {isHistory ? (<>
                                            <SwapParameter
                                                icon=<DurationIcon className={iconSizes.sm} />
                                                label={`Duration${durationDiff ? " (vs. estimate)" : ""}`}
                                                value={swap.duration !== undefined ? (<>
                                                    {formatDuration(swap.duration)}
                                                    {durationDiff && (
                                                        <span className="inline-flex flex-row gap-2 items-center text-success-500">
                                                            ({formatDuration(durationDiff)} faster)
                                                            <SpeedIcon className={iconSizes.sm} />
                                                        </span>
                                                    )}
                                                </>) : swap.status === SwapStatus.Error ? "Error" : "Pending"}
                                                valueClass={twMerge("gap-2 font-mono text-base", swap.status === SwapStatus.Error && "text-error-500")}
                                            />
                                        </>) : (<>
                                            {exchangeRate && (
                                                <SwapParameter
                                                    icon=<ExchangeRateIcon className={iconSizes.sm} />
                                                    label="Exchange rate"
                                                    value=<Tooltip
                                                        trigger=<div
                                                            className="flex flex-row flex-none justify-end items-center cursor-pointer"
                                                            onClick={switchExchangeRate.bind(this, !isInverseExchangeRate)}
                                                        >
                                                            <div className="contents font-mono text-base">
                                                                1 {(isInverseExchangeRate ? swap.dstData : swap.srcData).token.symbol}&nbsp;
                                                                <ApproxEqualIcon className={iconSizes.xs} />&nbsp;
                                                                <DecimalAmount
                                                                    amount={exchangeRate}
                                                                    symbol={(isInverseExchangeRate ? swap.srcData : swap.dstData).token.symbol}
                                                                    token={(isInverseExchangeRate ? swap.srcData : swap.dstData).token}
                                                                    type={NumberFormatType.Precise}
                                                                />
                                                            </div>
                                                        </div>
                                                    >
                                                        Switch to {(isInverseExchangeRate ? swap.srcData : swap.dstData).token.symbol} to {(isInverseExchangeRate ? swap.dstData : swap.srcData).token.symbol} rate
                                                    </Tooltip>
                                                />
                                            )}
                                            <SwapParameter
                                                icon=<SlippageIcon className={iconSizes.sm} />
                                                label=<>
                                                    Max. slippage
                                                    {useSwapSlippageData && (
                                                        <Tooltip
                                                            trigger=<Button
                                                                label="Adjust slippage"
                                                                className={twMerge("icon-btn transition hover:text-white", useSwapSlippageData.showSlippage ? "text-white" : undefined)}
                                                                replaceClass={true}
                                                                onClick={useSwapSlippageData.setShowSlippage.bind(this, !useSwapSlippageData.showSlippage)}
                                                            >
                                                                <EditIcon className={iconSizes.xs} />
                                                            </Button>
                                                        >
                                                            Adjust slippage
                                                        </Tooltip>
                                                    )}
                                                </>
                                                labelClass="gap-4"
                                                value={bpsToPercent(preferences[PreferenceType.Slippage] ?? SlippageConfig.DefaultBps)}
                                                valueClass="font-mono text-base"
                                            />
                                            <SwapParameter
                                                icon=<TesseractIcon className={iconSizes.sm} />
                                                label="Fee"
                                                value={SwapQuoteConfig.TesseractFee ? bpsToPercent(SwapQuoteConfig.TesseractFee) : "FREE"}
                                                valueClass={twMerge("font-mono text-base", !SwapQuoteConfig.TesseractFee ? "text-success-500" : undefined)}
                                            />
                                        </>)}
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
SwapHistoryEventSummary.displayName = "SwapHistoryEventSummary"

export default SwapHistoryEventSummary