import * as React from "react"
import { twMerge } from "tailwind-merge"

import { amountToLocale, formattedAmountToLocale } from "@/app/lib/numbers"
import { Token } from "@/app/types/tokens"
import { NumberFormatType } from "@/app/config/numbers"

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
}, ref) => (
    <div
        ref={ref}
        className={twMerge("inline-flex", className)}
        {...props}
    >
        {amountFormatted !== undefined ? (
            `${formattedAmountToLocale(amountFormatted as Intl.StringNumericLiteral, type)}${symbol ? ` ${symbol}` : ""}`
        ) : amount !== undefined && (token !== undefined || decimals !== undefined) ? (
            `${amountToLocale(amount, token?.decimals || decimals!, type)}${symbol ? ` ${symbol}` : ""}`
        ) : ""}
    </div>
))
DecimalAmount.displayName = "DecimalAmount"

export default DecimalAmount
