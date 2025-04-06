"use client"

import { AnimatePresence } from "motion/react"
import Link from "next/link"
import { useConnectModal } from "@rainbow-me/rainbowkit"
import React, { useMemo } from "react"
import { twMerge } from "tailwind-merge"
import { useAccount } from "wagmi"

import SwapWidgetAnimation from "@/app/components/swap/SwapWidgetAnimation"
import Button from "@/app/components/ui/Button"
import useQuoteData from "@/app/hooks/quotes/useQuoteData"

const SwapButton = React.forwardRef<React.ComponentRef<typeof Button>, React.ComponentPropsWithoutRef<typeof Button>>(({
    className,
    disabled = false,
    ...props
}, ref) => {

    const { isConnected } = useAccount()
    const { openConnectModal } = useConnectModal()
    const { swapMsgData } = useQuoteData()
    const { msg, isDisabled, isReview } = useMemo(() => {

        const isDisabled = isConnected && !swapMsgData?.isConnectAccountError && (disabled || !!swapMsgData)
        const isReview = isConnected && !isDisabled

        return {
            msg: swapMsgData ? swapMsgData.type : !isConnected ? "Connect" : "Review",
            isDisabled: isDisabled,
            isReview: isReview,
        }

    }, [disabled, isConnected, swapMsgData])

    return (
        <Button
            ref={ref}
            className={twMerge("gradient-btn", className)}
            onClick={!isConnected ? openConnectModal?.bind(this) : undefined}
            disabled={isDisabled}
            isAnimated={true}
            animate={{
                filter: isDisabled ? "grayscale(1)" : "grayscale(0)",
                transition: {
                    type: "tween",
                    duration: 0.5,
                    ease: "easeInOut",
                },
            }}
            {...props}
        >
            <AnimatePresence mode="wait">
                <SwapWidgetAnimation key={msg}>
                    {msg}
                </SwapWidgetAnimation>
            </AnimatePresence>
            {isReview && (
                <Link
                    href="/swap/review"
                    className="absolute start-0 top-0 w-full h-full"
                />
            )}
        </Button>
    )
})
SwapButton.displayName = "SwapButton"

export default SwapButton
