"use client"

import React, { useCallback, useEffect } from "react"

import TextInput from "@/app/components/ui/TextInput"
import { formatDecimalInput, formattedAmountToLocale } from "@/app/lib/numbers"
import { NumberFormatType } from "@/app/types/numbers"

export interface DecimalInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    value?: string,
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
    decimals = 18,
    replaceClass,
    placeholder,
    type = "text",
    autoComplete = "off",
    inputMode = "decimal",
    ...props
}, ref) => {

    const handleInput = useCallback((event: React.ChangeEvent<HTMLInputElement>) => setValue?.(formatInput(event.target.value, decimals)), [setValue, formatInput, decimals])

    useEffect(() => {
        if (setValue) {
            setValue(decimals && value ? formatInput(value.toString(), decimals) : "")
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [setValue, decimals])

    return (
        <TextInput
            ref={ref}
            className={className}
            replaceClass={replaceClass}
            value={value}
            handleInput={handleInput}
            placeholder={placeholder ?? formattedAmountToLocale("0.0" as Intl.StringNumericLiteral, NumberFormatType.ZeroWithDecimal)}
            type={type}
            autoComplete={autoComplete}
            inputMode={inputMode}
            {...props}
        />
    )

})
DecimalInput.displayName = "DecimalInput"
