import * as React from "react"
import { twMerge } from "tailwind-merge"

import { NumberFormatType } from "@/app/config/numbers"
import { amountToLocale, formattedAmountToLocale } from "@/app/lib/numbers"
import { Token } from "@/app/types/tokens"

interface DecimalAmountProps extends React.ComponentPropsWithoutRef<"div"> {
    amount?: bigint,
    amountFormatted?: string,
    symbol?: string,
    token?: Token,
    decimals?: number,
    type?: NumberFormatType,
}

const DecimalAmount = React.forwardRef<HTMLDivElement, DecimalAmountProps>(({
    className,
    amount,
    amountFormatted,
    symbol,
    token,
    decimals,
    type,
    ...props
}, ref) => {
    let localeAmount = ""
    if (amountFormatted !== undefined) {
        localeAmount = formattedAmountToLocale(amountFormatted as Intl.StringNumericLiteral, type)
    }
    else if (amount !== undefined && (token !== undefined || decimals !== undefined)) {
        localeAmount = amountToLocale(amount, token?.decimals || decimals!, type)
    }
    return (
        <div
            ref={ref}
            className={twMerge("inline-flex", className)}
            {...props}
        >
            {localeAmount}&nbsp;{symbol && symbol}
        </div>
    )
})
DecimalAmount.displayName = "DecimalAmount"

export default DecimalAmount
