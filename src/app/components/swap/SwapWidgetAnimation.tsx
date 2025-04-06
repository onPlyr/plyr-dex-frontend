import { motion } from "motion/react"
import React from "react"
import { twMerge } from "tailwind-merge"

const SwapWidgetAnimation = React.forwardRef<React.ComponentRef<typeof motion.div>, React.ComponentPropsWithoutRef<typeof motion.div>>(({
    className,
    initial = "initial",
    animate = "animate",
    exit = "exit",
    layout = true,
    transition = {
        type: "spring",
        duration: 0.5,
    },
    variants = {
        initial: {
            y: "50%",
            opacity: 0,
        },
        animate: {
            y: 0,
            opacity: 1,
        },
        exit: {
            y: "-50%",
            opacity: 0,
            transition: {
                type: "tween",
                duration: 0.2,
                ease: "easeInOut",
            },
        },
    },
    ...props
}, ref) => (
    <motion.div
        ref={ref}
        className={twMerge("overflow-hidden", className)}
        initial={initial}
        animate={animate}
        exit={exit}
        layout={layout}
        transition={transition}
        variants={variants}
        {...props}
    />
))
SwapWidgetAnimation.displayName = "SwapWidgetAnimation"

export default SwapWidgetAnimation
