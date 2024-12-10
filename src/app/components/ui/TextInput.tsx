import * as React from "react"
import { twMerge } from "tailwind-merge"

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    handleInput?: (event: React.ChangeEvent<HTMLInputElement>) => void,
}

const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(({
    value = "",
    handleInput,
    type = "text",
    autoComplete = "off",
    className,
    disabled,
    ...props
}, ref) => (
    <input
        ref={ref}
        value={value}
        onChange={disabled !== true ? handleInput?.bind(this) : undefined}
        type={type}
        autoComplete={autoComplete}
        className={twMerge("input", className)}
        disabled={disabled}
        {...props}
    />
))
TextInput.displayName = "TextInput"

export default TextInput
