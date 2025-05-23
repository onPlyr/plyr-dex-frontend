import { useInView } from "motion/react"
import React, { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { twMerge } from "tailwind-merge"

import PlusIcon, { PlusIconVariant } from "@/app/components/icons/PlusIcon"
import Button from "@/app/components/ui/Button"
import { DefaultUserPreferences } from "@/app/config/preferences"
import { iconSizes } from "@/app/config/styling"
import usePreferences from "@/app/hooks/preferences/usePreferences"
import useTokens from "@/app/hooks/tokens/useTokens"
import { getFilteredChains } from "@/app/lib/chains"
import { Chain } from "@/app/types/chains"
import { NetworkMode, PreferenceType, TokenSortType } from "@/app/types/preferences"
import { isValidTokenAmount, Token, TokenAmount } from "@/app/types/tokens"
import { SortDirection } from "@/app/types/utils"

export interface UseTokenFiltersReturnType {
    filteredTokens: Token[],
    filteredChains: Chain[],
    selectedChainId?: number,
    setSelectedChainId: Dispatch<SetStateAction<number | undefined>>,
    query?: string,
    setQuery: Dispatch<SetStateAction<string | undefined>>,
    sortType: TokenSortType,
    setSortType: (type?: TokenSortType) => void,
    sortDirection: SortDirection,
    setSortDirection: Dispatch<SetStateAction<SortDirection>>,
    maxResults: number,
    showMoreResultsButton: React.ReactNode,
}

interface ShowMoreResultsButtonProps extends React.ComponentPropsWithoutRef<typeof Button> {
    numFilteredTokens: number,
    maxResults: number,
}

interface SortFunctionArgs {
    a: Token,
    aBalance?: TokenAmount,
    aValue?: TokenAmount,
    aIsFavourite?: boolean,
    b: Token,
    bBalance?: TokenAmount,
    bValue?: TokenAmount,
    bIsFavourite?: boolean,
}
type SortFunction = (args: SortFunctionArgs) => number

const ResultsPageSize = 10 as const
const TokenFilterFields = [
    "symbol",
    "name",
    "address",
] as const

const applyTokenFilters = (tokens: Token[], str?: string, chainId?: number) => {
    return tokens.filter((token) => (!chainId || token.chainId === chainId) && (!str || TokenFilterFields.some((field) => token.filters[field].includes(str))))
}

const favouriteSortFunction = (args: SortFunctionArgs) => {
    return (args.aIsFavourite && args.bIsFavourite) || (!args.aIsFavourite && !args.bIsFavourite) ? 0 : args.aIsFavourite ? -1 : 1
}

const symbolSortFunction = (args: SortFunctionArgs) => {
    return args.a.symbol.localeCompare(args.b.symbol)
}

const valueSortFunction = (args: SortFunctionArgs) => {
    if (isValidTokenAmount(args.aValue) || isValidTokenAmount(args.bValue) || isValidTokenAmount(args.aBalance) || isValidTokenAmount(args.bBalance)) {
        return Number((args.aValue?.amount ?? BigInt(0)) - (args.bValue?.amount ?? BigInt(0))) || (parseFloat(args.aBalance?.formatted ?? "0")) - (parseFloat(args.bBalance?.formatted ?? "0"))
    }
    return symbolSortFunction({ a: args.b, b: args.a })
}

const getFilteredAndSortedChains = (networkMode: NetworkMode, tokens: Token[], selectedChainId?: number) => {
    return getFilteredChains(networkMode).filter((chain) => selectedChainId ? chain.id === selectedChainId : tokens.some((token) => token.chainId === chain.id)).sort((a, b) => a.name.localeCompare(b.name))
}

const TokenSortFunctions: Record<TokenSortType, SortFunction> = {
    [TokenSortType.Value]: valueSortFunction,
    [TokenSortType.Symbol]: symbolSortFunction,
} as const

const ShowMoreResultsButton = React.forwardRef<React.ComponentRef<typeof Button>, ShowMoreResultsButtonProps>(({
    className,
    numFilteredTokens,
    maxResults,
    ...props
}, ref) => (
    <Button
        ref={ref}
        className={twMerge(
            "clear-bg clear-border-outline inline-flex flex-row p-4 gap-2 justify-center items-center text-muted-500",
            className,
            numFilteredTokens <= maxResults ? "hidden" : undefined,
        )}
        {...props}
    >
        Show more
        <PlusIcon
            className={iconSizes.sm}
            variant={PlusIconVariant.Circle}
        />
    </Button>
))
ShowMoreResultsButton.displayName = "ShowMoreResultsButton"

const useTokenFilters = (tokens: Token[]): UseTokenFiltersReturnType => {

    const { getPreference } = usePreferences()
    const { useBalancesData, useTokenPricesData, getIsFavouriteToken } = useTokens()
    const { getBalance } = useBalancesData
    const { getAmountValue } = useTokenPricesData
    const networkMode = useMemo(() => getPreference(PreferenceType.NetworkMode), [getPreference])

    const [filteredTokens, setFilteredTokens] = useState(tokens)
    const [filteredChains, setFilteredChains] = useState(getFilteredAndSortedChains(networkMode, filteredTokens))
    const [selectedChainId, setSelectedChainId] = useState<number>()
    const [query, setQuery] = useState<string>()
    const [sortType, setSortTypeState] = useState(getPreference(PreferenceType.TokenSortType))
    const [sortDirection, setSortDirection] = useState<SortDirection>(SortDirection.Descending)
    const [maxResults, setMaxResults] = useState<number>(ResultsPageSize)

    const setSortType = useCallback((type?: TokenSortType) => {
        setSortTypeState(type ?? DefaultUserPreferences[PreferenceType.TokenSortType])
    }, [setSortTypeState])

    const sortCompareFunction = useCallback((tokenA: Token, tokenB: Token) => {

        const tokenABalance = getBalance(tokenA)
        const tokenAData = {
            balance: tokenABalance,
            value: getAmountValue(tokenA, tokenABalance),
            isFavourite: getIsFavouriteToken(tokenA),
        }

        const tokenBBalance = getBalance(tokenB)
        const tokenBData = {
            balance: tokenBBalance,
            value: getAmountValue(tokenB, tokenBBalance),
            isFavourite: getIsFavouriteToken(tokenB),
        }

        const favouriteSortData: SortFunctionArgs = {
            a: tokenA,
            aBalance: tokenAData.balance,
            aValue: tokenAData.value,
            aIsFavourite: tokenAData.isFavourite,
            b: tokenB,
            bBalance: tokenBData.balance,
            bValue: tokenBData.value,
            bIsFavourite: tokenBData.isFavourite,
        }

        const sortByFavourite = favouriteSortFunction(favouriteSortData)
        const sortByType = TokenSortFunctions[sortType](sortDirection === SortDirection.Ascending ? favouriteSortData : {
            a: tokenB,
            aBalance: tokenBData.balance,
            aValue: tokenBData.value,
            aIsFavourite: tokenBData.isFavourite,
            b: tokenA,
            bBalance: tokenAData.balance,
            bValue: tokenAData.value,
            bIsFavourite: tokenAData.isFavourite,
        })

        return sortByFavourite || sortByType

    }, [getBalance, getAmountValue, getIsFavouriteToken, sortType, sortDirection])

    useEffect(() => {

        const filteredTokens = applyTokenFilters(tokens, query?.trim().toLowerCase(), selectedChainId).sort((a, b) => sortCompareFunction(a, b))

        setFilteredTokens(filteredTokens)
        setFilteredChains(getFilteredAndSortedChains(networkMode, filteredTokens, selectedChainId))

    }, [tokens, networkMode, selectedChainId, query, sortCompareFunction])

    useEffect(() => {
        setMaxResults(ResultsPageSize)
    }, [selectedChainId, query])

    const moreResultsButtonRef = useRef(null)
    const moreResultsButtonInView = useInView(moreResultsButtonRef)
    const showMoreResults = useCallback((num: number = ResultsPageSize) => setMaxResults((prev) => prev + num), [setMaxResults])
    const showMoreResultsButton = <ShowMoreResultsButton
        ref={moreResultsButtonRef}
        onClick={showMoreResults.bind(this, ResultsPageSize)}
        numFilteredTokens={filteredTokens.length}
        maxResults={maxResults}
    />

    useEffect(() => {
        if (moreResultsButtonInView) {
            showMoreResults()
        }
    }, [moreResultsButtonInView, showMoreResults])

    return {
        filteredTokens: filteredTokens,
        filteredChains: filteredChains,
        selectedChainId: selectedChainId,
        setSelectedChainId: setSelectedChainId,
        query: query,
        setQuery: setQuery,
        sortType: sortType,
        setSortType: setSortType,
        sortDirection: sortDirection,
        setSortDirection: setSortDirection,
        maxResults: maxResults,
        showMoreResultsButton: showMoreResultsButton,
    }
}

export default useTokenFilters