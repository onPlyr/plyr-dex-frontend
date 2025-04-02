"use client"

import React from "react"
import { twMerge } from "tailwind-merge"

import DecimalAmount from "@/app/components/ui/DecimalAmount"
import useTokens from "@/app/hooks/tokens/useTokens"
import { NumberFormatType } from "@/app/types/numbers"
import { Token, TokenAmount } from "@/app/types/tokens"

interface TokenBalanceProps extends Omit<React.ComponentPropsWithoutRef<typeof DecimalAmount>, "amount" | "amountFormatted"> {
    token?: Token,
    balance?: TokenAmount,
    hideSymbol?: boolean,
    ignoreType?: boolean,
}

const TokenBalance = React.forwardRef<React.ComponentRef<typeof DecimalAmount>, TokenBalanceProps>(({
    className,
    token,
    balance,
    hideSymbol,
    symbol,
    type = NumberFormatType.Precise,
    ignoreType,
    emptyValue = "0",
    ...props
}, ref) => {

    const { useBalancesData: { getBalance } } = useTokens()
    const balanceAmount = balance ?? getBalance(token)

    return (
        <DecimalAmount
            ref={ref}
            className={twMerge("font-bold", className)}
            amount={balanceAmount?.amount}
            amountFormatted={balanceAmount?.formatted}
            symbol={!hideSymbol ? symbol ?? token?.symbol : undefined}
            token={token}
            type={!ignoreType ? type : undefined}
            emptyValue={emptyValue}
            {...props}
        />
    )
})
TokenBalance.displayName = "TokenBalance"

export default TokenBalance
