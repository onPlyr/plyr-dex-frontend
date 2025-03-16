"use client"

import Link from "next/link"
import React from "react"
import { twMerge } from "tailwind-merge"

import SwapQuotePreviewEventSummary from "@/app/components/swapQuotes/SwapQuotePreviewEventSummary"
import SwapQuotePreviewSummary from "@/app/components/swapQuotes/SwapQuotePreviewSummary"
import useQuoteData from "@/app/hooks/quotes/useQuoteData"
import { SwapQuote } from "@/app/types/swaps"

interface SwapQuotePreviewProps extends React.ComponentPropsWithoutRef<"div"> {
    quote: SwapQuote,
}

const SwapQuotePreview = React.forwardRef<HTMLDivElement, SwapQuotePreviewProps>(({
    className,
    quote,
    ...props
}, ref) => {

    const { useSwapQuotesData, selectedQuote, setSelectedQuote } = useQuoteData()
    const isSelected = quote.id === selectedQuote?.id

    return (
        <Link href={isSelected ? "/swap/review" : "/swap"}>
            <div
                ref={ref}
                className={twMerge("container-select flex flex-col flex-1 p-4 gap-2", className)}
                data-selected={isSelected}
                onClick={setSelectedQuote.bind(this, quote)}
                {...props}
            >
                <SwapQuotePreviewSummary
                    quote={quote}
                    quoteData={useSwapQuotesData.data}
                />
                <SwapQuotePreviewEventSummary quote={quote} />
            </div>
        </Link>
    )
})
SwapQuotePreview.displayName = "SwapQuotePreview"

export default SwapQuotePreview
