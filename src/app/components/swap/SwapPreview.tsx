import Link from "next/link"
import React from "react"
import { twMerge } from "tailwind-merge"
import { formatUnits } from "viem"

import ChevronIcon from "@/app/components/icons/ChevronIcon"
import DurationIcon from "@/app/components/icons/DurationIcon"
import GasIcon from "@/app/components/icons/GasIcon"
import StepIcon from "@/app/components/icons/StepIcon"
import { ChainImageInline } from "@/app/components/images/ChainImage"
import { PlatformImage } from "@/app/components/images/PlatformImage"
import { TokenImage } from "@/app/components/images/TokenImage"
import TokenAmountValue, { InvalidTokenPriceTooltip } from "@/app/components/tokens/TokenAmountValue"
import DecimalAmount from "@/app/components/ui/DecimalAmount"
import { Tooltip } from "@/app/components/ui/Tooltip"
import { Bold } from "@/app/components/ui/Typography"
import { iconSizes } from "@/app/config/styling"
import useQuoteData from "@/app/hooks/quotes/useQuoteData"
import useTokens from "@/app/hooks/tokens/useTokens"
import { formatDuration } from "@/app/lib/datetime"
import { getPercentDifferenceFormatted } from "@/app/lib/numbers"
import { getPlatform } from "@/app/lib/platforms"
import { NumberFormatType } from "@/app/types/numbers"
import { StyleDirection } from "@/app/types/styling"
import { HopEvent, isSwapType, SwapQuote, SwapType, SwapTypeLabel } from "@/app/types/swaps"
import { isValidTokenAmount } from "@/app/types/tokens"

interface SwapPreviewProps extends React.ComponentPropsWithoutRef<"div"> {
    swap: SwapQuote,
    isSelected?: boolean,
    isSwapWidget?: boolean,
    isReviewPage?: boolean,
}

interface EventPreviewProps extends React.ComponentPropsWithoutRef<"div"> {
    event: HopEvent,
    isFinalEvent?: boolean,
}

const EventPreview = React.forwardRef<HTMLDivElement, EventPreviewProps>(({
    className,
    event,
    isFinalEvent,
    ...props
}, ref) => {

    const platform = getPlatform(event.adapter?.platform)
    const platformName = platform?.name ?? event.bridge ?? event.adapter?.name

    return (
        <div
            ref={ref}
            className={twMerge("contents", className)}
            {...props}
        >
            <Tooltip
                trigger=<div className="flex flex-row flex-1 gap-1 justify-center items-center normal-case">
                    {isSwapType(event.type) ? (<>
                        <TokenImage
                            token={event.srcData.token}
                            size="xs"
                        />
                        <TokenImage
                            token={event.dstData.token}
                            size="xs"
                            className="-ms-3" />
                    </>) : (
                        <ChainImageInline
                            chain={event.dstData.chain}
                            size="xs"
                        />
                    )}
                </div>
            >
                <div className="flex flex-row flex-1 items-center gap-2">
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
            {!isFinalEvent && (
                <ChevronIcon
                    direction={StyleDirection.Right}
                    className={iconSizes.xs}
                />
            )}
        </div>
    )
})
EventPreview.displayName = "EventPreview"

