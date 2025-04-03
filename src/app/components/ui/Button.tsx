import { motion } from "motion/react"
import React from "react"
import { twMerge } from "tailwind-merge"

export interface ButtonProps extends React.ComponentPropsWithoutRef<typeof motion.button> {
    label?: string,
    replaceClass?: boolean,
    isAnimated?: boolean,
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
    className,
    name,
    label,
    onClick,
    type = "button",
    replaceClass = false,
    disabled = false,
    isAnimated = false,
    whileHover = "hover",
    whileTap = "tap",
    transition = {
        type: "spring",
        duration: 0.4,
    },
    variants = {
        hover: {
            scale: 1.05,
        },
        tap: {
            scale: 0.95,
        },
    },
    ...props
}, ref) => (
    <motion.button
        ref={ref}
        name={name}
        aria-label={label ?? name}
        onClick={!disabled ? onClick?.bind(this) : undefined}
        type={type}
        className={replaceClass ? className : twMerge("btn", className)}
        disabled={disabled}
        whileHover={isAnimated ? whileHover : undefined}
        whileTap={isAnimated ? whileTap : undefined}
        transition={transition}
        variants={variants}
        {...props}
    />
))
Button.displayName = "Button"

export default Button
