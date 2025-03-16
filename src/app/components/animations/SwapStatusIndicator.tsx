"use client"

import { motion, Transition, Variant, Variants } from "motion/react"
import * as React from "react"
import { twMerge } from "tailwind-merge"

import ScaleInOut from "@/app/components/animations/ScaleInOut"
import SwapStatusIcon from "@/app/components/icons/SwapStatusIcon"
import { imgSizes } from "@/app/config/styling"
import { SwapHistory, SwapStatus } from "@/app/types/swaps"
import { WithRequired } from "@/app/types/utils"

interface PendingIndicatorConfig {
    name: string,
    num: number,
    duration: number,
    animation: Variant,
    transition: Transition,
    classNames: {
        container: string,
        indicator?: string,
    },
}

interface PendingIndicatorData {
    defaultData: PendingIndicatorConfig,
    smData: PendingIndicatorConfig,
}

interface SwapStatusIndicatorProps extends React.ComponentPropsWithoutRef<typeof ScaleInOut> {
    swap: SwapHistory,
    pendingIndicators?: PendingIndicatorData,
}

interface PendingIndicatorsProps extends WithRequired<React.ComponentPropsWithoutRef<typeof motion.div>, "variants"> {
    data: PendingIndicatorConfig,
    isSm?: boolean,
}

const defaultPendingIndicatorTransition: Transition = {
    repeat: Infinity,
    ease: "easeInOut",
} as const

const defaultPendingIndicatorData: PendingIndicatorData = {
    defaultData: {
        name: "default",
        num: 7,
        duration: 1,
        animation: {
            scale: [0, 1, 0],
        },
        transition: defaultPendingIndicatorTransition,
        classNames: {
            container: "hidden sm:flex",
        },
    },
    smData: {
        name: "sm",
        num: 5,
        duration: 0.75,
        animation: {
            scale: [0, 1, 0],
        },
        transition: defaultPendingIndicatorTransition,
        classNames: {
            container: "flex sm:hidden",
        },
    },
} as const

const PendingIndicators = React.forwardRef<React.ComponentRef<typeof motion.div>, PendingIndicatorsProps>(({
    data,
    variants,
    isSm,
    ...props
}, ref) => (
    <motion.div
        ref={ref}
        animate={isSm ? "sm" : "default"}
        transition={{
            staggerChildren: data.duration / data.num,
        }}
        className={twMerge("flex-row flex-1 gap-2 items-center justify-center", data.classNames.container)}
        {...props}
    >
        {[...Array(data.num)].map((_, i) => (
            <motion.div
                key={i}
                className={twMerge("w-4 h-4 rounded-full bg-gradient-btn", data.classNames.indicator)}
                variants={variants}
            />
        ))}
    </motion.div>
))
PendingIndicators.displayName = "PendingIndicators"

const SwapStatusIndicator = React.forwardRef<React.ComponentRef<typeof ScaleInOut>, SwapStatusIndicatorProps>(({
    swap,
    pendingIndicators = defaultPendingIndicatorData,
    ...props
}, ref) => {

    const pendingVariants: Variants = {
        [pendingIndicators.defaultData.name]: {
            ...pendingIndicators.defaultData.animation,
            transition: {
                ...pendingIndicators.defaultData.transition,
                duration: pendingIndicators.defaultData.duration,
                repeatDelay: pendingIndicators.defaultData.duration / pendingIndicators.defaultData.num,
            },
        },
        [pendingIndicators.smData.name]: {
            ...pendingIndicators.smData.animation,
            transition: {
                ...pendingIndicators.smData.transition,
                duration: pendingIndicators.smData.duration,
                repeatDelay: pendingIndicators.smData.duration / pendingIndicators.smData.num,
            },
        },
    }

    return (
        <ScaleInOut
            ref={ref}
            key={swap.status}
            fadeInOut={true}
            {...props}
        >
            {swap.status === SwapStatus.Pending ? (<>
                <PendingIndicators
                    data={pendingIndicators.defaultData}
                    variants={pendingVariants}
                />
                <PendingIndicators
                    data={pendingIndicators.smData}
                    variants={pendingVariants}
                    isSm={true}
                />
            </>) : (
                <SwapStatusIcon
                    className={imgSizes.lg}
                    status={swap.status}
                    highlight={true}
                />
            )}
        </ScaleInOut>
    )
})
SwapStatusIndicator.displayName = "SwapStatusIndicator"

export default SwapStatusIndicator
