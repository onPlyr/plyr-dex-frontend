"use client"

import { Variants } from "motion/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

import "@/app/styles/globals.css"

import ScaleInOut from "@/app/components/animations/ScaleInOut"
import SlideInOut from "@/app/components/animations/SlideInOut"
import { defaultAnimations as slideInOutAnimations } from "@/app/components/animations/SlideInOut"
import SwapSummary from "@/app/components/swap/SwapSummary"
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

    const { routes } = useQuoteData()
    const router = useRouter()
    useEffect(() => {
        if (!routes || routes.length === 0) {
            router.push("/swap")
        }
    }, [routes])

    return (
        <Page
            key={SwapTab.Routes}
            header="Route Details"
            backUrl="/swap"
        >
            <ScaleInOut className="flex flex-col flex-none gap-4 w-full h-fit">
                {routes && routes.length > 0 && routes.map((route, i) => (
                    <SlideInOut
                        key={i}
                        from="right"
                        to="left"
                        animations={routeAnimations}
                        delays={{
                            animate: i * 0.1,
                            exit: (routes.length - 1 - i) * 0.1,
                        }}
                    >
                        <SwapSummary
                            route={route}
                            index={i}
                            hideEventSummary={true}
                            showFullEvents={true}
                            backUrl="/swap"
                        />
                    </SlideInOut>
                ))}
            </ScaleInOut>
        </Page>
    )
}

export default RoutesPage
