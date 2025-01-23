import * as React from "react"
import { twMerge } from "tailwind-merge"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    label?: string,
    replaceClass?: boolean,
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
    children,
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
    >
        {children}
    </button>
))
Button.displayName = "Button"

export default Button
