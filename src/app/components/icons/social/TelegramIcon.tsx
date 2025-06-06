import { motion } from "motion/react"
import React from "react"

const TelegramIcon = React.forwardRef<React.ComponentRef<typeof motion.svg>, React.ComponentPropsWithoutRef<typeof motion.svg>>(({
    ...props
}, ref) => (
    <motion.svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 256 256"
        {...props}
    >
        <rect width="256" height="256" fill="none"/>
        <path d="M80,134.87,170.26,214a8,8,0,0,0,13.09-4.21L224,33.22a1,1,0,0,0-1.34-1.15L20,111.38A6.23,6.23,0,0,0,21,123.3Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"/>
        <line x1="80" y1="134.87" x2="223.41" y2="32.09" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"/>
        <path d="M124.37,173.78,93.76,205.54A8,8,0,0,1,80,200V134.87" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"/>
    </motion.svg>
))
TelegramIcon.displayName = "TelegramIcon"

export default TelegramIcon
