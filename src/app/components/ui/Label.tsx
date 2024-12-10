import * as React from "react"
import { twMerge } from "tailwind-merge"

const Label = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(({
    children,
    className,
    htmlFor,
    ...props
}, ref) => (
    <label
        ref={ref}
        className={twMerge("label", className)}
        htmlFor={htmlFor}
        {...props}
    >
        {children}
    </label>
))
Label.displayName = "Label"

export default Label
