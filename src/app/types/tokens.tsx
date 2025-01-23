import { Address } from "viem"

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
}

export interface TokenBridgeData {
    readonly address: Address,
    readonly type: TokenBridgeType,
}

interface TokenChainData {
    readonly address: Address,
    readonly chainSymbol?: string,
    readonly chainName?: string,
    readonly chainIcon?: TokenIcon,
    readonly chainIconBackground?: TokenIconBackground,
    readonly bridges?: {
        readonly [chainId in ChainId]?: TokenBridgeData
    }
    readonly isNative?: boolean,
    readonly wrappedAddress?: Address,
    readonly wrappedToken?: string,
    readonly isHidden?: boolean,
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

export enum TokenBridgeType {
    NativeHome = "nativeHome",
    NativeRemote = "nativeRemote",
    Erc20Home = "erc20Home",
    Erc20Remote = "erc20Remote"
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
