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
    replaceClass?: boolean,
    isInline?: boolean,
    symbolClass?: string,
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
    replaceClass = false,
    isInline = false,
    symbolClass,
    ...props
}, ref) => {

    const localeAmount = amountFormatted ? formattedAmountToLocale(amountFormatted as Intl.StringNumericLiteral, type, withSign) : amount ? amountToLocale(amount, decimals || token?.decimals || 18, type, withSign) : undefined

    return (
        <div
            ref={ref}
            className={replaceClass ? className : twMerge("contents", className)}
            {...props}
        >
            {isInline && <>&nbsp;</>}{localeAmount || emptyValue}
            {symbol && (
                <span className={twMerge("contents", symbolClass)}>&nbsp;{symbol}</span>
            )}
        </div>
    )
})
DecimalAmount.displayName = "DecimalAmount"

export default DecimalAmount
