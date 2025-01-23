import { motion, Variants } from "motion/react"
import * as React from "react"

import { defaultTransition } from "@/app/config/animations"
import { AnimationDelays, AnimationTransitions, AnimationVariants } from "@/app/types/animations"

interface CollapseProps extends React.ComponentPropsWithoutRef<typeof motion.div> {
    animations?: AnimationVariants,
    transitions?: AnimationTransitions,
    delays?: AnimationDelays,
}

const defaultAnimations: AnimationVariants = {
    initial: {
        height: 0,
        margin: 0,
    },
    animate: {
        height: "auto",
    },
    exit: {
        height: 0,
        margin: 0,
    },
}

const Collapse = React.forwardRef<React.ElementRef<typeof motion.div>, CollapseProps>(({
    animations,
    transitions,
    delays,
    ...props
}, ref) => {

    const initialAnimation = animations?.initial ?? defaultAnimations.initial
    const animateAnimation = animations?.animate ?? defaultAnimations.animate
    const exitAnimation = animations?.exit ?? defaultAnimations.exit

    const initialTransition = transitions?.initial ?? defaultTransition
    const animateTransition = transitions?.animate ?? defaultTransition
    const exitTransition = transitions?.exit ?? defaultTransition

    const variants: Variants = {
        initial: {
            ...initialAnimation,
            transition: {
                ...initialTransition,
                delay: delays?.initial,
            },
        },
        animate: {
            ...animateAnimation,
            transition: {
                ...animateTransition,
                delay: delays?.animate,
            },
        },
        exit: {
            ...exitAnimation,
            transition: {
                ...exitTransition,
                delay: delays?.exit,
            },
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
Collapse.displayName = "Collapse"

export default Collapse
