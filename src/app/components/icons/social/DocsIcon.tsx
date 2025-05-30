import { motion } from "motion/react"
import React from "react"

const DocsIcon = React.forwardRef<React.ComponentRef<typeof motion.svg>, React.ComponentPropsWithoutRef<typeof motion.svg>>(({
    ...props
}, ref) => (
    <motion.svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 256 256"
        {...props}
    >
        <rect width="256" height="256" fill="none"/>
        <path d="M48,216a24,24,0,0,1,24-24H208V32H72A24,24,0,0,0,48,56Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"/>
        <polyline points="48 216 48 224 192 224" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"/>
    </motion.svg>
))
DocsIcon.displayName = "DocsIcon"

export default DocsIcon
