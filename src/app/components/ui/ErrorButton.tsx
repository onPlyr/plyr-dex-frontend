import * as React from "react"
import { twMerge } from "tailwind-merge"

import ErrorIcon from "@/app/components/icons/ErrorIcon"
import Button from "@/app/components/ui/Button"

export const ErrorButton = React.forwardRef<React.ElementRef<typeof Button>, React.ComponentPropsWithoutRef<typeof Button>>(({
    children,
    className,
    ...props
}, ref) => (
    <Button
        ref={ref}
        className={twMerge("btn-error p-3 gap-3", className)}
        replaceClass={true}
        {...props}
    >
        <ErrorIcon /> {children}
    </Button>
))
ErrorButton.displayName = "ErrorButton"
