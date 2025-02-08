import React from "react"

import { ChainImageInline } from "@/app/components/images/ChainImage"
import { TokenImage } from "@/app/components/images/TokenImage"
import FavouriteTokenDetail from "@/app/components/tokens/FavouriteTokenDetail"
import CurrencyAmount from "@/app/components/ui/CurrencyAmount"
import DecimalAmount from "@/app/components/ui/DecimalAmount"
import { SelectItem } from "@/app/components/ui/SelectItem"
import { NumberFormatType } from "@/app/config/numbers"
import { imgSizes } from "@/app/config/styling"
import { getChain } from "@/app/lib/chains"
import { Token } from "@/app/types/tokens"

export interface TokenDetailItemProps extends React.ComponentPropsWithoutRef<typeof SelectItem> {
    token: Token,
    showFavourites?: boolean,
}

export const TokenDetailItem = React.forwardRef<React.ComponentRef<typeof SelectItem>, TokenDetailItemProps>(({
    token,
    showFavourites = true,
    ...props
}, ref) => {

    // todo: add token balance values once token prices are added
    const chain = getChain(token.chainId)

    return (
        <SelectItem
            ref={ref}
            {...props}
        >
            <div className="flex flex-col sm:flex-row flex-1 gap-x-4 gap-y-2">
                <div className="flex flex-row flex-1 gap-4">
                    <div className="flex flex-col flex-none justify-center items-center">
                        <TokenImage token={token} />
                    </div>
                    <div className="flex flex-col flex-1">
                        <div className="flex flex-row flex-1 gap-2 items-end">
                            <div className="font-bold">
                                {token.symbol}
                            </div>
                            <div className="hidden md:flex text-muted-500">
                                {token.name}
                            </div>
                        </div>
                        {chain && (
                            <div className="flex flex-row flex-1 gap-2 items-center text-muted-400">
                                <ChainImageInline
                                    chain={chain}
                                    className={imgSizes.xs}
                                />
                                {chain.name}
                            </div>
                        )}
                    </div>
                    {showFavourites && (
                        <FavouriteTokenDetail
                            token={token}
                            className="flex sm:hidden"
                        />
                    )}
                </div>
                {(token.balanceFormatted !== undefined || token.valueFormatted !== undefined) && (
                    <div className="flex flex-row sm:flex-col flex-1 justify-center items-end">
                        <DecimalAmount
                            amountFormatted={token.balanceFormatted}
                            symbol={token.symbol}
                            type={NumberFormatType.Precise}
                            className="font-bold text-end"
                        />
                        <div className="flex flex-row flex-1 h-full justify-end sm:justify-start items-center sm:items-end text-muted-500 text-end">
                            <CurrencyAmount amountFormatted="0" />
                        </div>
                    </div>
                )}
                {showFavourites && (
                    <FavouriteTokenDetail
                        token={token}
                        className="hidden sm:flex"
                    />
                )}
            </div>
        </SelectItem>
    )
})
TokenDetailItem.displayName = "TokenDetailItem"
