"use client"

import { AnimatePresence, LayoutGroup, motion } from "motion/react"
import React, { useCallback, useEffect, useMemo, useState } from "react"
import { twMerge } from "tailwind-merge"
import { formatUnits } from "viem"

import ApproxEqualIcon from "@/app/components/icons/ApproxEqualIcon"
import ChevronIcon from "@/app/components/icons/ChevronIcon"
import CoinsIcon from "@/app/components/icons/CoinsIcon"
import ConfettiIcon from "@/app/components/icons/ConfettiIcon"
import DurationIcon from "@/app/components/icons/DurationIcon"
import EditIcon from "@/app/components/icons/EditIcon"
import ErrorIcon from "@/app/components/icons/ErrorIcon"
import ExchangeRateIcon from "@/app/components/icons/ExchangeRateIcon"
import ReceiveIcon from "@/app/components/icons/ReceiveIcon"
import RecipientIcon from "@/app/components/icons/RecipientIcon"
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
import TokenBalance from "@/app/components/tokens/TokenBalance"
import AlertDetail, { AlertType } from "@/app/components/ui/AlertDetail"
import Button from "@/app/components/ui/Button"
import DecimalAmount from "@/app/components/ui/DecimalAmount"
import ExternalLink from "@/app/components/ui/ExternalLink"
import { TabContent, TabIndicator, TabsContainer, TabsList, TabTrigger } from "@/app/components/ui/Tabs"
import { Tooltip } from "@/app/components/ui/Tooltip"
import { Bold } from "@/app/components/ui/Typography"
import { iconSizes, imgSizes } from "@/app/config/styling"
import usePreferences from "@/app/hooks/preferences/usePreferences"
import { UseSwapRecipientReturnType } from "@/app/hooks/swap/useSwapRecipient"
import { UseSwapSlippageReturnType } from "@/app/hooks/swap/useSwapSlippage"
import useTokens from "@/app/hooks/tokens/useTokens"
import { getBlockExplorerLink } from "@/app/lib/chains"
import { formatDuration } from "@/app/lib/datetime"
import { bpsToPercent, getExchangeRate } from "@/app/lib/numbers"
import { toShort } from "@/app/lib/strings"
import { getHopEventPlatformData, getSwapFeeTokenData } from "@/app/lib/swaps"
import { getStatusLabel } from "@/app/lib/utils"
import { NumberFormatType } from "@/app/types/numbers"
import { Platform } from "@/app/types/platforms"
import { PreferenceType } from "@/app/types/preferences"
import { StyleDirection } from "@/app/types/styling"
import { Hop, HopEvent, isEventHistory, isRollbackHop, isSwapHistory, isSwapType, isTransferType, isValidSwapQuote, Swap, SwapAction, SwapActionLabel, SwapFeeTokenData, SwapId, SwapStatus, SwapTypeLabel } from "@/app/types/swaps"
import PlyrSwapBlackIcon from "../icons/PlyrSwapBlackIcon"

type SummaryTabKey = `${SwapId}-summary`
type EventTabKey = `${number}-${number}`
type TabKey = SummaryTabKey | EventTabKey
type TabIndicatorLayoutId = `${SwapId}-tab-indicator`

interface EventTabData {
    key: TabKey,
    event: HopEvent,
    hop?: Hop,
    platform?: Platform,
    platformName?: string,
    txUrl?: string,
    rollbackTxUrl?: string,
}
type EventTabDataMap = Map<TabKey, EventTabData>

interface SwapEventTabsProps extends React.ComponentPropsWithoutRef<"div"> {
    swap: Swap,
    useSwapRecipientData?: UseSwapRecipientReturnType,
    useSwapSlippageData?: UseSwapSlippageReturnType,
}

interface AnimatedTabContentProps extends React.ComponentPropsWithoutRef<typeof motion.div> {
    tabName: string,
    tabContentProps?: Omit<React.ComponentPropsWithoutRef<typeof TabContent>, "value">,
}

interface EventTabContentProps extends React.ComponentPropsWithoutRef<"div"> {
    data: EventTabData,
}