const SwapPreview = React.forwardRef<HTMLDivElement, SwapPreviewProps>(({
    className,
    swap,
    isSelected,
    isSwapWidget,
    isReviewPage,
    ...props
}, ref) => {

    const { useSwapQuotesData, swapMsgData } = useQuoteData()
    const { data: quoteData } = useSwapQuotesData
    const token = swap.dstData.token
    const dstAmountDiff = quoteData && swap.estDstAmount !== quoteData.maxDstAmount ? getPercentDifferenceFormatted(quoteData.maxDstAmount, swap.estDstAmount, token.decimals) : undefined
    const isNegativeDiff = dstAmountDiff !== undefined && parseFloat(dstAmountDiff) < 0
    const eventTypeData: [SwapType, number][] = []
    for (const type of Object.values(SwapType)) {
        const numEvents = swap.events.filter((event) => event.type === type).length
        if (numEvents > 0) {
            eventTypeData.push([type, numEvents])
        }
    }
    
    const { getNativeToken, useTokenPricesData } = useTokens()
    const { getAmountValue } = useTokenPricesData
    const nativeToken = getNativeToken(swap.srcData.chain.id)
    const gasFeeValue = nativeToken && getAmountValue(nativeToken, {
        amount: swap.estGasFee,
        formatted: formatUnits(swap.estGasFee, swap.srcData.chain.gasPriceExponent)
    })

    const preview = (
        <div
            ref={ref}
            className={twMerge(isSwapWidget ? "" : "container-select", "flex flex-col flex-1 p-6 gap-2", className)}
            data-selected={isSelected || isReviewPage}
            {...props}
        >
            <div className="flex flex-col flex-1 gap-4">
                <div className="flex flex-col sm:flex-row flex-1 gap-4">
                    <div className="flex flex-row flex-1 gap-4">
                        <div className="flex flex-col flex-none justify-center items-center">
                            <TokenImage token={token} />
                        </div>
                        <div className="flex flex-row flex-1 gap-2">
                            <div className="flex flex-col flex-none text-muted-500">
                                <div className="flex flex-row flex-1 items-end">
                                    Est.
                                </div>
                                <div className="flex flex-row flex-1 items-end">
                                    Min.
                                </div>
                            </div>
                            <div className="flex flex-col flex-1">
                                <div className="flex flex-row flex-1 gap-2 items-center">
                                    <DecimalAmount
                                        amount={swap.estDstAmount}
                                        symbol={token.symbol}
                                        token={token}
                                        type={NumberFormatType.Precise}
                                        className="font-bold text-lg"
                                    />
                                </div>
                                <div className="flex flex-row flex-1 gap-2 items-center">
                                    <DecimalAmount
                                        amount={swap.minDstAmount}
                                        symbol={token.symbol}
                                        token={token}
                                        type={NumberFormatType.Precise}
                                        className="text-muted-400"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-row shrink flex-wrap gap-2">
                        {dstAmountDiff !== undefined ? (
                            <Tooltip
                                trigger=<div className={twMerge("badge-label normal-case", isNegativeDiff ? "bg-error-500" : "bg-success-500")}>
                                    {dstAmountDiff} {token.symbol}
                                </div>
                            >
                                {isNegativeDiff ? (<>
                                    Gives you <Bold>{dstAmountDiff}</Bold> less <Bold>{token.symbol}</Bold> than the best available quote.
                                </>) : undefined}
                            </Tooltip>
                        ) : (
                            <Tooltip
                                trigger=<div className="badge-label bg-brand-purple-500">
                                    Best return
                                </div>
                            >
                                Gives you the most <Bold>{token.symbol}</Bold> for your <Bold>{swap.srcData.token.symbol}</Bold>.
                            </Tooltip>
                        )}
                        {quoteData && swap.estDuration === quoteData.minDuration && (
                            <Tooltip
                                trigger=<div className="badge-label bg-brand-light-blue-500">
                                    Fastest
                                </div>
                            >
                                Fastest possible route for your trade.
                            </Tooltip>
                        )}
                    </div>
                </div>
                <div className="flex flex-row flex-1 flex-wrap gap-2">
                    <Tooltip
                        trigger=<div className="label flex-1">
                            <GasIcon className={iconSizes.sm} />
                            <div className="flex flex-row items-center gap-2">
                                {nativeToken && gasFeeValue && isValidTokenAmount(gasFeeValue) ? (
                                    <TokenAmountValue
                                        className="text-white"
                                        token={nativeToken}
                                        amount={gasFeeValue}
                                        isAmountValue={true}
                                    />
                                ) : (
                                    <DecimalAmount
                                        amount={swap.estGasFee}
                                        symbol={swap.srcData.chain.nativeCurrency.symbol}
                                        decimals={swap.srcData.chain.nativeCurrency.decimals}
                                    />
                                )}
                                {!isValidTokenAmount(gasFeeValue) && <InvalidTokenPriceTooltip tokenSymbol={nativeToken?.symbol ?? swap.srcData.chain.nativeCurrency.symbol} />}
                            </div>
                        </div>
                    >
                        <DecimalAmount
                            amount={swap.estGasFee}
                            symbol={swap.srcData.chain.nativeCurrency.symbol}
                            decimals={swap.srcData.chain.nativeCurrency.decimals}
                            type={NumberFormatType.Precise}
                            className="font-bold"
                        />
                        &nbsp;estimated gas fees.
                    </Tooltip>
                    <Tooltip
                        trigger=<div className="label flex-1 normal-case">
                            <DurationIcon className={iconSizes.sm} />
                            {formatDuration(swap.estDuration)}
                        </div>
                    >
                        <Bold>{formatDuration(swap.estDuration)}</Bold> estimated time to completion.
                    </Tooltip>
                    <Tooltip
                        trigger=<div className="label flex-1 normal-case">
                            <StepIcon className={iconSizes.sm} />
                            {swap.events.length} {`Step${swap.events.length > 1 ? "s" : ""}`}
                        </div>
                    >
                        {eventTypeData.map(([type, count], i) => (
                            <div key={type}>
                                {i === eventTypeData.length - 1 && (<>&nbsp;</>)}<Bold>{count} x {SwapTypeLabel[type].toLowerCase()}</Bold>&nbsp;{i < eventTypeData.length - 1 ? "and" : `step${swap.events.length > 1 ? "s" : ""}.`}
                            </div>
                        ))}
                    </Tooltip>
                </div>
            </div>
            {!isReviewPage && (
                <div className="label flex-1 flex-1 flex-wrap p-2 gap-2">
                    {swap.events.map((event, i) => (
                        <EventPreview
                            key={i}
                            event={event}
                            isFinalEvent={i === swap.events.length - 1}
                        />
                    ))}
                </div>
            )}
        </div>
    )

    return isReviewPage || swapMsgData ? preview : <Link href={isSelected ? "/swap/review" : "/swap"}>{preview}</Link>
})
SwapPreview.displayName = "SwapPreview"

export default SwapPreview
