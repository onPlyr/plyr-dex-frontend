import { createContext } from "react"
import { Address, isAddressEqual, parseUnits } from "viem"

import { DefaultTokenSortType, Tokens } from "@/app/config/tokens"
import { getChain } from "@/app/lib/chains"
import { Chain } from "@/app/types/chains"
import { FavouriteTokenData, FavouriteTokensContextType, Token, TokenId, TokenSortType } from "@/app/types/tokens"

export const FavouriteTokensContext = createContext({} as FavouriteTokensContextType)

export const getIsFavouriteToken = (token: Token, favouriteTokens?: FavouriteTokenData) => {
    return favouriteTokens?.data?.[token.chainId]?.find((tokenId) => token.id === tokenId) !== undefined
}

export const sortIsFavouriteToken = (a: Token, b: Token, favouriteTokens?: FavouriteTokenData) => {
    if (favouriteTokens && favouriteTokens.data) {
        const aIsFavourite = getIsFavouriteToken(a, favouriteTokens)
        const bIsFavourite = getIsFavouriteToken(b, favouriteTokens)
        if (aIsFavourite && !bIsFavourite) {
            return -1
        }
        else if (!aIsFavourite && bIsFavourite) {
            return 1
        }
        return 0
    }
    return 0
}

export const sortTokens = (tokens: Token[], sortType?: TokenSortType, favouriteTokens?: FavouriteTokenData) => {

    const sortedTokens = tokens.slice(0)

    if (sortedTokens.length > 1) {

        const sortBy = sortType ?? DefaultTokenSortType

        if (sortBy === TokenSortType.Symbol) {
            sortedTokens.sort((a, b) => {
                return sortIsFavouriteToken(a, b, favouriteTokens) || a.filters.symbol.localeCompare(b.filters.symbol) || a.filters.chain.localeCompare(b.filters.chain)
            })
        }

        else if (sortBy === TokenSortType.Chain) {
            sortedTokens.sort((a, b) => {
                return sortIsFavouriteToken(a, b, favouriteTokens) || a.filters.chain.localeCompare(b.filters.chain) || a.filters.symbol.localeCompare(b.filters.symbol)
            })
        }

        else if (sortBy === TokenSortType.BalanceValue) {
            sortedTokens.sort((a, b) => {
                if ((a.value && b.value && a.value > b.value) || (a.value && !b.value)) {
                    return sortIsFavouriteToken(a, b, favouriteTokens) || -1
                }
                else if ((a.value && b.value && a.value < b.value) || (b.value && !a.value)) {
                    return sortIsFavouriteToken(a, b, favouriteTokens) || 1
                }
                else if ((a.balanceFormatted && b.balanceFormatted && parseUnits(a.balanceFormatted, 18) > parseUnits(b.balanceFormatted, 18)) || (a.balance && !b.balance)) {
                    return sortIsFavouriteToken(a, b, favouriteTokens) || -1
                }
                else if ((a.balanceFormatted && b.balanceFormatted && parseUnits(a.balanceFormatted, 18) < parseUnits(b.balanceFormatted, 18)) || (b.balance && !a.balance)) {
                    return sortIsFavouriteToken(a, b, favouriteTokens) || 1
                }
                return sortIsFavouriteToken(a, b, favouriteTokens) || a.filters.symbol.localeCompare(b.filters.symbol)
            })
        }
    }

    return sortedTokens
}

export const getTokens = ({
    sortType,
    ignoreSort = false,
    includeHidden = false,
}: {
    sortType?: TokenSortType,
    ignoreSort?: boolean,
    includeHidden?: boolean,
}) => {
    const tokens = ignoreSort ? Tokens.slice(0) : sortTokens(Tokens, sortType)
    return includeHidden ? tokens : tokens.filter((token) => token.isHidden !== true)
}

export const getToken = (tokenId: TokenId, chain: Chain) => {
    return getTokens({
        ignoreSort: true,
    }).find((token) => token.id === tokenId && token.chainId === chain.id)
}

export const getTokenByAddress = (address: Address, chain: Chain) => {
    return getTokens({
        ignoreSort: true,
    }).find((token) => token.chainId === chain.id && (token.isNative && token.wrappedAddress ? isAddressEqual(address, token.wrappedAddress) : isAddressEqual(address, token.address)))
}

export const getNativeToken = (chain: Chain) => {
    return getTokens({
        ignoreSort: true,
    }).find((token) => token.chainId === chain.id && token.isNative)
}

export const getChainTokens = ({
    chain,
    ignoreSort = false,
}: {
    chain: Chain,
    ignoreSort?: boolean,
}) => {
    return getTokens({
        ignoreSort: ignoreSort,
    }).filter((token) => token.chainId === chain.id)
}

export const getTokenByBridgeAddress = (bridgeAddress: Address, srcChain: Chain, dstChain: Chain) => {
    return getTokens({
        ignoreSort: true,
    }).find((token) => token.chainId === dstChain.id && token.bridges?.[srcChain.id]?.address && isAddressEqual(bridgeAddress, token.bridges[srcChain.id]!.address))
}

export const filterTokens = (tokens: Token[], queryString?: string, selectedChain?: Chain, favouriteTokens?: FavouriteTokenData) => {

    let tokenResults = tokens.slice(0)
    let chainResults: Chain[] = []

    const query = queryString?.trim().toLowerCase()
    if (query !== undefined && query.length !== 0) {
        tokenResults = tokenResults.filter((item) => item.filters.name.includes(query) || item.filters.symbol.includes(query) || item.filters.address.includes(query))
    }

    chainResults = [...new Set(tokenResults.map((token) => token.chainId))].map((id) => getChain(id)).filter((chain) => chain !== undefined).sort((a, b) => {
        return a.name.toLowerCase().localeCompare(b.name.toLowerCase())
    })

    if (selectedChain) {
        tokenResults = tokenResults.filter((token) => token.chainId === selectedChain.id)
    }

    tokenResults = sortTokens(tokenResults, DefaultTokenSortType, favouriteTokens)

    return {
        tokenResults,
        chainResults,
    }
}
