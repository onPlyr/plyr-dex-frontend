"use client"

import { motion, useSpring } from "motion/react"
import React, { useCallback, useEffect, useState } from "react"
import colors from "tailwindcss/colors"
import { twMerge } from "tailwind-merge"

import Button from "@/app/components/ui/Button"
import { Tooltip } from "@/app/components/ui/Tooltip"
import { iconSizes } from "@/app/config/styling"
import { SwapQuoteConfig } from "@/app/config/swaps"
import useQuoteData from "@/app/hooks/quotes/useQuoteData"
import useTokens from "@/app/hooks/tokens/useTokens"
import { formatDuration } from "@/app/lib/datetime"

const DefaultTimerConfig = {
    size: 100,
    width: 10,
    colour: colors.white,
    trackColour: colors.zinc["400"],
    pathLength: 360,
} as const

const ExpiryAnimationType = {
    Loading: "loading",
    Timer: "timer",
    Default: "default",
} as const
type ExpiryAnimationType = (typeof ExpiryAnimationType)[keyof typeof ExpiryAnimationType]

interface SwapQuoteExpiryTimerProps extends React.ComponentPropsWithoutRef<typeof motion.svg> {
    timerSize?: number,
    timerWidth?: number,
    animationProps?: SwapQuoteExpiryAnimationProps,
    trackProps?: React.ComponentPropsWithoutRef<typeof motion.circle>,
}

interface SwapQuoteExpiryAnimationProps extends React.ComponentPropsWithoutRef<typeof motion.circle> {
    pathLength?: number,
}

const SwapQuoteExpiryAnimation = React.forwardRef<React.ComponentRef<typeof motion.circle>, SwapQuoteExpiryAnimationProps>(({
    fill = "transparent",
    pathLength = DefaultTimerConfig.pathLength,
    stroke = DefaultTimerConfig.colour,
    strokeLinecap = "round",
    strokeOpacity = 1,
    strokeDasharray = DefaultTimerConfig.pathLength,
    initial = ExpiryAnimationType.Default,
    exit = ExpiryAnimationType.Default,
    transition = {
        type: "spring",
        duration: 0.5,
    },
    variants = {
        [ExpiryAnimationType.Default]: {
            rotate: 0,
        },
        [ExpiryAnimationType.Timer]: {
            rotate: 0,
        },
        [ExpiryAnimationType.Loading]: {
            rotate: 360,
            transition: {
                type: "tween",
                duration: 1,
                ease: "linear",
                repeat: Infinity,
                repeatType: "loop",
            },
        },
    },
    ...props
}, ref) => (
    <motion.circle
        ref={ref}
        fill={fill}
        pathLength={pathLength}
        stroke={stroke}
        strokeLinecap={strokeLinecap}
        strokeOpacity={strokeOpacity}
        strokeDasharray={strokeDasharray}
        initial={initial}
        exit={exit}
        transition={transition}
        variants={variants}
        {...props}
    />
))
SwapQuoteExpiryAnimation.displayName = "SwapQuoteExpiryAnimation"

const SwapQuoteExpiryTrack = React.forwardRef<React.ComponentRef<typeof motion.circle>, React.ComponentPropsWithoutRef<typeof motion.circle>>(({
    fill = "transparent",
    stroke = DefaultTimerConfig.trackColour,
    strokeLinecap = "round",
    strokeOpacity = 0.25,
    ...props
}, ref) => (
    <motion.circle
        ref={ref}
        fill={fill}
        stroke={stroke}
        strokeLinecap={strokeLinecap}
        strokeOpacity={strokeOpacity}
        {...props}
    />
))
SwapQuoteExpiryTrack.displayName = "SwapQuoteExpiryTrack"

const SwapQuoteExpiryTimer = React.forwardRef<React.ComponentRef<typeof motion.svg>, SwapQuoteExpiryTimerProps>(({
    className,
    width = "100%",
    height = "100%",
    timerSize = DefaultTimerConfig.size,
    timerWidth = DefaultTimerConfig.width,
    animationProps,
    trackProps,
    ...props
}, ref) => {

    const size = timerSize || DefaultTimerConfig.size
    const center = size / 2
    const strokeWidth = timerWidth || DefaultTimerConfig.width
    const radius = center - (strokeWidth / 2)

    const { refetch: refetchTokens } = useTokens()
    const { useSwapQuotesData, selectedQuote } = useQuoteData()
    const { isInProgress, refetch: refetchQuotes } = useSwapQuotesData
    const pathLength = animationProps?.pathLength || DefaultTimerConfig.pathLength
    const offset = useSpring(pathLength, isInProgress || !selectedQuote ? { bounce: 0 } : undefined)
    const variant = isInProgress ? ExpiryAnimationType.Loading : selectedQuote ? ExpiryAnimationType.Timer : ExpiryAnimationType.Default
    const [expiryMs, setExpiryMs] = useState<number>()

    useEffect(() => {

        let interval: NodeJS.Timeout | undefined = undefined
        if (!selectedQuote || isInProgress) {
            offset.set(isInProgress ? pathLength * 0.8 : pathLength)
            setExpiryMs(undefined)
        }

        else {

            if (!interval) {
                offset.set(pathLength)
                setExpiryMs(undefined)
            }

            interval = setInterval(() => {

                const expiry = selectedQuote && selectedQuote.timestamp + SwapQuoteConfig.QuoteValidMs
                const newExpiryMs = expiry && expiry > Date.now() ? expiry - Date.now() : 0
                const progress = newExpiryMs ? newExpiryMs / SwapQuoteConfig.QuoteValidMs : 1

                offset.set(progress * pathLength)
                setExpiryMs(Math.ceil(newExpiryMs / 1000) * 1000)

            }, 500)
        }

        return () => clearInterval(interval)

    }, [selectedQuote, isInProgress, pathLength])

    const refetch = useCallback(() => {
        refetchTokens()
        refetchQuotes()
    }, [refetchTokens, refetchQuotes])

    useEffect(() => {
        if (expiryMs === 1000) {
            refetch()
        }
    }, [expiryMs, refetch])

    return (
        <Tooltip
            trigger=<Button
                label="Refresh"
                className="icon-btn flex flex-row items-center"
                replaceClass={true}
                onClick={refetch.bind(this)}
            >
                <div className={twMerge(iconSizes.sm, "-rotate-90", className?.toString())}>
                    <motion.svg
                        ref={ref}
                        width={width}
                        height={height}
                        viewBox={`0 0 ${size} ${size}`}
                        {...props}
                    >
                        <SwapQuoteExpiryTrack
                            {...trackProps}
                            cx={center}
                            cy={center}
                            r={radius}
                            strokeWidth={strokeWidth}
                        />
                        <SwapQuoteExpiryAnimation
                            {...animationProps}
                            key={variant}
                            cx={center}
                            cy={center}
                            r={radius}
                            strokeWidth={strokeWidth}
                            animate={variant}
                            style={{
                                strokeDashoffset: offset,
                            }}
                        />
                    </motion.svg>
                </div>
            </Button>
        >
            Refresh
            {selectedQuote && expiryMs !== undefined ? ` in ${formatDuration(expiryMs)}` : undefined}
        </Tooltip>
    )
})
SwapQuoteExpiryTimer.displayName = "SwapQuoteExpiryTimer"

export default SwapQuoteExpiryTimer
