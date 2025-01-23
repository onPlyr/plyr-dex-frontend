import { motion, SVGMotionProps, Transition, Variants } from "motion/react"
import * as React from "react"

import { defaultSvgPathProps } from "@/app/config/animations"
import { AnimationVariants } from "@/app/types/animations"

export enum AnimatedTesseractIconVariant {
    Default = "default",
    Repeat = "repeat",
}

interface AnimatedTesseractIconProps extends React.ComponentPropsWithoutRef<typeof motion.svg> {
    animations?: AnimationVariants,
    pathProps?: SVGMotionProps<SVGPathElement | SVGPolylineElement>,
    variant?: AnimatedTesseractIconVariant,
}

const defaultTransition: Transition = {
    duration: 1,
}
const defaultRepeatTransition: Transition = {
    ...defaultTransition,
    repeat: Infinity,
    repeatDelay: 1,
    repeatType: "mirror",
}

const defaultRepeatAnimations: AnimationVariants = {
    initial: {
        pathLength: 1,
        pathOffset: 1,
        transition: defaultRepeatTransition,
    },
    animate: {
        pathLength: 1,
        pathOffset: 0,
        transition: defaultRepeatTransition,
    },
    exit: {
        pathLength: 1,
        pathOffset: 1,
        transition: defaultRepeatTransition,
    },
}

const defaultAnimations: AnimationVariants = {
    initial: {
        ...defaultRepeatAnimations.initial,
        transition: defaultTransition,
    },
    animate: {
        ...defaultRepeatAnimations.animate,
        transition: defaultTransition,
    },
    exit: {
        ...defaultRepeatAnimations.exit,
        transition: defaultTransition,
    },
}

const variantAnimations: Record<AnimatedTesseractIconVariant, AnimationVariants> = {
    [AnimatedTesseractIconVariant.Default]: defaultAnimations,
    [AnimatedTesseractIconVariant.Repeat]: defaultRepeatAnimations,
}

export const AnimatedTesseractIcon = React.forwardRef<React.ElementRef<typeof motion.svg>, AnimatedTesseractIconProps>(({
    animations,
    pathProps,
    variant,
    ...props
}, ref) => {

    const pathPropsData = pathProps ?? defaultSvgPathProps
    const variants: Variants = {
        initial: animations?.initial ?? variantAnimations[variant ?? AnimatedTesseractIconVariant.Default].initial!,
        animate: animations?.animate ?? variantAnimations[variant ?? AnimatedTesseractIconVariant.Default].animate!,
        exit: animations?.exit ?? variantAnimations[variant ?? AnimatedTesseractIconVariant.Default].exit!,
    }

    return (
        <motion.svg
            ref={ref}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 595.3 595.3"
            {...props}
        >
            <motion.path
                id="hexagon"
                d="M459.6,206.4c-1.5-.9-153.1-88.7-156.4-90.7-2-1.2-3.8-1.7-5.6-1.7s-3.6.6-5.6,1.7c0,0-152.5,88.4-156.4,90.7-3.6,2.1-5.6,5.5-5.6,9.6v181.3c0,5.7,3.3,8.3,6.5,10.1l155.4,90.1c1.5.8,3.2,1.6,5.8,1.6s3.9-.6,5.4-1.5l156.7-90.8c1.7-1.1,5.3-3.4,5.3-9.5v-181.3c0-5.8-3.2-8.3-5.6-9.6ZM443.5,385.6c0,5.3-3.1,7.3-4.6,8.2l-136.4,79c-1.3.8-2.7,1.3-4.7,1.3s-3.8-.8-5.1-1.4l-135.3-78.4c-2.8-1.5-5.6-3.8-5.6-8.8v-157.8c0-3.6,1.7-6.6,4.8-8.4,3.4-2,136.1-78.9,136.1-78.9,1.7-1,3.3-1.5,4.9-1.5s3.1.5,4.8,1.5c2.9,1.7,134.8,78.1,136.1,78.9,2.1,1.2,4.8,3.4,4.8,8.4v157.8Z"
                variants={variants}
                initial="initial"
                animate="animate"
                exit="exit"
                {...pathPropsData}
            />
            <motion.path
                id="triangle"
                d="M271,386.2h28.9M434.9,386.2l-137.2-238.6-137.2,238.6h274.4ZM136.5,407.4c-5.8-.4-8.8-5.4-6.5-10.1l22.2-41.6,52-90.3,11.1-19.3,51.9-90.3,24.8-40.1c1.7-1.7,3.8-2.7,5.6-2.7s4.1,1,5.6,2.7l24.8,40.1,51.9,90.3,11.1,19.3,52,90.3,22.2,41.6c2.5,5-.7,9.2-5.3,9.5l-47.2,1.7h-230l-46.1-1Z"
                variants={variants}
                initial="initial"
                animate="animate"
                exit="exit"
                {...pathPropsData}
            />
            <motion.path
                id="triangle-with-lines"
                d="M434.9,386.2l-54.3-94.5-54.6,94.5h109ZM299.8,386.2l67.7-117.1-14.4-25-82.2,142.1h28.9ZM244.9,386.2l95.2-164.7-42.5-73.9-137.2,238.6h84.5ZM136.5,407.4c-5.8-.4-8.8-5.4-6.5-10.1l22.2-41.6,52-90.3,11.1-19.3,51.9-90.3,24.8-40.1c1.7-1.7,3.8-2.7,5.6-2.7s4.1,1,5.6,2.7l24.8,40.1,51.9,90.3,11.1,19.3,52,90.3,22.2,41.6c2.5,5-.7,9.2-5.3,9.5l-47.2,1.7h-230l-46.1-1Z"
                variants={variants}
                initial="initial"
                animate="animate"
                exit="exit"
                {...pathPropsData}
            />
            <motion.g>
                <motion.path
                    id="cube-line-bottom"
                    d="M303.2,497.6c-1.5.9-3.1,1.5-5.4,1.5s-4.3-.9-5.8-1.6l-5.5-5.9v-83.2h22.2v83.2"
                    variants={variants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    {...pathPropsData}
                />
                <motion.path
                    id="cube-line-right"
                    d="M459.9,206.1c1.6.9,2.8,1.9,4,3.9s1.4,4.2,1.5,5.9l-2.3,7.7-71.9,41.8-11.2-19.2,72-41.8"
                    variants={variants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    {...pathPropsData}
                />
                <motion.path
                    id="cube-line-left"
                    d="M143.4,204.3l72,41.8-11.2,19.2-71.9-41.8-2.3-7.7c0-1.7.2-3.6,1.5-5.9s2.5-3,4-3.9"
                    variants={variants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    {...pathPropsData}
                />
            </motion.g>
        </motion.svg>
    )
})
AnimatedTesseractIcon.displayName = "AnimatedTesseractIcon"
