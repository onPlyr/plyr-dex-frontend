"use client"

import "@/app/styles/globals.css"

import { Variants } from "motion/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

import ScaleInOut from "@/app/components/animations/ScaleInOut"
import SlideInOut from "@/app/components/animations/SlideInOut"
import { defaultAnimations as slideInOutAnimations } from "@/app/components/animations/SlideInOut"
import SwapQuotePreview from "@/app/components/swapQuotes/SwapQuotePreview"
import { Page } from "@/app/components/ui/Page"
import { SwapTab } from "@/app/config/pages"
import useQuoteData from "@/app/hooks/quotes/useQuoteData"

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

    const { useSwapQuotesData: { data: quoteData } } = useQuoteData()
    const router = useRouter()

    useEffect(() => {
        if (!quoteData || quoteData.quotes.length === 0) {
            router.push("/swap")
        }
    }, [quoteData])

    return (
        <Page
            key={SwapTab.Routes}
            header="Route Details"
            backUrl="/swap"
        >
            <ScaleInOut className="flex flex-col flex-none gap-4 w-full h-fit">
                {quoteData && quoteData.quotes.length > 0 && quoteData.quotes.map((quote, i) => (
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
                        <SwapQuotePreview
                            key={quote.id}
                            quote={quote}
                        />
                    </SlideInOut>
                ))}
            </ScaleInOut>
        </Page>
    )
}

export default RoutesPage