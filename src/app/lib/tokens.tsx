import { createContext } from "react"
import { Address, parseUnits } from "viem"

import { SupportedChains } from "@/app/config/chains"
import { DefaultTokenSortType, Tokens } from "@/app/config/tokens"
import { getChain } from "@/app/lib/chains"
import { Chain } from "@/app/types/chains"
import { FavouriteTokenData, FavouriteTokensContextType, Token, TokenId, TokenSortType } from "@/app/types/tokens"

export const FavouriteTokensContext = createContext({} as FavouriteTokensContextType)

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

export const getTokens = (sortType?: TokenSortType, ignoreSort?: boolean) => {
    return ignoreSort ? Tokens.slice(0) : sortTokens(Tokens, sortType)
}

export const getToken = (tokenId: TokenId, chain: Chain) => {
    return Tokens.slice(0).find((token) => token.id === tokenId && token.chainId === chain.id)
}

export const getTokenByAddress = (address: Address, chain: Chain) => {
    return Tokens.slice(0).find((token) => token.filters.address === address.toLowerCase() && token.chainId === chain.id)
}

export const getNativeToken = (chain: Chain) => {
    return Tokens.slice(0).find((token) => token.chainId === chain.id && token.isNative)
}

export const getChainTokens = (chain: Chain, ignoreSort?: boolean) => {
    return getTokens(undefined, ignoreSort).filter((token) => token.chainId === chain.id)
}

export const getIsTokenOrVariant = (srcToken: Token, dstToken: Token) => {
    return srcToken.id === dstToken.id || getIsVariant(srcToken, dstToken) ? true : false
}

export const getIsVariant = (srcToken: Token, dstToken: Token) => {
    return (srcToken.isNative && srcToken.wrappedToken && dstToken.id === srcToken.wrappedToken) || (dstToken.isNative && dstToken.wrappedToken && srcToken.id === dstToken.wrappedToken) ? true : false
}

export const getWrappedTokenVariant = (token: Token, chain: Chain) => {
    return token.isNative && token.wrappedToken ? getToken(token.wrappedToken, chain) : undefined
}

export const getNativeTokenVariant = (token: Token, chain: Chain) => {
    return token.isNative !== true ? Tokens.slice(0).find((nativeToken) => nativeToken.chainId === chain.id && nativeToken.isNative && nativeToken.wrappedToken === token.id) : undefined
}

export const getChainsForToken = (srcToken: Token, excludeVariants?: boolean) => {
    const chainIds = Tokens.slice(0).filter((token) => excludeVariants ? token.id === srcToken.id : getIsTokenOrVariant(token, srcToken)).map((token) => token.chainId)
    return Object.values(SupportedChains).filter((chain) => chainIds.includes(chain.id))
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
