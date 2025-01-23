"use client"

import * as React from "react"

import TextInput from "@/app/components/ui/TextInput"
import { NumberFormatType } from "@/app/config/numbers"
import { formatDecimalInput, formattedAmountToLocale } from "@/app/lib/numbers"

export interface DecimalInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    setValue?: (value: string) => void,
    formatInput?: () => string,
    decimals?: number,
    replaceClass?: boolean,
}

export const DecimalInput = React.forwardRef<HTMLInputElement, DecimalInputProps>(({
    className,
    value = "",
    setValue,
    formatInput = formatDecimalInput,
    decimals,
    replaceClass,
    placeholder,
    type = "text",
    autoComplete = "off",
    inputMode = "decimal",
    ...props
}, ref) => {

    const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatInput(event.target.value, decimals)
        setValue?.(formatted)
    }

    return (
        <TextInput
            ref={ref}
            className={className}
            replaceClass={replaceClass}
            value={value}
            handleInput={handleInput}
            placeholder={placeholder ?? formattedAmountToLocale("0.0" as Intl.StringNumericLiteral, NumberFormatType.ZeroDecimal)}
            type={type}
            autoComplete={autoComplete}
            inputMode={inputMode}
            {...props}
        />
    )

})
DecimalInput.displayName = "DecimalInput"