interface SummaryTabContentProps extends React.ComponentPropsWithoutRef<"div"> {
    swap: Swap,
    isHistory: boolean,
    isQuote: boolean,
    swapSrcTxUrl?: string,
    swapDstTxUrl?: string,
    dstAmountDiff?: bigint,
    durationDiff?: number,
    exchangeRate: bigint,
    isInverseExchangeRate: boolean,
    switchExchangeRate: (isInverse: boolean) => void,
    slippage: number,
    swapFees?: SwapFeeTokenData[],
    useSwapRecipientData?: UseSwapRecipientReturnType,
    useSwapSlippageData?: UseSwapSlippageReturnType,
}

const AnimatedTabContent = React.forwardRef<React.ComponentRef<typeof motion.div>, AnimatedTabContentProps>(({
    className,
    tabName,
    tabContentProps = {
        forceMount: true,
        asChild: true,
    },
    initial = "initial",
    animate = "animate",
    exit = "exit",
    layout = true,
    transition = {
        type: "tween",
        duration: 0.2,
        ease: "easeInOut",
    },
    variants = {
        initial: {
            y: "10%",
            opacity: 0,
            filter: "blur(4px)",
        },
        animate: {
            y: 0,
            opacity: 1,
            filter: "blur(0px)",
        },
        exit: {
            y: "10%",
            opacity: 0,
            filter: "blur(4px)",
        },
    },
    ...props
}, ref) => (
    <TabContent
        value={tabName}
        {...tabContentProps}
    >
        <motion.div
            ref={ref}
            className={twMerge("overflow-hidden", className)}
            initial={initial}
            animate={animate}
            exit={exit}
            layout={layout}
            transition={transition}
            variants={variants}
            {...props}
        />
    </TabContent>
))
AnimatedTabContent.displayName = "AnimatedTabContent"

const EventTabContent = React.forwardRef<React.ComponentRef<typeof TabContent>, EventTabContentProps>(({
    className,
    data,
    ...props
}, ref) => {

    const { event, hop, platform, platformName, txUrl } = data
    const isHistory = isEventHistory(event)

    return (
        <div
            ref={ref}
            className={twMerge("flex flex-col flex-1 gap-4", className)}
            {...props}
        >
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
                    {isHistory && <SwapStatusIcon status={event.status} className={iconSizes.sm} />}
                </div>
                <div className="flex flex-row flex-1 justify-end items-center text-muted-500 text-end">
                    {txUrl && hop?.txHash ? (
                        <ExternalLink
                            href={txUrl}
                            iconSize="xs"
                        >
                            <div className="hidden sm:inline-flex">{toShort(hop.txHash)}</div>
                        </ExternalLink>
                    ) : hop?.txHash && toShort(hop.txHash)}
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
                                amount={isHistory ? event.srcData.amount : undefined}
                                symbol={event.srcData.token.symbol}
                                token={event.srcData.token}
                                className="font-mono text-base"
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
                                amount={isHistory ? event.dstData.amount : undefined}
                                symbol={event.dstData.token.symbol}
                                token={event.dstData.token}
                                className="font-mono text-base"
                            />
                            <TokenImage token={event.dstData.token} size="xs" />
                        </>)}
                    </div>
                </div>
            </div>
        </div>
    )
})
EventTabContent.displayName = "EventTabContent"

