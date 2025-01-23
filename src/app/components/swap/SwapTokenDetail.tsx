import * as React from "react"
import { twMerge } from "tailwind-merge"

import { ChainImageInline } from "@/app/components/images/ChainImage"
import { TokenImage } from "@/app/components/images/TokenImage"
import { Chain } from "@/app/types/chains"
import { Token } from "@/app/types/tokens"

interface SwapTokenDetailProps extends React.ComponentPropsWithoutRef<"div"> {
    label?: React.ReactNode,
    labelClass?: string,
    token: Token,
    tokenClass?: string,
    chain: Chain,
    chainClass?: string,
}

const SwapTokenDetail = React.forwardRef<HTMLDivElement, SwapTokenDetailProps>(({
    className,
    label,
    labelClass,
    token,
    tokenClass,
    chain,
    chainClass,
    ...props
}, ref) => (
    <div
        ref={ref}
        className={twMerge("flex flex-col flex-1 gap-4", className)}
        {...props}
    >
        <div className={twMerge("flex flex-row flex-1 justify-center items-center font-bold text-muted-500 text-center", labelClass)}>
            {label}
        </div>
        <div className="flex flex-row flex-1 justify-center items-center">
            <TokenImage
                token={token}
                size="lg"
            />
        </div>
        <div className="flex flex-col flex-1 justify-center items-center">
            <div className={twMerge("flex flex-row flex-1 justify-center items-center font-bold text-center", tokenClass)}>
                {token.symbol}
            </div>
            <div className={twMerge("flex flex-row flex-1 gap-2 justify-center items-center text-muted-500 text-center", chainClass)}>
                <ChainImageInline
                    chain={chain}
                    size="xs"
                    className="hidden sm:block"
                />
                {chain.name}
            </div>
        </div>
    </div>
))
SwapTokenDetail.displayName = "SwapTokenDetail"

export default SwapTokenDetail
