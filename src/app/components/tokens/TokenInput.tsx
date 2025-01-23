import Link from "next/link"
import * as React from "react"

import ChevronIcon from "@/app/components/icons/ChevronIcon"
import { ChainImageInline } from "@/app/components/images/ChainImage"
import { CurrencyIcon, CurrencyIconVariant } from "@/app/components/icons/CurrencyIcon"
import { TokenImage } from "@/app/components/images/TokenImage"
import Button from "@/app/components/ui/Button"
import CurrencyAmount from "@/app/components/ui/CurrencyAmount"
import DecimalAmount from "@/app/components/ui/DecimalAmount"
import { DecimalInput } from "@/app/components/ui/DecimalInput"
import { NumberFormatType } from "@/app/config/numbers"
import { iconSizes } from "@/app/config/styling"
import { formattedAmountToLocale } from "@/app/lib/numbers"
import { Chain } from "@/app/types/chains"
import { StyleDirection } from "@/app/types/styling"
import { Token } from "@/app/types/tokens"

export interface TokenInputProps extends React.ComponentPropsWithoutRef<"div"> {
    selectedChain?: Chain,
    selectedToken?: Token,
    amountValue?: string,
    handleAmountInput?: (value: string) => void,
    isDst?: boolean,
}

export const TokenInput = React.forwardRef<HTMLDivElement, TokenInputProps>(({
    selectedChain,
    selectedToken,
    amountValue,
    handleAmountInput,
    isDst,
    ...props
}, ref) => {

    const selectUrl = `/swap/select/${isDst ? "to" : "from"}`

    return (
        <div
            ref={ref}
            className="input-container"
            {...props}
        >
            <div className="flex flex-col flex-1 p-4 gap-2 w-full">
                <div className="flex flex-row flex-1 gap-4">
                    <Link
                        className="clear-border-outline clear-bg flex flex-row flex-1 gap-2 justify-start items-center font-bold"
                        href={selectUrl}
                        prefetch={true}
                    >
                        {isDst ? "To" : "From"}
                        {selectedChain && (<>
                            <ChainImageInline
                                chain={selectedChain}
                                size="xs"
                            />
                            {selectedChain.name}
                        </>)}
                    </Link>
                    <div className="flex flex-row shrink justify-end items-center font-bold text-end">
                        {selectedToken ? selectedToken.name : "Select Token"}
                    </div>
                </div>
                <div className="flex flex-row flex-1 gap-4">
                    <div className="flex flex-row flex-1 justify-start items-center font-bold text-xl">
                        <DecimalInput
                            id={`${isDst ? "dst" : "src"}Amount`}
                            name={`${isDst ? "dst" : "src"}Amount`}
                            className="p-0 m-0 text-2xl"
                            value={isDst ? formattedAmountToLocale(amountValue as Intl.StringNumericLiteral, NumberFormatType.Input) : amountValue}
                            setValue={handleAmountInput}
                            disabled={isDst || selectedChain === undefined || selectedToken === undefined}
                        />
                    </div>
                    <div className="flex flex-row shrink justify-end items-center text-muted-500">
                        <Link
                            className="clear-border-outline clear-bg flex flex-row flex-1 p-0 gap-4 min-w-fit w-full h-full justify-center items-center transition text-muted-500 hover:text-white"
                            href={selectUrl}
                            prefetch={true}
                        >
                            {selectedToken ? (
                                <TokenImage token={selectedToken} />
                            ) : (
                                <CurrencyIcon variant={CurrencyIconVariant.UsdCircle} className={iconSizes.xl} />
                            )}
                            <ChevronIcon direction={StyleDirection.Down} />
                        </Link>
                    </div>
                </div>
                {selectedToken && (
                    <div className="flex flex-row flex-1 gap-4 text-muted-500">
                        <div className="flex flex-row flex-1 justify-start items-center">
                            <CurrencyAmount amountFormatted="0" />
                        </div>
                        <div className="flex flex-row shrink gap-4 justify-end items-center font-bold text-end">
                            {handleAmountInput && isDst !== true && selectedToken.balanceFormatted !== undefined && selectedToken.isNative !== true && (
                                <Button
                                    className="clear-bg clear-border-outline p-0 m-0 text-muted-500 hover:text-link-500"
                                    replaceClass={true}
                                    onClick={handleAmountInput.bind(this, selectedToken.balanceFormatted)}
                                >
                                    Max
                                </Button>
                            )}
                            <DecimalAmount
                                amountFormatted={selectedToken.balanceFormatted}
                                symbol={selectedToken.symbol}
                                type={NumberFormatType.Precise}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
})
TokenInput.displayName = "TokenInput"
