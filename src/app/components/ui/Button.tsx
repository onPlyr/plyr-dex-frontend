import * as React from "react"
import { twMerge } from "tailwind-merge"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    replaceClass?: boolean,
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
    children,
    onClick,
    type = "button",
    className,
    replaceClass = false,
    disabled = false,
    ...props
}, ref) => (
    <button
        onClick={!disabled ? onClick?.bind(this) : undefined}
        type={type}
        className={replaceClass ? className : twMerge("btn", className)}
        disabled={disabled}
        ref={ref}
        {...props}
    >
        {children}
    </button>
))
Button.displayName = "Button"

export default Button
