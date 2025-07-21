import { Address, getAddress } from "viem"

import { slugify, toShort } from "@/app/lib/strings"
import { Cell, CellType } from "@/app/types/cells"
import { ChainId } from "@/app/types/chains"
import {
    CellTokenPairId, CellTokenPairs, GetTokenAddressFunctionArgs, GetTokenFilterDataFunctionArgs, GetTokenFunction, isBridgeToken, isDefaultSwapRouteToken, isNativeToken, isSwapPathToken,
    Token, TokenAmount, TokenAmountDataMap, TokenDataMap, TokenFilterData, TokenPair, TokenUid
} from "@/app/types/tokens"

export const getTokenUid = (chainId: ChainId, address: Address): TokenUid => `${chainId}:${getAddress(address)}`
export const getTokenAddress = (token: GetTokenAddressFunctionArgs) => getAddress(isNativeToken(token) ? token.wrappedAddress : token.address)
export const getTokenPairAddresses = (pair: TokenPair): [Address, Address] => [getTokenAddress(pair[0]), getTokenAddress(pair[1])]

export const getTokenFilterData = (data: GetTokenFilterDataFunctionArgs): TokenFilterData => ({
    symbol: data.symbol.toLowerCase() as Lowercase<string>,
    name: data.name.toLowerCase() as Lowercase<string>,
    address: data.address.toLowerCase() as Lowercase<string>,
})

export const getInitialTokenAmountDataMap = (tokens: Token[], initialData: TokenAmount = {}): TokenAmountDataMap => new Map(tokens.map((token) => [token.uid, initialData]))
export const getTokenDataMap = (tokens: Token[]): TokenDataMap => new Map(tokens.map((token) => [token.uid, token]))
export const getTokensFromDataMap = (dataMap: TokenDataMap) => Array.from(dataMap.values())

export const getNativeTokens = (tokens: Token[]) => tokens.filter((token) => isNativeToken(token))
export const getErc20Tokens = (tokens: Token[]) => tokens.filter((token) => !isNativeToken(token))
export const getBridgeTokens = (tokens: Token[]) => tokens.filter((token) => isBridgeToken(token))
export const getSwapPathTokens = (tokens: Token[]) => tokens.filter((token) => isSwapPathToken(token))
export const getDefaultSwapRouteTokens = (tokens: Token[]) => tokens.filter((token) => isDefaultSwapRouteToken(token))

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

export const getCellTokenPairId = (chainId: ChainId, cell: Address, from: Token, to: Token): CellTokenPairId => `${chainId}:${cell}:${from.id}/${to.id}`
export const isValidCellTokenPair = (pairs: CellTokenPairs, cell: Cell, from: Token, to: Token) => (cell.type !== CellType.UniV2 && cell.type !== CellType.Dexalot) || Boolean(pairs.get(getCellTokenPairId(from.chainId, cell.address, from, to)))

export const getDedupedTokenPairs = (tokens?: Token[]) => {

    if (!tokens?.length) {
        return
    }

    const fromTokens: Set<TokenUid> = new Set()
    const pairs: [Token, Token][] = []

    tokens.forEach((from) => {

        if (fromTokens.has(from.uid)) {
            return
        }

        tokens.filter((to) => to.uid !== from.uid && !fromTokens.has(to.uid)).forEach((to) => pairs.push([from, to]))
        fromTokens.add(from.uid)
    })

    return pairs
}