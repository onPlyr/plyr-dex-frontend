"use client"

import * as React from "react"

import TextInput from "@/app/components/ui/TextInput"
import { formatDecimalInput } from "@/app/lib/numbers"

export interface DecimalInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    setValue?: (value: string) => void,
    formatInput?: () => string,
    decimals?: number,
}

export const DecimalInput = React.forwardRef<HTMLInputElement, DecimalInputProps>(({
    className,
    value = "",
    setValue,
    formatInput = formatDecimalInput,
    decimals,
    placeholder = "0.0",
    type = "text",
    autoComplete = "off",
    inputMode = "decimal",
    ...props
}, ref) => {

    const handleInput = setValue ? (event: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatInput(event.target.value, decimals)
        setValue(formatted)
    } : undefined

    return (
        <TextInput
            ref={ref}
            className={className}
            value={value}
            handleInput={handleInput}
            placeholder={placeholder}
            type={type}
            autoComplete={autoComplete}
            inputMode={inputMode}
            {...props}
        />
    )

})
DecimalInput.displayName = "DecimalInput"
