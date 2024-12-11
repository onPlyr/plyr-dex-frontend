import * as React from "react"

import ChevronIcon from "@/app/components/icons/ChevronIcon"
import { ChainImage } from "@/app/components/images/ChainImage"
import { CurrencyIcon, CurrencyIconVariant } from "@/app/components/icons/CurrencyIcon"
import { TokenImage } from "@/app/components/images/TokenImage"
import { SelectTokenDialog } from "@/app/components/tokens/SelectTokenDialog"
import Button from "@/app/components/ui/Button"
import DecimalAmount from "@/app/components/ui/DecimalAmount"
import { DecimalInput } from "@/app/components/ui/DecimalInput"
import Label from "@/app/components/ui/Label"
import { NumberFormatType } from "@/app/config/numbers"
import { iconSizes } from "@/app/config/styling"
import { Chain } from "@/app/types/chains"
import { StyleDirection } from "@/app/types/styling"
import { Token } from "@/app/types/tokens"

export interface TokenSelectAmountComboItemProps extends React.ComponentPropsWithoutRef<"div"> {
    selectedChain?: Chain,
    selectedToken?: Token,
    setSelectedToken?: (token?: Token) => void,
    amountValue?: string,
    handleAmountInput?: (value: string) => void,
    dst?: boolean,
}

export const TokenSelectAmountComboItem = React.forwardRef<HTMLDivElement, TokenSelectAmountComboItemProps>(({
    selectedChain,
    selectedToken,
    setSelectedToken,
    amountValue,
    handleAmountInput,
    dst,
    ...props
}, ref) => (
    <div
        ref={ref}
        className="flex flex-col flex-1 input"
        {...props}
    >
        <div className="flex flex-row flex-1 gap-4 font-bold text-sm">
            <Label htmlFor={`${dst ? "dst" : "src"}Amount`}>
                {dst ? "To" : "From"}
            </Label>
            {selectedChain && (
                <div className="flex flex-row flex-1 justify-start items-center gap-4">
                    <ChainImage
                        chain={selectedChain}
                        size="xs"
                    />
                    {selectedChain.name}
                </div>
            )}
            {selectedToken && (
                <div className="flex flex-row flex-initial justify-end items-center">
                    {selectedToken.name}
                </div>
            )}
        </div>
        <div className="flex flex-row flex-1 gap-4 justify-start">
            <div className="flex flex-row flex-1">
                <DecimalInput
                    id={`${dst ? "dst" : "src"}Amount`}
                    name={`${dst ? "dst" : "src"}Amount`}
                    className="clear-border-outline clear-bg px-0 m-0 font-bold text-3xl"
                    value={amountValue}
                    setValue={handleAmountInput}
                    disabled={selectedChain === undefined || selectedToken === undefined}
                />
            </div>
            <div className="flex flex-row flex-initial items-center gap-4">
                {dst !== true && selectedChain && selectedToken && selectedToken.balanceFormatted !== undefined && parseFloat(selectedToken.balanceFormatted) > 0 && (
                    <div
                        className="px-2 py-1 border border-white rounded-full bg-[#ffffff10] text-white text-xs cursor-pointer"
                        onClick={handleAmountInput?.bind(this, selectedToken.balanceFormatted)}
                    >
                        Max
                    </div>
                )}
                <SelectTokenDialog
                    trigger=<Button className="clear-border-outline clear-bg flex flex-row flex-1 p-0 min-w-fit w-full h-full justify-center items-center transition text-muted-500 hover:text-white">
                        {selectedToken ? (
                            <TokenImage token={selectedToken} />
                        ) : (
                            <CurrencyIcon variant={CurrencyIconVariant.UsdCircle} className={iconSizes.xl} />
                        )}
                        <ChevronIcon direction={StyleDirection.Down} />
                    </Button>
                    header="Select Token"
                    selectedChain={selectedChain}
                    selectedToken={selectedToken}
                    setSelectedToken={setSelectedToken}
                />
            </div>
        </div>
        <div className="flex flex-row flex-1 justify-between text-sm">
            <div className="text-muted-500">
                $0.00
            </div>
            <div className="flex flex-row flex-1 gap-6 justify-end font-bold text-muted-500">

                {selectedToken ? (
                    <DecimalAmount
                        amountFormatted={selectedToken.balanceFormatted}
                        symbol={selectedToken.symbol}
                        type={NumberFormatType.Precise}
                    />
                ) : "Select Token"}
            </div>
        </div>
    </div>
))
TokenSelectAmountComboItem.displayName = "TokenSelectAmountComboItem"
