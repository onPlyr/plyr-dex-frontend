import { motion, Variants } from "motion/react"
import * as React from "react"

import { defaultTransition } from "@/app/config/animations"
import { AnimationDelays, AnimationTransitions, AnimationVariants } from "@/app/types/animations"
import { StyleSide } from "@/app/types/styling"

interface SlideInOutProps extends React.ComponentPropsWithoutRef<typeof motion.div> {
    from?: StyleSide,
    to?: StyleSide,
    animations?: AnimationVariants,
    transitions?: AnimationTransitions,
    delays?: AnimationDelays,
}

const defaultFrom: StyleSide = "left"
const defaultTo: StyleSide = "right"

export const defaultAnimations: Record<StyleSide, AnimationVariants> = {
    left: {
        initial: {
            x: "-100%",
        },
        animate: {
            x: 0,

        },
        exit: {
            x: "-100%",
            opacity: 0,
        },
    },
    right: {
        initial: {
            x: "100%",
        },
        animate: {
            x: 0,
        },
        exit: {
            x: "100%",
        },
    },
    top: {
        initial: {
            y: "-100%",
        },
        animate: {
            y: 0,
        },
        exit: {
            y: "-100%",
        },
    },
    bottom: {
        initial: {
            y: "100%",
        },
        animate: {
            y: 0,
        },
        exit: {
            y: "100%",
        },
    },
}

const SlideInOut = React.forwardRef<React.ElementRef<typeof motion.div>, SlideInOutProps>(({
    from,
    to,
    animations,
    transitions,
    delays,
    ...props
}, ref) => {

    const fromAnimations = animations ?? defaultAnimations[from ?? defaultFrom]
    const toAnimations = animations ?? defaultAnimations[to ?? defaultTo]

    const initialTransition = transitions?.initial ?? defaultTransition
    const animateTransition = transitions?.animate ?? defaultTransition
    const exitTransition = transitions?.exit ?? defaultTransition

    const variants: Variants = {
        initial: {
            ...fromAnimations.initial,
            transition: {
                ...initialTransition,
                delay: delays?.initial,
            },
        },
        animate: {
            ...fromAnimations.animate,
            transition: {
                ...animateTransition,
                delay: delays?.animate,
            },
        },
        exit: {
            ...toAnimations.exit,
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
SlideInOut.displayName = "SlideInOut"

export default SlideInOut
