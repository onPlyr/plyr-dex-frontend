"use client"

import * as React from "react"
import { useCallback, useEffect, useState } from "react"

import { ChainImage } from "@/app/components/images/ChainImage"
import { Dialog } from "@/app/components/ui/Dialog"
import SearchInput from "@/app/components/ui/SearchInput"
import { SelectItem } from "@/app/components/ui/SelectItem"
import { SupportedChains } from "@/app/config/chains"
import { Chain } from "@/app/types/chains"

export interface SelectChainDialogProps extends React.ComponentPropsWithoutRef<typeof Dialog> {
    selectedChain?: Chain,
    setSelectedChain?: (chain?: Chain) => void,
}

export const SelectChainDialog = React.forwardRef<React.ElementRef<typeof Dialog>, SelectChainDialogProps>(({
    trigger,
    header,
    selectedChain,
    setSelectedChain,
    disabled = false,
    ...props
}, ref) => {

    const allChains = Object.values(SupportedChains)
    const [isOpen, setIsOpen] = useState<boolean>(false)
    const [query, setQuery] = useState<string>()
    const [chains, setChains] = useState<Chain[]>(allChains.slice(0))

    useEffect(() => {
        const queryStr = query?.trim().toLowerCase()
        const filteredChains = queryStr && queryStr.length !== 0 ? allChains.slice(0).filter((chain) => chain.name.toLowerCase().includes(queryStr) || chain.id.toString().includes(queryStr)) : allChains.slice(0)
        setChains(filteredChains)
    }, [query])

    const handleSearchInput = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(event.target.value)
    }, [setQuery])

    const clearQuery = useCallback(() => {
        setQuery(undefined)
    }, [setQuery])

    useEffect(() => {
        if (isOpen && selectedChain) {
            setIsOpen(false)
        }
    }, [selectedChain])

    return (
        <Dialog
            ref={ref}
            trigger={trigger}
            header={header}
            disabled={disabled || setSelectedChain === undefined}
            open={isOpen}
            onOpenChange={setIsOpen}
            {...props}
        >
            <SearchInput
                value={query}
                clearValue={clearQuery}
                handleInput={handleSearchInput}
                placeholder="Search by name or chain id"
            />
            <div className="flex flex-col flex-1">
                {chains?.map((chain, i) => {
                    const isSelected = selectedChain && selectedChain.id === chain.id
                    return (
                        <SelectItem
                            key={i}
                            onClick={setSelectedChain?.bind(this, chain)}
                            isSelected={isSelected}
                        >
                            <ChainImage chain={chain} />
                            <div className="flex flex-col flex-1 items-start">
                                <div className="font-bold">{chain.name}</div>
                                <div className="text-sm text-muted-400">{chain.id}</div>
                            </div>
                        </SelectItem>
                    )
                })}
            </div>
        </Dialog>
    )
})
SelectChainDialog.displayName = "SelectChainDialog"
