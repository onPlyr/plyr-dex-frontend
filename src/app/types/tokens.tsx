import { Address } from "viem"

import { ApiProvider } from "@/app/types/apis"
import { TokenBridge } from "@/app/types/bridges"
import { ChainId } from "@/app/types/chains"
import { IconFormat } from "@/app/types/styling"

type TokenIcon = `${string}.${IconFormat}`
type TokenIconBackground = `#${string}`

// note: must be unique
// use slugify function in lib/strings for formatting
export type TokenId = Lowercase<string>

interface BaseTokenData {
    readonly id: TokenId,
    readonly symbol: string,
    readonly name: string,
    readonly decimals: number,
    readonly icon: TokenIcon,
    readonly iconBackground: TokenIconBackground,
    readonly bridges?: TokenBridge[],
}

export interface TokenApiData {
    readonly id: string,
}

interface TokenChainData {
    readonly address: Address,
    readonly displaySymbol?: string,
    readonly displayName?: string,
    readonly displayIcon?: TokenIcon,
    readonly displayIconBackground?: TokenIconBackground,
    readonly apiData?: {
        readonly [provider in ApiProvider]?: TokenApiData
    },
    readonly isNative?: boolean,
    readonly wrappedAddress?: Address,
    readonly wrappedToken?: string,
    readonly isHidden?: boolean,
    readonly canBridge?: boolean,
}

export interface TokenFilterData {
    readonly symbol: Lowercase<string>,
    readonly name: Lowercase<string>,
    readonly address: Lowercase<string>,
    readonly chain: Lowercase<string>,
    readonly chainId: Lowercase<string>,
}

export interface BaseToken extends BaseTokenData {
    readonly chains: {
        readonly [chainId in ChainId]?: TokenChainData
    },
}

export interface TokenBalance {
    balance?: bigint,
    balanceFormatted?: string,
    value?: bigint,
    valueFormatted?: string,
}

export interface Token extends BaseTokenData, TokenChainData, TokenBalance {
    readonly chainId: ChainId,
    readonly filters: TokenFilterData,
}

export enum TokenSortType {
    BalanceValue,
    Symbol,
    Chain,
}

export interface FavouriteTokenData {
    data: {
        [chainId in ChainId]?: TokenId[]
    },
}

export type FavouriteTokensContextType = {
    favouriteTokens: FavouriteTokenData,
    toggleFavouriteToken: (token: Token, favourites: FavouriteTokenData) => void,
}
