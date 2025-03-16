"use client"

import { motion, Transition, Variants } from "motion/react"
import React from "react"
import colors from "tailwindcss/colors"
import { twMerge } from "tailwind-merge"

import { iconSizes } from "@/app/config/styling"
import useQuoteData from "@/app/hooks/quotes/useQuoteData"

const defaultTransition: Transition = {
    type: "spring",
    duration: 0.5,
}

const defaultLoadingTransition: Transition = {
    type: "tween",
    duration: 1,
    ease: "linear",
    repeat: Infinity,
    repeatType: "loop",
}

const defaultVariants: Variants = {
    initial: {
        pathLength: 0,
        pathOffset: 1,
        rotate: 0,
        opacity: 0,
        transition: defaultTransition,
    },
    timer: {
        pathLength: 1,
        pathOffset: 0,
        rotate: 0,
        opacity: 1,
        transition: defaultTransition,
    },
    loading: {
        pathLength: 0.2,
        pathOffset: 0,
        rotate: 360,
        opacity: 1,
        transition: {
            default: defaultTransition,
            rotate: defaultLoadingTransition,
        }
    },
}

const defaultTimerProps = {
    size: 100,
    width: 10,
    colour: colors.white,
    trackColour: colors.zinc["400"],
}

interface SwapQuoteExpiryTimerProps extends React.ComponentPropsWithoutRef<typeof motion.svg> {
    timerSize?: number,
    timerWidth?: number,
    animationProps?: React.ComponentPropsWithoutRef<typeof motion.circle>,
    trackProps?: React.ComponentPropsWithoutRef<typeof motion.circle>,
}

const SwapQuoteExpiryAnimation = React.forwardRef<React.ComponentRef<typeof motion.circle>, React.ComponentPropsWithoutRef<typeof motion.circle>>(({
    fill = "transparent",
    stroke = defaultTimerProps.colour,
    strokeLinecap = "round",
    strokeOpacity = 1,
    variants = defaultVariants,
    ...props
}, ref) => {

    const { useSwapQuotesData: { isInProgress }, quoteExpiryProgress, selectedQuote, isQuoteExpired } = useQuoteData()

    return (
        <motion.circle
            ref={ref}
            fill={fill}
            stroke={stroke}
            strokeLinecap={strokeLinecap}
            strokeOpacity={strokeOpacity}
            variants={{
                ...variants,
                timer: {
                    ...variants.timer,
                    pathLength: quoteExpiryProgress.get(),
                }
            }}
            initial="initial"
            animate={isInProgress ? "loading" : selectedQuote && !isQuoteExpired ? "timer" : "initial"}
            {...props}
        />
    )
})
SwapQuoteExpiryAnimation.displayName = "SwapQuoteExpiryAnimation"

const SwapQuoteExpiryTrack = React.forwardRef<React.ComponentRef<typeof motion.circle>, React.ComponentPropsWithoutRef<typeof motion.circle>>(({
    fill = "transparent",
    stroke = defaultTimerProps.trackColour,
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
    timerSize = defaultTimerProps.size,
    timerWidth = defaultTimerProps.width,
    animationProps,
    trackProps,
    ...props
}, ref) => {

    const { selectedQuote } = useQuoteData()
    const size = timerSize || defaultTimerProps.size
    const center = size / 2
    const strokeWidth = timerWidth || defaultTimerProps.width
    const radius = center - (strokeWidth / 2)

    return (
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
                    key={selectedQuote?.id ?? "test"}
                    cx={center}
                    cy={center}
                    r={radius}
                    strokeWidth={strokeWidth}
                />
            </motion.svg>
        </div>
    )
})
SwapQuoteExpiryTimer.displayName = "SwapQuoteExpiryTimer"

export default SwapQuoteExpiryTimer
