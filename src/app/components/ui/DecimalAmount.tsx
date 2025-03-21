import React from "react"
import { twMerge } from "tailwind-merge"

import { amountToLocale, formattedAmountToLocale } from "@/app/lib/numbers"
import { NumberFormatType } from "@/app/types/numbers"
import { Token } from "@/app/types/tokens"

interface DecimalAmountProps extends React.ComponentPropsWithoutRef<"div"> {
    amount?: bigint,
    amountFormatted?: string,
    symbol?: string,
    token?: Token,
    decimals?: number,
    type?: NumberFormatType,
    withSign?: boolean,
    emptyValue?: React.ReactNode,
}

const DecimalAmount = React.forwardRef<HTMLDivElement, DecimalAmountProps>(({
    className,
    amount,
    amountFormatted,
    symbol,
    token,
    decimals,
    type,
    withSign,
    emptyValue,
    ...props
}, ref) => {

    const localeAmount = amountFormatted ? formattedAmountToLocale(amountFormatted as Intl.StringNumericLiteral, type, withSign) : amount ? amountToLocale(amount, decimals || token?.decimals || 18, type, withSign) : undefined

    return (
        <div
            ref={ref}
            className={twMerge("inline-flex", className)}
            {...props}
        >
            {localeAmount !== undefined ? localeAmount : emptyValue}&nbsp;{symbol && symbol}
        </div>
    )
})
DecimalAmount.displayName = "DecimalAmount"

export default DecimalAmount