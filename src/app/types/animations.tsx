import { Transition, Variant } from "motion/react"

export interface AnimationVariants {
    initial?: Variant,
    animate?: Variant,
    exit?: Variant,
}

export interface AnimationTransitions {
    initial?: Transition,
    animate?: Transition,
    exit?: Transition,
}

export interface AnimationDelays {
    initial?: number,
    animate?: number,
    exit?: number,
}