const SummaryTabContent = React.forwardRef<React.ComponentRef<typeof TabContent>, SummaryTabContentProps>(({
    className,
    swap,
    isHistory,
    isQuote,
    swapSrcTxUrl,
    swapDstTxUrl,
    dstAmountDiff,
    durationDiff,
    exchangeRate,
    isInverseExchangeRate,
    switchExchangeRate,
    slippage,
    swapFees,
    useSwapRecipientData,
    useSwapSlippageData,
    ...props
}, ref) => (
    <div
        ref={ref}
        className={twMerge("flex flex-col flex-1 gap-1", className)}
        {...props}
    >
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
        {isHistory && dstAmountDiff && (
            <SwapParameter
                icon=<CoinsIcon className={iconSizes.sm} />
                label="Amount extra"
                value=<>
                    <DecimalAmount
                        amount={dstAmountDiff}
                        symbol={swap.dstData.token.symbol}
                        token={swap.dstData.token}
                        type={NumberFormatType.PreciseWithSign}
                        className="font-mono font-bold text-base text-success-500"
                        symbolClass="text-white"
                    />
                    <ConfettiIcon className={iconSizes.sm} />
                </>
                valueClass="gap-2"
            />
        )}
        {isHistory ? (<>
            <SwapParameter
                icon=<DurationIcon className={iconSizes.sm} />
                label={`Duration${durationDiff ? " (vs. estimate)" : ""}`}
                value={swap.duration !== undefined ? (<>
                    {formatDuration(swap.duration)}
                    {durationDiff ? (
                        <span className="inline-flex flex-row gap-2 items-center text-success-500">
                            ({formatDuration(durationDiff)} faster)
                            <SpeedIcon className={twMerge(iconSizes.sm, "text-white")} />
                        </span>
                    ) : undefined}
                </>) : swap.status === SwapStatus.Error ? "Error" : "Pending"}
                valueClass={twMerge("gap-2 font-mono text-base", swap.status === SwapStatus.Error && "text-error-500")}
            />
        </>) : (<>
            {exchangeRate && exchangeRate > BigInt(0) ? (
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
            ) : undefined}
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
                value={bpsToPercent(slippage)}
                valueClass="font-mono text-base"
            />
            {/* <SwapParameter
                icon=<RecipientIcon className={iconSizes.sm} />
                label=<>
                    Recipient
                    {useSwapRecipientData && (
                        <Tooltip
                            trigger=<Button
                                label="Adjust slippage"
                                className={twMerge("icon-btn transition hover:text-white", useSwapRecipientData.showRecipient ? "text-white" : undefined)}
                                replaceClass={true}
                                onClick={useSwapRecipientData.setShowRecipient.bind(this, !useSwapRecipientData.showRecipient)}
                            >
                                <EditIcon className={iconSizes.xs} />
                            </Button>
                        >
                            Send to a different address
                        </Tooltip>
                    )}
                </>
                labelClass="gap-4"
                value={swap.recipientAddress ? toShort(swap.recipientAddress) : "0x..."}
                valueClass={twMerge("font-mono text-base", !swap.recipientAddress ? "text-muted-500" : undefined)}
            /> */}
            {swapFees?.map((data, i) => (
                <SwapParameter
                    key={data.type}
                    icon={i === 0 && <TesseractIcon className={iconSizes.sm} />}
                    label={i === 0 && "Protocol fee"}
                    value=<TokenBalance
                        symbol={data.symbol}
                        decimals={data.decimals}
                        balance={{
                            amount: data.amount,
                            formatted: formatUnits(data.amount, data.decimals)
                        }}
                    />
                    valueClass="font-mono text-base"
                />
            ))}
        </>)}
    </div>
))
SummaryTabContent.displayName = "SummaryTabContent"

const getSummaryTabKey = (swap: Swap): SummaryTabKey => `${swap.id}-summary`
const getEventTabKey = (event: HopEvent): EventTabKey => `${event.hopIndex}-${event.index}`
const getDefaultTab = (eventTabData: EventTabDataMap, summaryTabKey: SummaryTabKey, isHistory: boolean): TabKey => (isHistory && Array.from(eventTabData.values()).find((data) => data.event.status !== SwapStatus.Success)?.key) || summaryTabKey
const getTabIndicatorLayoutId = (swap: Swap): TabIndicatorLayoutId => `${swap.id}-tab-indicator`

