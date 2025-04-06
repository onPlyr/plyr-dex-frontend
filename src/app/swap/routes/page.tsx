"use client"

import "@/app/styles/globals.css"

import { Variants } from "motion/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

import ScaleInOut from "@/app/components/animations/ScaleInOut"
import SlideInOut from "@/app/components/animations/SlideInOut"
import { defaultAnimations as slideInOutAnimations } from "@/app/components/animations/SlideInOut"
import { Page } from "@/app/components/ui/Page"
import SwapPreview from "@/app/components/swap/SwapPreview"
import useQuoteData from "@/app/hooks/quotes/useQuoteData"
import { PageType } from "@/app/types/navigation"

const routeAnimations: Variants = {
    initial: {
        ...slideInOutAnimations.right.initial,
        height: 0,
    },
    animate: {
        ...slideInOutAnimations.right.animate,
        height: "auto",
    },
    exit: {
        ...slideInOutAnimations.left.exit,
        height: 0,
    },
}

const RoutesPage = () => {

    const router = useRouter()
    const { useSwapQuotesData, selectedQuote, setSelectedQuote } = useQuoteData()
    const { data: quoteData } = useSwapQuotesData

    useEffect(() => {
        if (!quoteData || !quoteData.quotes.length) {
            router.push("/swap")
        }
    }, [router, quoteData])

    return (
        <Page
            key={PageType.Routes}
            header="Route Details"
            backUrl="/swap"
        >
            <ScaleInOut className="flex flex-col flex-none gap-4 w-full h-fit">
                {quoteData?.quotes.map((quote, i) => (
                    <SlideInOut
                        key={i}
                        from="right"
                        to="left"
                        animations={routeAnimations}
                        delays={{
                            animate: i * 0.1,
                            exit: (quoteData.quotes.length - 1 - i) * 0.1,
                        }}
                    >
                        <SwapPreview
                            key={quote.id}
                            swap={quote}
                            isSelected={quote.id === selectedQuote?.id}
                            onClick={setSelectedQuote.bind(this, quote)}
                        />
                    </SlideInOut>
                ))}
            </ScaleInOut>
        </Page>
    )
}

export default RoutesPage