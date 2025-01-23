"use client"

import * as React from "react"
import { twMerge } from "tailwind-merge"

import { Currency } from "@/app/config/numbers"
import usePreferences from "@/app/hooks/preferences/usePreferences"
import { currencyToLocale } from "@/app/lib/numbers"
import { PreferenceType } from "@/app/types/preferences"

interface CurrencyAmountProps extends React.ComponentPropsWithoutRef<"div"> {
    amount?: bigint,
    amountFormatted?: string,
    currency?: Currency,
}

const CurrencyAmount = React.forwardRef<HTMLDivElement, CurrencyAmountProps>(({
    className,
    amount,
    amountFormatted,
    currency,
    ...props
}, ref) => {
    const { preferences } = usePreferences()
    return (
        <div
            ref={ref}
            className={twMerge("inline-flex", className)}
            {...props}
        >
            {currencyToLocale({
                amount: amount,
                amountFormatted: amountFormatted ? amountFormatted as Intl.StringNumericLiteral : undefined,
                currency: currency ?? preferences[PreferenceType.Currency],
            })}
        </div>
    )
})
CurrencyAmount.displayName = "CurrencyAmount"

export default CurrencyAmount
