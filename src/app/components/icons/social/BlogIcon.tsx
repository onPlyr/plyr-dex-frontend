import { motion } from "motion/react"
import React from "react"

const BlogIcon = React.forwardRef<React.ComponentRef<typeof motion.svg>, React.ComponentPropsWithoutRef<typeof motion.svg>>(({
    ...props
}, ref) => (
    <motion.svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 256 256"
        {...props}
    >
        <rect width="256" height="256" fill="none"/>
        <line x1="96" y1="112" x2="176" y2="112" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"/>
        <line x1="96" y1="144" x2="176" y2="144" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"/>
        <path d="M32,200a16,16,0,0,0,16-16V64a8,8,0,0,1,8-8H216a8,8,0,0,1,8,8V184a16,16,0,0,1-16,16Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"/>
        <path d="M32,200a16,16,0,0,1-16-16V88" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"/>
    </motion.svg>
))
BlogIcon.displayName = "BlogIcon"

export default BlogIcon
