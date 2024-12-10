import * as React from "react"
import { twMerge } from "tailwind-merge"

import { ChainImageInline } from "@/app/components/images/ChainImage"
import { TokenImage } from "@/app/components/images/TokenImage"
import DecimalAmount from "@/app/components/ui/DecimalAmount"
import { NumberFormatType } from "@/app/config/numbers"
import { imgSizes } from "@/app/config/styling"
import { Chain } from "@/app/types/chains"
import { Token } from "@/app/types/tokens"

interface RouteSummaryTokenItemProps extends React.ComponentPropsWithoutRef<"div"> {
    token: Token,
    chain: Chain,
    amountFormatted: string
}

const RouteSummaryTokenItem = React.forwardRef<HTMLDivElement, RouteSummaryTokenItemProps>(({
    className,
    token,
    chain,
    amountFormatted,
    ...props
}, ref) => (
    <div
        ref={ref}
        className={twMerge("flex flex-row shrink gap-4 justify-start items-center", className)}
        {...props}
    >
        <TokenImage token={token} />
        <div className="flex flex-col flex-1 items-start">
            <DecimalAmount
                amountFormatted={amountFormatted}
                symbol={token.symbol}
                type={NumberFormatType.Precise}
                className="font-bold text-base sm:text-lg"
            />
            <div className="flex flex-row flex-1 gap-2 items-center">
                <ChainImageInline
                    chain={chain}
                    className={imgSizes.xs}
                />
                <div className="text-sm text-muted-00">
                    {chain.name}
                </div>
            </div>
        </div>
    </div>
))
RouteSummaryTokenItem.displayName = "RouteSummaryTokenItem"

export default RouteSummaryTokenItem
