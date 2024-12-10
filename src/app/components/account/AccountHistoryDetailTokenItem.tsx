import * as React from "react"
import { twMerge } from "tailwind-merge"

import { ChainImageInline } from "@/app/components/images/ChainImage"
import { TokenImage } from "@/app/components/images/TokenImage"
import DecimalAmount from "@/app/components/ui/DecimalAmount"
import { NumberFormatType } from "@/app/config/numbers"
import { Chain } from "@/app/types/chains"
import { Token } from "@/app/types/tokens"

interface AccountHistoryDetailTokenItemProps extends React.ComponentPropsWithoutRef<"div"> {
    token: Token,
    chain: Chain,
    amount?: bigint,
    amountFormatted?: string,
}

const AccountHistoryDetailTokenItem = React.forwardRef<HTMLDivElement, AccountHistoryDetailTokenItemProps>(({
    className,
    token,
    chain,
    amount,
    amountFormatted,
    ...props
}, ref) => (
    <div
        ref={ref}
        className={twMerge("flex flex-col flex-1 gap-4 justify-center items-center", className)}
        {...props}
    >
        <div className="flex flex-row shrink">
            <TokenImage
                token={token}
                size="xl"
            />
        </div>
        <div className="flex flex-col shrink items-center">
            <DecimalAmount
                amount={amount}
                amountFormatted={amountFormatted}
                symbol={token.symbol}
                token={token}
                type={NumberFormatType.Precise}
                className="font-bold text-lg"
            />
            <div className="flex flex-row shrink gap-2 items-center">
                <ChainImageInline
                    chain={chain}
                    size="xs"
                />
                <div className="text-sm text-muted-400">
                    {chain.name}
                </div>
            </div>
        </div>
    </div>
))
AccountHistoryDetailTokenItem.displayName = "AccountHistoryDetailTokenItem"

export default AccountHistoryDetailTokenItem
