import { motion, SVGMotionProps, Transition, Variants } from "motion/react"
import * as React from "react"

import { defaultSvgPathProps } from "@/app/config/animations"
import { AnimationVariants } from "@/app/types/animations"

export enum AnimatedBridgeIconVariant {
    Default = "default",
    Repeat = "repeat",
}

interface AnimatedBridgeIconProps extends React.ComponentPropsWithoutRef<typeof motion.svg> {
    animations?: AnimationVariants,
    pathProps?: SVGMotionProps<SVGPathElement | SVGPolylineElement>,
    variant?: AnimatedBridgeIconVariant,
}

const defaultBridgeTransition: Transition = {
    duration: 1,
}
const defaultRepeatBridgeTransition: Transition = {
    ...defaultBridgeTransition,
    repeat: Infinity,
    repeatDelay: 1,
    repeatType: "mirror",
}

const defaultRepeatBridgeAnimations: AnimationVariants = {
    initial: {
        pathLength: 1,
        pathOffset: 1,
        transition: defaultRepeatBridgeTransition,
    },
    animate: {
        pathLength: 1,
        pathOffset: 0,
        transition: defaultRepeatBridgeTransition,
    },
    exit: {
        pathLength: 1,
        pathOffset: 1,
        transition: defaultRepeatBridgeTransition,
    },
}

const defaultBridgeAnimations: AnimationVariants = {
    initial: {
        ...defaultRepeatBridgeAnimations.initial,
        transition: defaultBridgeTransition,
    },
    animate: {
        ...defaultRepeatBridgeAnimations.animate,
        transition: defaultBridgeTransition,
    },
    exit: {
        ...defaultRepeatBridgeAnimations.exit,
        transition: defaultBridgeTransition,
    },
}

const variantAnimations: Record<AnimatedBridgeIconVariant, AnimationVariants> = {
    [AnimatedBridgeIconVariant.Default]: defaultBridgeAnimations,
    [AnimatedBridgeIconVariant.Repeat]: defaultRepeatBridgeAnimations,
}

export const AnimatedBridgeIcon = React.forwardRef<React.ElementRef<typeof motion.svg>, AnimatedBridgeIconProps>(({
    animations,
    pathProps,
    variant,
    ...props
}, ref) => {

    const pathPropsData = pathProps ?? defaultSvgPathProps
    const variants: Variants = {
        initial: animations?.initial ?? variantAnimations[variant ?? AnimatedBridgeIconVariant.Default].initial!,
        animate: animations?.animate ?? variantAnimations[variant ?? AnimatedBridgeIconVariant.Default].animate!,
        exit: animations?.exit ?? variantAnimations[variant ?? AnimatedBridgeIconVariant.Default].exit!,
    }

    return (
        <motion.svg
            ref={ref}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 256 256"
            {...props}
        >
            <motion.path
                id="horizontal-top"
                d="M24,115.35A64,64,0,0,0,64,56a64,64,0,0,0,128,0,64,64,0,0,0,40,59.35"
                variants={variants}
                initial="initial"
                animate="animate"
                exit="exit"
                {...pathPropsData}
            />
            <motion.line
                id="horizontal-bottom"
                x1="24"
                y1="168"
                x2="232"
                y2="168"
                variants={variants}
                initial="initial"
                animate="animate"
                exit="exit"
                {...pathPropsData}
            />
            <motion.line
                id="long-vertical-left"
                x1="64"
                y1="56"
                x2="64"
                y2="200"
                variants={variants}
                initial="initial"
                animate="animate"
                exit="exit"
                {...pathPropsData}
            />
            <motion.line
                id="short-vertical-left"
                x1="104"
                y1="115.35"
                x2="104"
                y2="168"
                variants={variants}
                initial="initial"
                animate="animate"
                exit="exit"
                {...pathPropsData}
            />
            <motion.line
                id="long-vertical-right"
                x1="192"
                y1="56"
                x2="192"
                y2="200"
                variants={variants}
                initial="initial"
                animate="animate"
                exit="exit"
                {...pathPropsData}
            />
            <motion.line
                id="short-vertical-right"
                x1="152"
                y1="115.35"
                x2="152"
                y2="168"
                variants={variants}
                initial="initial"
                animate="animate"
                exit="exit"
                {...pathPropsData}
            />
        </motion.svg>
    )
})
AnimatedBridgeIcon.displayName = "AnimatedBridgeIcon"