const SwapEventTabs = React.forwardRef<HTMLDivElement, SwapEventTabsProps>(({
    className,
    swap,
    useSwapRecipientData,
    useSwapSlippageData,
    ...props
}, ref) => {

    const { getPreference } = usePreferences()
    const { getNativeToken } = useTokens()
    const slippage = useMemo(() => getPreference(PreferenceType.Slippage), [getPreference])
    const swapFees = useMemo(() => getSwapFeeTokenData(swap, getNativeToken), [swap, getNativeToken])
    const isHistory = isSwapHistory(swap)

    const { isQuote, dstAmountDiff, durationDiff, summaryTabKey, tabIndicatorLayoutId, swapSrcTxUrl, swapDstTxUrl, exchangeRateData } = useMemo(() => {
        return {
            isHistory: isHistory,
            isQuote: isValidSwapQuote(swap),
            dstAmountDiff: isHistory && swap.dstAmount && swap.dstAmount > swap.minDstAmount ? swap.dstAmount - swap.minDstAmount : undefined,
            durationDiff: isHistory && swap.duration !== undefined && swap.estDuration > swap.duration ? swap.estDuration - swap.duration : undefined,
            summaryTabKey: getSummaryTabKey(swap),
            tabIndicatorLayoutId: getTabIndicatorLayoutId(swap),
            swapSrcTxUrl: isHistory ? getBlockExplorerLink({
                chain: swap.srcData.chain,
                tx: swap.txHash,
            }) : undefined,
            swapDstTxUrl: isHistory && swap.dstTxHash ? getBlockExplorerLink({
                chain: swap.dstData.chain,
                tx: swap.dstTxHash,
            }) : undefined,
            exchangeRateData: getExchangeRate({
                srcToken: swap.srcData.token,
                srcAmount: swap.srcAmount,
                dstToken: swap.dstData.token,
                dstAmount: swap.dstAmount || swap.estDstAmount || swap.minDstAmount,
            }),
        }
    }, [swap, isHistory])

    const [exchangeRate, setExchangeRate] = useState(exchangeRateData.exchangeRate)
    const [isInverseExchangeRate, setIsInverseExchangeRate] = useState(false)
    const switchExchangeRate = useCallback((isInverse: boolean) => {
        setExchangeRate(isInverse ? exchangeRateData.inverseRate : exchangeRateData.exchangeRate)
        setIsInverseExchangeRate(isInverse)
    }, [exchangeRateData, setExchangeRate, setIsInverseExchangeRate])

    const eventTabData: EventTabDataMap = useMemo(() => new Map(swap.events.map((event) => {

        const key = getEventTabKey(event)
        const hop = swap.hops.find((hop) => hop.index === event.hopIndex)
        const isRollback = hop && isRollbackHop(hop)
        const prevHop = isRollback ? swap.hops.find((data) => data.index === hop.index - 1) : undefined
        const { platform, platformName } = getHopEventPlatformData(event)

        return [key, {
            key: key,
            event: event,
            hop: hop,
            platform: platform,
            platformName: platformName,
            txUrl: hop && getBlockExplorerLink({
                chain: event.srcData.chain,
                tx: hop.txHash,
            }),
            rollbackTxUrl: isRollback && prevHop ? getBlockExplorerLink({
                chain: prevHop.srcData.chain,
                tx: hop.rollbackData.txHash,
            }) : undefined,
        }]

    })), [swap.hops, swap.events])

    const latestTab = useMemo(() => getDefaultTab(eventTabData, summaryTabKey, isHistory), [eventTabData, summaryTabKey, isHistory])
    const [tab, setTab] = useState(latestTab)

    useEffect(() => {
        if (isHistory) {
            setTab(latestTab)
        }
    }, [isHistory, latestTab, setTab])

    const selectedEventTabData = useMemo(() => eventTabData.get(tab), [eventTabData, tab])

    return swap.events.length && (
        <div
            ref={ref}
            className={twMerge("flex flex-col flex-1 gap-4 overflow-hidden", className)}
            {...props}
        >
            <LayoutGroup>
                <TabsContainer
                    value={tab}
                    onValueChange={(tab) => setTab(tab as TabKey)}
                    className="gap-4"
                >
                    <TabsList className="container flex flex-row flex-1 flex-wrap gap-2">
                        {Array.from(eventTabData.entries()).map(([key, { event, hop, platform, platformName }]) => (
                            <React.Fragment key={key}>
                                <TabTrigger
                                    key={key}
                                    value={key}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <Tooltip
                                        trigger=<div className="flex flex-row flex-1 justify-center items-center">
                                            {tab === key && <TabIndicator layoutId={tabIndicatorLayoutId} />}
                                            {isSwapType(event.type) ? (<>
                                                <TokenImage token={event.srcData.token} size="xs" />
                                                <TokenImage token={event.dstData.token} size="xs" className="-ms-3" />
                                            </>) : (
                                                <ChainImageInline chain={event.dstData.chain} size="xs" />
                                            )}
                                        </div>
                                    >
                                        <div className="flex flex-row flex-1 gap-2 items-center">
                                            {SwapTypeLabel[event.type]}&nbsp;
                                            {isSwapType(event.type) ? (<>
                                                from <Bold>{event.srcData.token.symbol}</Bold> to <Bold>{event.dstData.token.symbol}</Bold>
                                            </>) : (<>
                                                to <Bold>{event.dstData.chain.name}</Bold>
                                            </>)}
                                            {platformName && (<>
                                                &nbsp;via <Bold>{platformName}</Bold>
                                            </>)}
                                            {platform && (
                                                <PlatformImage
                                                    platform={platform}
                                                    size="xs"
                                                />
                                            )}
                                        </div>
                                    </Tooltip>
                                    {hop && (hop.error || hop.status === SwapStatus.Error) && (
                                        <ErrorIcon className={twMerge("absolute top-0 end-0", iconSizes.sm)} highlight={true} />
                                    )}
                                </TabTrigger>
                                <div className="flex flex-row flex-none items-center">
                                    <ChevronIcon direction={StyleDirection.Right} className={iconSizes.xs} />
                                </div>
                            </React.Fragment>
                        ))}
                        <TabTrigger
                            key={summaryTabKey}
                            value={summaryTabKey}
                            className="contents"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Tooltip
                                trigger=<div className="group relative flex flex-row flex-1 p-2 justify-center items-center">
                                    {tab === summaryTabKey && <TabIndicator layoutId={tabIndicatorLayoutId} />}
                                    <PlyrSwapBlackIcon />
                                </div>
                            >
                                {SwapTypeLabel[swap.type]} {isHistory && getStatusLabel(swap.status)}
                            </Tooltip>
                        </TabTrigger>
                    </TabsList>
                    <div className="container flex flex-col flex-1 p-4">
                        <AnimatePresence mode="wait">
                            <AnimatedTabContent
                                key={tab}
                                tabName={tab}
                            >
                                {selectedEventTabData ? (
                                    <EventTabContent data={selectedEventTabData} />
                                ) : (
                                    <SummaryTabContent
                                        swap={swap}
                                        isHistory={isHistory}
                                        isQuote={isQuote}
                                        swapSrcTxUrl={swapSrcTxUrl}
                                        swapDstTxUrl={swapDstTxUrl}
                                        dstAmountDiff={dstAmountDiff}
                                        durationDiff={durationDiff}
                                        exchangeRate={exchangeRate}
                                        isInverseExchangeRate={isInverseExchangeRate}
                                        switchExchangeRate={switchExchangeRate}
                                        slippage={slippage}
                                        swapFees={swapFees}
                                        useSwapRecipientData={useSwapRecipientData}
                                        useSwapSlippageData={useSwapSlippageData}
                                    />
                                )}
                            </AnimatedTabContent>
                        </AnimatePresence>
                    </div>
                    {selectedEventTabData && selectedEventTabData.hop && (selectedEventTabData.hop.error || selectedEventTabData.hop.status === SwapStatus.Error) && (
                        <AlertDetail
                            type={AlertType.Error}
                            header={`${SwapTypeLabel[selectedEventTabData.event.type]} Error`}
                            msg=<>
                                {selectedEventTabData.hop.error ?? `An unknown error was encountered confirming this ${SwapTypeLabel[selectedEventTabData.event.type]}.`}
                                {selectedEventTabData.rollbackTxUrl && (<>
                                    &nbsp;<ExternalLink
                                        href={selectedEventTabData.rollbackTxUrl}
                                        iconSize="xs"
                                    >
                                        View tx
                                    </ExternalLink>
                                </>)}
                            </>
                        />
                    )}
                </TabsContainer>
            </LayoutGroup>
        </div>
    )
})
SwapEventTabs.displayName = "SwapEventTabs"

export default SwapEventTabs