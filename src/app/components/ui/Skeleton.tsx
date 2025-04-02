import { motion } from "motion/react"
import React from "react"
import { twMerge } from "tailwind-merge"

const Skeleton = React.forwardRef<React.ComponentRef<typeof motion.div>, React.ComponentPropsWithoutRef<typeof motion.div>>(({
    className,
    ...props
}, ref) => (
    <motion.div
        ref={ref}
        className={twMerge("w-16 h-4 rounded-md bg-muted-700 animate-pulse", className)}
        {...props}
    />
))
Skeleton.displayName = "Skeleton"

export default Skeleton
