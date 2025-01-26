import { motion } from "motion/react"
import React from "react"
import { twMerge } from "tailwind-merge"

import { SwapStatus } from "@/app/config/swaps"
import { Swap } from "@/app/types/swaps"

interface SwapProgressBarProps extends React.ComponentPropsWithoutRef<typeof motion.div> {
    swap: Swap,
}

const SwapProgressBar = React.forwardRef<React.ElementRef<typeof motion.div>, SwapProgressBarProps>(({
    className,
    swap,
    initial,
    animate,
    transition,
    ...props
}, ref) => {
    const latestEventIndex = swap.events.findLastIndex((event) => event.status === SwapStatus.Success)
    return (
        <motion.div
            ref={ref}
            className={twMerge("progress h-2", className)}
            initial={initial ?? {
                width: 0,
            }}
            animate={animate ?? {
                width: `${swap.status === SwapStatus.Success ? 100 : latestEventIndex !== -1 ? ((latestEventIndex > 0 ? latestEventIndex : 1) / swap.events.length) * 100 : 10}%`,
            }}
            transition={transition ?? {
                type: "spring",
                duration: 0.5,
            }}
            {...props}
        />
    )
})
SwapProgressBar.displayName = "SwapProgressBar"

export default SwapProgressBar
