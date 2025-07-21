import { Address } from "viem"

import { ApiProvider } from "@/app/types/apis"
import { TokenBridge } from "@/app/types/bridges"
import { ChainId } from "@/app/types/chains"
import { IconFormat } from "@/app/types/styling"
import { WithRequired } from "@/app/types/utils"

export type TokenIcon = `${string}.${IconFormat}`

// id: unique identifier for the same token across multiple chains
// uid: unique identifier for each token on each chain, across supported + custom tokens
export type TokenId = Lowercase<string>
export type TokenUid = `${ChainId}:${Address}`

// chain id : cell address : token a id / token b id
export type CellTokenPairId = `${ChainId}:${Address}:${TokenId}/${TokenId}`
export type CellTokenPairs = Map<CellTokenPairId, boolean>

interface BaseTokenData<TIsSwapPathToken extends boolean = boolean> {
    readonly id: TokenId,
    readonly symbol: string,
    readonly priceId?: TokenId, // override id used for price queries, defaults to uid if unset
    readonly name: string,
    readonly decimals: number,
    readonly icon?: TokenIcon,
    readonly bridges?: TokenBridge[],
    readonly isSwapPathToken?: TIsSwapPathToken,
    readonly isCustomToken?: boolean,
    isUnconfirmed?: boolean,
}

export interface TokenApiData {
    readonly id: string,
}

interface TokenChainData<TCanBridge extends boolean = boolean, TIsSwapPathToken extends boolean = boolean> {
    readonly priceId?: TokenId,
    readonly address: Address,
    readonly displaySymbol?: string,
    readonly displayName?: string,
    readonly displayIcon?: TokenIcon,
    readonly apiData?: {
        readonly [provider in ApiProvider]?: TokenApiData
    },
    readonly isNative?: boolean,
    readonly wrappedAddress?: Address,
    readonly wrappedToken?: string,
    readonly canBridge?: TCanBridge,
    readonly isSwapPathToken?: TIsSwapPathToken,
    readonly isDisabled?: boolean,
    readonly isDefaultSwapRouteToken?: boolean,
}

export interface TokenFilterData {
    readonly symbol: Lowercase<string>,
    readonly name: Lowercase<string>,
    readonly address: Lowercase<string>,
}

export interface BaseToken extends BaseTokenData {
    readonly chains: {
        readonly [chainId in ChainId]?: TokenChainData
    },
}

export interface Token<TCanBridge extends boolean = boolean, TIsSwapPathToken extends boolean = boolean> extends BaseTokenData<TIsSwapPathToken>, TokenChainData<TCanBridge, TIsSwapPathToken> {
    readonly chainId: ChainId,
    readonly uid: TokenUid,
    readonly filters: TokenFilterData,
}
export type TokenJson = Omit<Token, "icon" | "bridges" | "displaySymbol" | "displayName" | "displayIcon" | "apiData" | "filters">
interface NativeToken extends WithRequired<Token, "isNative" | "wrappedAddress"> {
    readonly isNative: true,
}

export const isNativeToken = (token?: Partial<Token>): token is NativeToken => {
    return !!token && !!token.isNative && !!token.wrappedAddress
}

export type BaseBridgeToken = WithRequired<BaseToken, "bridges">
export type BridgeToken = WithRequired<Token<true>, "canBridge">

export const isBaseBridgeToken = (token: BaseToken): token is BaseBridgeToken => !!token.bridges && !!token.bridges.length
export const isBridgeToken = (token: Token): token is BridgeToken => !!token.canBridge

export type SwapPathToken = WithRequired<Token<true, true>, "isSwapPathToken">
export const isSwapPathToken = (token: Token): token is SwapPathToken => !!token.isSwapPathToken

interface DefaultSwapRouteToken extends WithRequired<Token, "isDefaultSwapRouteToken"> {
    readonly isDefaultSwapRouteToken: true,
}

export const isDefaultSwapRouteToken = (token: Token): token is DefaultSwapRouteToken => !!token.isDefaultSwapRouteToken

interface BaseTokenAmount {
    amount?: bigint,
    formatted?: string,
}
export type ValidTokenAmount = Required<BaseTokenAmount>
export type TokenAmount = BaseTokenAmount | ValidTokenAmount

export const isValidTokenAmount = (tokenAmount?: TokenAmount): tokenAmount is ValidTokenAmount => {
    return !!tokenAmount && tokenAmount.amount !== undefined && tokenAmount.formatted !== undefined
}

export type TokenPair = [Token, Token]
export type TokenDataMap = Map<TokenUid, Token>
export type TokenAmountDataMap = Map<TokenUid, TokenAmount>
export type FavouriteTokenData = Set<TokenUid>
export type DefaultSwapRouteTokenData = Map<number, Token | undefined>

export type GetTokenAddressFunctionArgs = WithRequired<Partial<Token>, "address">
export type GetTokenFunctionArgs = WithRequired<Partial<Token>, "address" | "chainId">
export type GetTokenByIdFunctionArgs = WithRequired<Partial<Token>, "id" | "chainId">
export type GetTokenByUidFunctionArgs = WithRequired<Partial<Token>, "uid" | "address" | "chainId">
export type GetTokenFunction = (data: GetTokenFunctionArgs) => Token
export type GetNativeTokenFunction = (chainid?: ChainId) => Token | undefined
export type GetTokenFunctionAsync = (data: GetTokenFunctionArgs) => Promise<Token | undefined>
export type GetSupportedTokenFunction = (data: GetTokenFunctionArgs) => Token | undefined
export type GetSupportedTokenByIdFunction = (data: GetTokenByIdFunctionArgs) => Token | undefined
export type GetTokenFilterDataFunctionArgs = WithRequired<Partial<Token>, "address" | "name" | "symbol">
export type GetTokenAmountFunction = (token?: Token) => TokenAmount | undefined
export type GetTokenAmountValueFunction = (token?: Token, amount?: TokenAmount) => TokenAmount
export type GetTokenBalanceFunction = (token?: Token) => TokenAmount | undefined