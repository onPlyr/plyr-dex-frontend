import { motion } from "motion/react"
import React from "react"
import { twMerge } from "tailwind-merge"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    label?: string,
    replaceClass?: boolean,
}

interface AnimatedButtonProps extends React.ComponentPropsWithoutRef<typeof motion.button> {
    label?: string,
}

export const AnimatedButton = React.forwardRef<React.ComponentRef<typeof motion.button>, AnimatedButtonProps>(({
    className,
    name,
    label,
    onClick,
    type = "button",
    // transition = {
    //     type: "spring",
    //     duration: 0.2,
    // },
    ...props
}, ref) => (
    <motion.button
        ref={ref}
        name={name}
        aria-label={label ?? name}
        className={twMerge("clear-bg clear-border-outline;", className)}
        onClick={!props.disabled ? onClick?.bind(this) : undefined}
        type={type}
        // transition={transition}
        whileTap={{
            scale: [0.95, 1.05, 0.95],
        }}
        {...props}
    />
))
AnimatedButton.displayName = "AnimatedButton"

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
    className,
    name,
    label,
    onClick,
    type = "button",
    replaceClass = false,
    disabled = false,
    ...props
}, ref) => (
    <button
        ref={ref}
        name={name}
        aria-label={label ?? name}
        onClick={!disabled ? onClick?.bind(this) : undefined}
        type={type}
        className={replaceClass ? className : twMerge("btn", className)}
        disabled={disabled}
        {...props}
    />
))
Button.displayName = "Button"

export default Button