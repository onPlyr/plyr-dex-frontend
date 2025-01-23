import { motion, Variants } from "motion/react"
import * as React from "react"

import { defaultTransition } from "@/app/config/animations"
import { AnimationTransitions, AnimationVariants } from "@/app/types/animations"

interface ScaleInOutProps extends React.ComponentPropsWithoutRef<typeof motion.div> {
    animations?: AnimationVariants,
    transitions?: AnimationTransitions,
    fadeInOut?: boolean,
}

const defaultScaleInOutAnimations: AnimationVariants = {
    initial: {
        scale: 0,
    },
    animate: {
        scale: 1,
    },
    exit: {
        scale: 0,
    },
}

const defaultScaleFadeInOutAnimations: AnimationVariants = {
    initial: {
        ...defaultScaleInOutAnimations.initial,
        opacity: 0,
    },
    animate: {
        ...defaultScaleInOutAnimations.animate,
        opacity: 1,
    },
    exit: {
        ...defaultScaleInOutAnimations.exit,
        opacity: 0,
    },
}

const ScaleInOut = React.forwardRef<React.ElementRef<typeof motion.div>, ScaleInOutProps>(({
    animations,
    transitions,
    fadeInOut,
    ...props
}, ref) => {

    const initialAnimation = animations?.initial ?? (fadeInOut ? defaultScaleFadeInOutAnimations : defaultScaleInOutAnimations).initial
    const animateAnimation = animations?.animate ?? (fadeInOut ? defaultScaleFadeInOutAnimations : defaultScaleInOutAnimations).animate
    const exitAnimation = animations?.exit ?? (fadeInOut ? defaultScaleFadeInOutAnimations : defaultScaleInOutAnimations).exit

    const initialTransition = transitions?.initial ?? defaultTransition
    const animateTransition = transitions?.animate ?? defaultTransition
    const exitTransition = transitions?.exit ?? defaultTransition

    const variants: Variants = {
        initial: {
            ...initialAnimation,
            transition: initialTransition,
        },
        animate: {
            ...animateAnimation,
            transition: animateTransition,
        },
        exit: {
            ...exitAnimation,
            transition: exitTransition,
        },
    }

    return (
        <motion.div
            ref={ref}
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            {...props}
        />
    )
})
ScaleInOut.displayName = "ScaleInOut"

export default ScaleInOut
