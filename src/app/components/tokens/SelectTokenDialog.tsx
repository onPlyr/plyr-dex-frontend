"use client"

import * as React from "react"
import { useCallback, useEffect, useState } from "react"

import ErrorIcon from "@/app/components/icons/ErrorIcon"
import { ChainImage } from "@/app/components/images/ChainImage"
import { TokenDetailItem } from "@/app/components/tokens/TokenDetailItem"
import { Dialog, DialogProps } from "@/app/components/ui/Dialog"
import SearchInput from "@/app/components/ui/SearchInput"
import { SelectItem } from "@/app/components/ui/SelectItem"
import { SelectItemToggle } from "@/app/components/ui/SelectItemToggle"
import { SupportedChains } from "@/app/config/chains"
import { iconSizes } from "@/app/config/styling"
import useAccountBalances from "@/app/hooks/account/useAccountBalances"
import { filterTokens } from "@/app/lib/tokens"
import { Chain } from "@/app/types/chains"
import { Token } from "@/app/types/tokens"
import useFavouriteTokens from "@/app/hooks/tokens/useFavouriteTokens"

export interface SelectTokenDialogProps extends DialogProps {
    selectedChain?: Chain,
    selectedToken?: Token,
    setSelectedToken?: (token?: Token) => void,
}

export const SelectTokenDialog = React.forwardRef<React.ElementRef<typeof Dialog>, SelectTokenDialogProps>(({
    trigger,
    header,
    selectedChain,
    selectedToken,
    setSelectedToken,
    disabled = false,
    ...props
}, ref) => {

    // todo: clean up dst token list to show/highlight only available routes

    const { data: allTokens } = useAccountBalances()
    const { favouriteTokens } = useFavouriteTokens()
    const allChains = Object.values(SupportedChains).slice(0)

    const [tokens, setTokens] = useState<Token[]>(allTokens)
    const [chains, setChains] = useState<Chain[]>(allChains)
    const [selectedFilterChain, setSelectedFilterChain] = useState<Chain | undefined>(selectedChain)
    const [query, setQuery] = useState<string>()
    const [isOpen, setIsOpen] = useState<boolean>(false)

    useEffect(() => {
        const { tokenResults, chainResults } = filterTokens(allTokens, query, selectedFilterChain, favouriteTokens)
        setTokens(tokenResults)
        setChains(chainResults)
    }, [query, selectedFilterChain, allTokens, favouriteTokens])

    useEffect(() => {
        if (isOpen && selectedToken) {
            setIsOpen(false)
        }
    }, [selectedToken])

    const handleSearchInput = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(event.target.value)
    }, [setQuery])

    const clearQuery = useCallback(() => {
        setQuery(undefined)
    }, [setQuery])

    const handleClearAllFilters = useCallback(() => {
        clearQuery()
        setSelectedFilterChain(undefined)
    }, [clearQuery, setSelectedFilterChain])

    return (
        <Dialog
            ref={ref}
            trigger={trigger}
            header={header}
            open={isOpen}
            onOpenChange={setIsOpen}
            disabled={disabled}
            {...props}
        >
            {chains && chains.length !== 0 && (
                <div className="flex flex-row flex-1 justify-start items-start flex-wrap gap-2">
                    {chains?.map((chain, i) => {
                        const isSelected = selectedFilterChain && selectedFilterChain.id === chain.id
                        return (
                            <SelectItemToggle
                                key={i}
                                onClick={setSelectedFilterChain.bind(this, isSelected ? undefined : chain)}
                                isSelected={isSelected}
                            >
                                <ChainImage chain={chain} size="xs" />
                                {chain.name}
                            </SelectItemToggle>
                        )
                    })}
                </div>
            )}
            <SearchInput
                value={query}
                clearValue={clearQuery}
                handleInput={handleSearchInput}
                placeholder="Search by name, symbol or address"
            />
            <div className="flex flex-col flex-1 gap-4">
                <div className="flex flex-row flex-1 items-center">
                    <div className="flex flex-col sm:flex-row flex-1 gap-x-2 gap-y-1">
                        <div className="flex flex-row flex-1 items-center text-sm">
                            {selectedFilterChain ? (
                                <div>Showing <span className="font-bold">only</span> tokens on:</div>
                            ) : (
                                <div>Showing tokens on <span className="font-bold">all chains</span></div>
                            )}
                        </div>
                        {(query || selectedFilterChain) && (
                            <div className="flex flex-col sm:flex-row flex-1 gap-x-2 gap-y-1 sm:justify-end items-start sm:items-center text-sm">
                                {selectedFilterChain && (
                                    <SelectItemToggle
                                        onClick={setSelectedFilterChain.bind(this, undefined)}
                                        isSelected={true}
                                    >
                                        <ChainImage chain={selectedFilterChain} size="xs" />
                                        {selectedFilterChain.name}
                                    </SelectItemToggle>
                                )}
                                {query && (
                                    <SelectItemToggle
                                        onClick={handleClearAllFilters.bind(this)}
                                        isSelected={true}
                                    >
                                        Clear all filters
                                    </SelectItemToggle>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex flex-col flex-1">
                    {tokens && tokens.length > 0 ? tokens.map((token, i) => {
                        const isSelected = selectedToken && selectedToken.id === token.id && selectedToken.chainId === token.chainId
                        return (
                            <TokenDetailItem
                                key={i}
                                token={token}
                                onClick={isSelected ? setIsOpen.bind(this, false) : setSelectedToken?.bind(this, token)}
                                isSelected={isSelected}
                            />
                        )
                    }) : (
                        <SelectItem>
                            <ErrorIcon className={iconSizes.lg} />
                            No tokens found. {(selectedFilterChain || query) && `Please check or clear any selected filters and try again.`}
                        </SelectItem>
                    )}
                </div>
            </div>
        </Dialog>
    )
})
SelectTokenDialog.displayName = "SelectTokenDialog"
