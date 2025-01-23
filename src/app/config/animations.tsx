import { SVGMotionProps, Transition } from "motion/react"

export const defaultTransition: Transition = {
    type: "spring",
    bounce: 0,
    duration: 0.2,
}

export const defaultSvgPathProps: SVGMotionProps<SVGPathElement | SVGPolylineElement> = {
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    strokeWidth: "16",
}
