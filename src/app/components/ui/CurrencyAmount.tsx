import React from "react"

import { Currency } from "@/app/config/numbers"
import { DefaultUserPreferences } from "@/app/config/preferences"
import { TokenPriceConfig } from "@/app/config/prices"
import { currencyToLocale } from "@/app/lib/numbers"
import { PreferenceType } from "@/app/types/preferences"

interface CurrencyAmountProps extends React.ComponentPropsWithoutRef<"div"> {
    amount?: bigint,
    amountFormatted?: string,
    decimals?: number,
    currency?: Currency,
}

const CurrencyAmount = React.forwardRef<HTMLDivElement, CurrencyAmountProps>(({
    className,
    amount,
    amountFormatted,
    decimals = TokenPriceConfig.Decimals,
    currency = DefaultUserPreferences[PreferenceType.Currency],
    ...props
}, ref) => (
    <div
        ref={ref}
        className={className ?? "contents"}
        {...props}
    >
        {currencyToLocale({
            amount: amount,
            amountFormatted: amountFormatted ? amountFormatted as Intl.StringNumericLiteral : undefined,
            decimals: decimals,
            currency: currency,
        })}
    </div>
))
CurrencyAmount.displayName = "CurrencyAmount"

export default CurrencyAmount
