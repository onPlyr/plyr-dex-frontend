import { motion, SVGMotionProps, Transition, Variants } from "motion/react"
import * as React from "react"

import { defaultSvgPathProps } from "@/app/config/animations"
import { AnimationVariants } from "@/app/types/animations"

export enum AnimatedSwapIconVariant {
    Default = "default",
    Repeat = "repeat",
}

interface AnimatedSwapIconProps extends React.ComponentPropsWithoutRef<typeof motion.svg> {
    animations?: AnimationVariants,
    delayedAnimations?: AnimationVariants,
    pathProps?: SVGMotionProps<SVGPathElement | SVGPolylineElement>,
    variant?: AnimatedSwapIconVariant,
}

const defaultSwapTransition: Transition = {
    duration: 1,
}
const defaultSwapDelay = 0.75

const defaultRepeatSwapTransition: Transition = {
    ...defaultSwapTransition,
    repeat: Infinity,
    repeatDelay: 1,
    repeatType: "mirror",
}
const defaultRepeatSwapAnimations: AnimationVariants = {
    initial: {
        pathLength: 1,
        pathOffset: 1,
        transition: defaultRepeatSwapTransition,
    },
    animate: {
        pathLength: 1,
        pathOffset: 0,
        transition: defaultRepeatSwapTransition,
    },
    exit: {
        pathLength: 1,
        pathOffset: 1,
        transition: defaultRepeatSwapTransition,
    },
}
const delayedRepeatSwapAnimations: AnimationVariants = {
    initial: {
        ...defaultRepeatSwapAnimations.initial,
        transition: {
            ...defaultRepeatSwapTransition,
            delay: defaultSwapDelay,
        },
    },
    animate: {
        ...defaultRepeatSwapAnimations.animate,
        transition: {
            ...defaultRepeatSwapTransition,
            delay: defaultSwapDelay,
        },
    },
    exit: {
        ...defaultRepeatSwapAnimations.exit,
        transition: {
            ...defaultRepeatSwapTransition,
            delay: defaultSwapDelay,
        },
    },
}

const defaultSwapAnimations: AnimationVariants = {
    initial: {
        ...defaultRepeatSwapAnimations.initial,
        transition: defaultSwapTransition,
    },
    animate: {
        ...defaultRepeatSwapAnimations.animate,
        transition: defaultSwapTransition,
    },
    exit: {
        ...defaultRepeatSwapAnimations.exit,
        transition: defaultSwapTransition,
    },
}
const delayedSwapAnimations: AnimationVariants = {
    initial: {
        ...defaultSwapAnimations.initial,
        transition: {
            ...defaultSwapTransition,
            delay: defaultSwapDelay,
        },
    },
    animate: {
        ...defaultSwapAnimations.animate,
        transition: {
            ...defaultSwapTransition,
            delay: defaultSwapDelay,
        },
    },
    exit: {
        ...defaultSwapAnimations.exit,
        transition: {
            ...defaultSwapTransition,
            delay: defaultSwapDelay,
        },
    },
}

const variantAnimations: Record<AnimatedSwapIconVariant, AnimationVariants> = {
    [AnimatedSwapIconVariant.Default]: defaultSwapAnimations,
    [AnimatedSwapIconVariant.Repeat]: defaultRepeatSwapAnimations,
}

const delayedVariantAnimations: Record<AnimatedSwapIconVariant, AnimationVariants> = {
    [AnimatedSwapIconVariant.Default]: delayedSwapAnimations,
    [AnimatedSwapIconVariant.Repeat]: delayedRepeatSwapAnimations,
}

export const AnimatedSwapIcon = React.forwardRef<React.ElementRef<typeof motion.svg>, AnimatedSwapIconProps>(({
    animations,
    delayedAnimations,
    pathProps,
    variant,
    ...props
}, ref) => {

    const pathPropsData = pathProps ?? defaultSvgPathProps

    const variants: Variants = {
        initial: animations?.initial ?? variantAnimations[variant ?? AnimatedSwapIconVariant.Default].initial!,
        animate: animations?.animate ?? variantAnimations[variant ?? AnimatedSwapIconVariant.Default].animate!,
        exit: animations?.exit ?? variantAnimations[variant ?? AnimatedSwapIconVariant.Default].exit!,
    }

    const delayedVariants: Variants = {
        initial: delayedAnimations?.initial ?? delayedVariantAnimations[variant ?? AnimatedSwapIconVariant.Default].initial!,
        animate: delayedAnimations?.animate ?? delayedVariantAnimations[variant ?? AnimatedSwapIconVariant.Default].animate!,
        exit: delayedAnimations?.exit ?? delayedVariantAnimations[variant ?? AnimatedSwapIconVariant.Default].exit!,
    }

    return (
        <motion.svg
            ref={ref}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 256 256"
            {...props}
        >
            <motion.path
                id="line-right"
                d="M80,160H208a8,8,0,0,0,8-8V48a8,8,0,0,0-8-8H96a8,8,0,0,0-8,8v8"
                variants={variants}
                initial="initial"
                animate="animate"
                exit="exit"
                {...pathPropsData}
            />
            <motion.polyline
                id="arrow-right"
                points="104 136 80 160 104 184"
                variants={variants}
                initial="initial"
                animate="animate"
                exit="exit"
                {...pathPropsData}
            />
            <motion.path
                id="line-left"
                d="M176,96H48a8,8,0,0,0-8,8V208a8,8,0,0,0,8,8H160a8,8,0,0,0,8-8v-8"
                variants={delayedVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                {...pathPropsData}
            />
            <motion.polyline
                id="arrow-left"
                points="152 120 176 96 152 72"
                variants={delayedVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                {...pathPropsData}
            />
        </motion.svg>
    )
})
AnimatedSwapIcon.displayName = "AnimatedSwapIcon"
