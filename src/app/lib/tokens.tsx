import { Address, getAddress } from "viem"

import { slugify, toShort } from "@/app/lib/strings"
import { ChainId } from "@/app/types/chains"
import { GetTokenAddressFunctionArgs, GetTokenFilterDataFunctionArgs, GetTokenFunction, isNativeToken, Token, TokenAmount, TokenAmountDataMap, TokenDataMap, TokenFilterData, TokenUid } from "@/app/types/tokens"

export const getTokenUid = (chainId: ChainId, address: Address): TokenUid => {
    return `${chainId}:${getAddress(address)}`
}

export const getTokenAddress = (token: GetTokenAddressFunctionArgs) => {
    return getAddress(isNativeToken(token) ? token.wrappedAddress : token.address)
}

export const getTokenFilterData = (data: GetTokenFilterDataFunctionArgs): TokenFilterData => {
    return {
        symbol: data.symbol.toLowerCase() as Lowercase<string>,
        name: data.name.toLowerCase() as Lowercase<string>,
        address: data.address.toLowerCase() as Lowercase<string>,
    }
}

export const getInitialTokenAmountDataMap = (tokens: Token[], initialData: TokenAmount = {}): TokenAmountDataMap => {
    return new Map(tokens.map((token) => [token.uid, initialData]))
}

export const getTokenDataMap = (tokens: Token[]): TokenDataMap => {
    return new Map(tokens.map((token) => [token.uid, token]))
}

export const getTokensFromDataMap = (dataMap: TokenDataMap) => {
    return Array.from(dataMap.values())
}

export const getNativeTokens = (tokens: Token[]) => tokens.filter((token) => isNativeToken(token))
export const getErc20Tokens = (tokens: Token[]) => tokens.filter((token) => !isNativeToken(token))

export const getUnsupportedTokenData: GetTokenFunction = (data) => {

    const address = getAddress(data.address)
    const uid = getTokenUid(data.chainId, address)
    const id = data.id || slugify(uid)
    const symbol = data.symbol || address.slice(-4)
    const name = data.name || toShort(address)
    const decimals = data.decimals || 18

    return {
        ...data,
        id: id,
        uid: uid,
        symbol: symbol,
        name: name,
        decimals: decimals,
        address: address,
        chainId: data.chainId,
        filters: getTokenFilterData({
            symbol: symbol,
            name: name,
            address: address,
        }),
        isCustomToken: true,
        isUnconfirmed: data.isUnconfirmed || !data.symbol || !data.name || !data.decimals,
    }
}
