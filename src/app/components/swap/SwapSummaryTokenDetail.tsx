import * as React from "react"
import { twMerge } from "tailwind-merge"

import { ChainImageInline } from "@/app/components/images/ChainImage"
import { TokenImage } from "@/app/components/images/TokenImage"
import DecimalAmount from "@/app/components/ui/DecimalAmount"
import { NumberFormatType } from "@/app/config/numbers"
import { Chain } from "@/app/types/chains"
import { Token } from "@/app/types/tokens"

interface SwapSummaryTokenDetailProps extends React.ComponentPropsWithoutRef<"div"> {
    token: Token,
    chain: Chain,
    amountFormatted: string,
    minAmountFormatted?: string,
    label?: React.ReactNode,
}

const SwapSummaryTokenDetail = React.forwardRef<HTMLDivElement, SwapSummaryTokenDetailProps>(({
    className,
    token,
    chain,
    amountFormatted,
    minAmountFormatted,
    label,
    ...props
}, ref) => (
    <div
        ref={ref}
        className={twMerge("flex flex-col flex-1 gap-2", className)}
        {...props}
    >
        {label && (
            <div className="flex flex-row flex-1 gap-2 font-bold">
                {label}
                <ChainImageInline
                    chain={chain}
                    size="xs"
                />
                {chain.name}
            </div>
        )}
        <div className="flex flex-row flex-1 gap-4">
            <div className="flex flex-col flex-none justify-center items-center">
                <TokenImage token={token} />
            </div>
            <div className="flex flex-row flex-1 gap-2">
                {minAmountFormatted && (
                    <div className="flex flex-col flex-none text-muted-500">
                        <div className="flex flex-row flex-1 items-end">
                            Est.
                        </div>
                        <div className="flex flex-row flex-1 items-end">
                            Min.
                        </div>
                    </div>
                )}
                <div className="flex flex-col flex-1">
                    <div className="flex flex-row flex-1 gap-2 items-center">
                        <DecimalAmount
                            amountFormatted={amountFormatted}
                            symbol={token.symbol}
                            token={token}
                            type={NumberFormatType.Precise}
                            className="font-bold text-lg"
                        />
                    </div>
                    {minAmountFormatted && (
                        <div className="flex flex-row flex-1 gap-2 items-center">
                            <DecimalAmount
                                amountFormatted={minAmountFormatted}
                                symbol={token.symbol}
                                token={token}
                                type={NumberFormatType.Precise}
                                className="text-muted-400"
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
))
SwapSummaryTokenDetail.displayName = "SwapSummaryTokenDetail"

export default SwapSummaryTokenDetail
