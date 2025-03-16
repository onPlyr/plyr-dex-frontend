import * as React from "react"
import { twMerge } from "tailwind-merge"

import DurationIcon from "@/app/components/icons/DurationIcon"
import GasIcon from "@/app/components/icons/GasIcon"
import StepIcon from "@/app/components/icons/StepIcon"
import { TokenImage } from "@/app/components/images/TokenImage"
import DecimalAmount from "@/app/components/ui/DecimalAmount"
import { Tooltip } from "@/app/components/ui/Tooltip"
import { iconSizes } from "@/app/config/styling"
import { formatDuration } from "@/app/lib/datetime"
import { getPercentDifferenceFormatted } from "@/app/lib/numbers"
import { NumberFormatType } from "@/app/types/numbers"
import { SwapQuote, SwapQuoteData, SwapType, SwapTypeLabel } from "@/app/types/swaps"

interface SwapQuotePreviewSummaryProps extends React.ComponentPropsWithoutRef<"div"> {
    quote: SwapQuote,
    quoteData?: SwapQuoteData,
}

const SwapQuotePreviewSummary = React.forwardRef<HTMLDivElement, SwapQuotePreviewSummaryProps>(({
    className,
    quote,
    quoteData,
    ...props
}, ref) => {

    const token = quote.dstData.token
    const dstAmountDiff = quoteData && quote.estDstAmount !== quoteData.maxDstAmount ? getPercentDifferenceFormatted(quoteData.maxDstAmount, quote.estDstAmount, token.decimals) : undefined
    const isNegativeDiff = dstAmountDiff !== undefined && parseFloat(dstAmountDiff) < 0
    const eventTypeData: [SwapType, number][] = []
    for (const type of Object.values(SwapType)) {
        const numEvents = quote.events.filter((event) => event.type === type).length
        if (numEvents > 0) {
            eventTypeData.push([type, numEvents])
        }
    }

    return (
        <div
            ref={ref}
            className={twMerge("flex flex-col flex-1 gap-4", className)}
            {...props}
        >
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
                                    amount={quote.estDstAmount}
                                    symbol={token.symbol}
                                    token={token}
                                    type={NumberFormatType.Precise}
                                    className="font-bold text-lg"
                                />
                            </div>
                            <div className="flex flex-row flex-1 gap-2 items-center">
                                <DecimalAmount
                                    amount={quote.minDstAmount}
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
                            {isNegativeDiff && `This route is estimated to return ${dstAmountDiff} less ${token.symbol} then the highest quote found.`}
                        </Tooltip>
                    ) : (
                        <Tooltip
                            trigger=<div className="badge-label bg-brand-purple-500">
                                Best return
                            </div>
                        >
                            This route is estimated to return the largest amount of {token.symbol} for your {token.symbol}.
                        </Tooltip>
                    )}
                    {quoteData && quote.estDuration === quoteData.minDuration && (
                        <Tooltip
                            trigger=<div className="badge-label bg-brand-light-blue-500">
                                Fastest
                            </div>
                        >
                            This route is estimated to be completed in the shortest amount of time.
                        </Tooltip>
                    )}
                </div>
            </div>
            <div className="flex flex-row flex-1 flex-wrap gap-2">
                <Tooltip
                    trigger=<div className="label flex-1">
                        <GasIcon className={iconSizes.sm} />
                        <DecimalAmount
                            amount={quote.estGasFee}
                            symbol={quote.srcData.chain.nativeCurrency.symbol}
                            decimals={quote.srcData.chain.gasPriceExponent}
                        />
                    </div>
                >
                    <DecimalAmount
                        amount={quote.estGasFee}
                        symbol={quote.srcData.chain.nativeCurrency.symbol}
                        decimals={quote.srcData.chain.gasPriceExponent}
                        type={NumberFormatType.Precise}
                        className="font-bold"
                    />
                    &nbsp;estimated gas fees.
                </Tooltip>
                <Tooltip
                    trigger=<div className="label flex-1 normal-case">
                        <DurationIcon className={iconSizes.sm} />
                        {formatDuration(quote.estDuration)}
                    </div>
                >
                    <span className="font-bold">{formatDuration(quote.estDuration)}</span>&nbsp;estimated time to completion.
                </Tooltip>
                <Tooltip
                    trigger=<div className="label flex-1 normal-case">
                        <StepIcon className={iconSizes.sm} />
                        {quote.events.length} {`Step${quote.events.length > 1 ? "s" : ""}`}
                    </div>
                >
                    {eventTypeData.map(([type, count], i) => (
                        <div key={type}>
                            {i === eventTypeData.length - 1 && (<>&nbsp;</>)}<span className="font-bold">{count} x {SwapTypeLabel[type]}</span>&nbsp;{i < eventTypeData.length - 1 ? "and" : `step${quote.events.length > 1 ? "s" : ""}.`}
                        </div>
                    ))}
                </Tooltip>
            </div>
        </div>
    )
})
SwapQuotePreviewSummary.displayName = "SwapQuotePreviewSummary"

export default SwapQuotePreviewSummary
