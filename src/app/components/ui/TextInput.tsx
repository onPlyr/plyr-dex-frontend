import * as React from "react"
import { twMerge } from "tailwind-merge"

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    handleInput?: (event: React.ChangeEvent<HTMLInputElement>) => void,
    replaceClass?: boolean,
}

const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(({
    className,
    value = "",
    handleInput,
    type = "text",
    autoComplete = "off",
    replaceClass,
    disabled,
    ...props
}, ref) => (
    <input
        ref={ref}
        value={value}
        onChange={disabled !== true ? handleInput?.bind(this) : undefined}
        type={type}
        autoComplete={autoComplete}
        className={replaceClass ? className : twMerge("input", className)}
        disabled={disabled}
        {...props}
    />
))
TextInput.displayName = "TextInput"

export default TextInput
