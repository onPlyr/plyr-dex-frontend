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
    hideAmount?: boolean,
    isToast?: boolean,
}

const RouteEventTokenDetail = React.forwardRef<HTMLDivElement, RouteEventTokenDetailProps>(({
    className,
    label,
    chain,
    token,
    amount,
    amountFormatted,
    hideAmount = false,
    isToast,
    ...props
}, ref) =>  (
    <div
        ref={ref}
        className={twMerge("flex flex-col flex-1 w-full", className)}
        {...props}
    >
        <div className={twMerge(isToast ? "hidden" : "hidden sm:flex", "flex-row flex-1 gap-x-4 gap-y-2")}>
            <div className="flex flex-row flex-none w-12 items-center text-muted-500">
                {label}
            </div>
            <div className="flex flex-row flex-1 gap-x-4 gap-y-1">
                <div className="flex flex-row flex-1 gap-4 justify-start items-center text-muted-500">
                    <ChainImageInline
                        chain={chain}
                        size="xs"
                    />
                    {chain.name}
                </div>
                <div className="flex flex-row shrink gap-4 justify-end items-center font-bold text-end">
                    {hideAmount !== true && (amount || amountFormatted) ? (
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
        <div className={twMerge(isToast ? "flex" : "flex sm:hidden", "flex-col flex-1 gap-y-1")}>
            <div className="flex flex-row flex-row 1 gap-x-4 justify-between">
                <div className="flex flex-row flex-none justify-start items-center text-muted-500">
                    {label}
                </div>
                <div className="flex flex-row flex-1 gap-4 justify-end items-center font-bold text-end">
                    {hideAmount !== true && (amount || amountFormatted) ? (
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
            <div className="flex flex-row flex-1 gap-4 justify-end items-center text-end text-muted-500">
                {chain.name}
                <ChainImageInline
                    chain={chain}
                    size="xs"
                />
            </div>
        </div>
    </div>
))
RouteEventTokenDetail.displayName = "RouteEventTokenDetail"

export default RouteEventTokenDetail
