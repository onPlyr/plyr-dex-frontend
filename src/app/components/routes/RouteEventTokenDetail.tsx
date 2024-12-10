import * as React from "react"
import { twMerge } from "tailwind-merge"

import { ChainImageInline } from "@/app/components/images/ChainImage"
import { TokenImage } from "@/app/components/images/TokenImage"
import DecimalAmount from "@/app/components/ui/DecimalAmount"
import { Token } from "@/app/types/tokens"
import { Chain } from "@/app/types/chains"
import { NumberFormatType } from "@/app/config/numbers"

interface RouteEventTokenDetailProps extends React.ComponentPropsWithoutRef<"div"> {
    label: React.ReactNode,
    chain: Chain,
    token: Token,
    amount?: bigint,
    amountFormatted?: string,
    lighterMuted?: boolean,
}

const RouteEventTokenDetail = React.forwardRef<HTMLDivElement, RouteEventTokenDetailProps>(({
    className,
    label,
    chain,
    token,
    amount,
    amountFormatted,
    lighterMuted,
    ...props
}, ref) =>  (
    <div
        ref={ref}
        className={twMerge("flex flex-col sm:flex-row flex-1 gap-x-4 gap-y-2", className)}
        {...props}
    >
        <div className={twMerge("flex flex-row flex-initial w-12 items-center", lighterMuted ? "text-muted-400" : "text-muted-500")}>
            {label}
        </div>
        <div className="flex flex-col-reverse sm:flex-row flex-1 gap-x-4 gap-y-1">
            <div className={twMerge("flex flex-row-reverse sm:flex-row flex-1 gap-4 justify-start items-center", lighterMuted ? "text-muted-300" : "text-muted-500")}>
                <ChainImageInline
                    chain={chain}
                    size="xs"
                />
                {chain.name}
            </div>
            <div className="flex flex-row shrink gap-4 justify-end items-center font-bold text-end">
                {amount || amountFormatted ? (
                    <DecimalAmount
                        amount={amount}
                        amountFormatted={amountFormatted}
                        symbol={token.symbol}
                        token={token}
                        type={NumberFormatType.Precise}
                    />
                ) : token.symbol}
                <TokenImage
                    token={token}
                    size="xs"
                />
            </div>
        </div>
    </div>
))
RouteEventTokenDetail.displayName = "RouteEventTokenDetail"

export default RouteEventTokenDetail
