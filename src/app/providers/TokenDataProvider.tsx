"use client"

import { createContext, useCallback, useEffect, useState } from "react"
import { Address, erc20Abi, getAddress, isAddressEqual } from "viem"
import { readContracts } from "@wagmi/core"

import { Tokens } from "@/app/config/tokens"
import { wagmiConfig } from "@/app/config/wagmi"
import useBalances, { UseBalancesReturnType } from "@/app/hooks/tokens/useBalances"
import useLocalStorage from "@/app/hooks/utils/useLocalStorage"
import { getChain } from "@/app/lib/chains"
import { slugify, toShort } from "@/app/lib/strings"
import { getParsedError } from "@/app/lib/utils"
import { ChainId } from "@/app/types/chains"
import { StorageKey } from "@/app/types/storage"
import { GetNativeTokenFunction, GetSupportedTokenFunction, GetTokenFunction, GetTokenFunctionAsync, Token, TokenId, TokenJson } from "@/app/types/tokens"

export interface UnconfirmedTokenData {
    [tokenId: TokenId]: {
        address: Address,
        chainId: ChainId,
    },
}

interface TokenDataContextType {
    tokens: Token[],
    useBalancesData: UseBalancesReturnType,
    getToken: GetTokenFunction,
    getSupportedToken: GetSupportedTokenFunction,
    getNativeToken: GetNativeTokenFunction,
    setCustomToken: (token: Token) => void,
    getCustomTokenData: GetTokenFunctionAsync,
    addUnconfirmedToken: (token: Token) => void,
    refetch: () => void,
}

export const TokenDataContext = createContext({} as TokenDataContextType)

const customTokenSerializer = (value: Token[]) => JSON.stringify(value.map((token) => ({
    id: token.id,
    symbol: token.symbol,
    name: token.name,
    decimals: token.decimals,
    address: token.address,
    chainId: token.chainId,
    filters: token.filters,
    isCustomToken: true,
    isUnconfirmed: token.isUnconfirmed,
} satisfies TokenJson)))

const customTokenDeserializer = (value: string): Token[] => JSON.parse(value) as Token[]

const getUnsupportedTokenData: GetTokenFunction = (data) => {

    const chain = getChain(data.chainId)!
    const id = data.id || slugify(`${chain.id}-${data.address}`)
    const symbol = data.symbol || data.address.slice(-4)
    const name = data.name || toShort(data.address)
    const decimals = data.decimals || 18

    return {
        ...data,
        id: id,
        symbol: symbol,
        name: name,
        decimals: decimals,
        address: getAddress(data.address),
        chainId: chain.id,
        filters: {
            symbol: symbol.toLowerCase() as Lowercase<string>,
            name: name.toLowerCase() as Lowercase<string>,
            address: data.address.toLowerCase() as Lowercase<string>,
            chain: chain.name.toLowerCase() as Lowercase<string>,
            chainId: chain.id.toString() as Lowercase<string>,
        },
        isCustomToken: true,
        isUnconfirmed: data.isUnconfirmed || !data.symbol || !data.name || !data.decimals,
    }
}

const TokenDataProvider = ({
    children,
}: {
    children: React.ReactNode,
}) => {

    const supportedTokens = Tokens
    const [customTokens, setCustomTokenData] = useLocalStorage({
        key: StorageKey.CustomTokens,
        initialValue: [] as Token[],
        options: {
            serializer: customTokenSerializer,
            deserializer: customTokenDeserializer,
        },
    })

    const useBalancesData = useBalances({
        supportedTokens: supportedTokens,
        customTokens: customTokens,
    })
    const { tokens, refetch } = useBalancesData

    const [unconfirmedTokenData, setUnconfirmedTokenData] = useState<UnconfirmedTokenData>({})
    const [isConfirmInProgress, setIsConfirmInProgress] = useState(false)

    const addUnconfirmedToken = useCallback((token: Token) => {
        setUnconfirmedTokenData((prev) => ({
            ...prev,
            [token.id]: {
                address: token.address,
                chainId: token.chainId,
            }
        }))
    }, [])

    useEffect(() => {
        tokens.filter((token) => token.isUnconfirmed).forEach((token) => addUnconfirmedToken(token))
    }, [tokens])

    const getToken: GetTokenFunction = useCallback((data) => {
        const token = tokens.find((t) => t.chainId === data.chainId && ((data.id && t.id === data.id) || isAddressEqual(t.address, data.address) || (t.isNative && t.wrappedAddress && isAddressEqual(t.wrappedAddress, data.address))))
        return token ?? getUnsupportedTokenData(data)
    }, [tokens])

    const getSupportedToken: GetSupportedTokenFunction = useCallback((data) => {
        return tokens.find((token) => token.chainId === data.chainId && token.id === data.id && !token.isCustomToken)
    }, [tokens])

    const getNativeToken: GetNativeTokenFunction = useCallback((chainId) => {
        return tokens.find((token) => token.isNative && token.chainId === chainId)
    }, [tokens])

    const setCustomToken = useCallback((token: Token) => {
        setCustomTokenData((prev) => ([
            ...prev.filter((data) => !(data.chainId === token.chainId && data.id === token.id)),
            {
                ...token,
                isCustomToken: true,
            },
        ]))
    }, [setCustomTokenData])

    const getCustomTokenData: GetTokenFunctionAsync = useCallback(async (data) => {

        if (!data.isUnconfirmed) {
            return
        }

        let tokenData: Token | undefined = undefined

        try {

            const address = getAddress(data.address)
            const [symbolData, nameData, decimalsData] = await readContracts(wagmiConfig, {
                contracts: [
                    {
                        chainId: data.chainId,
                        address: address,
                        abi: erc20Abi,
                        functionName: "symbol",
                    },
                    {
                        chainId: data.chainId,
                        address: address,
                        abi: erc20Abi,
                        functionName: "name",
                    },
                    {
                        chainId: data.chainId,
                        address: address,
                        abi: erc20Abi,
                        functionName: "decimals",
                    },
                ],
            })

            if (symbolData.error || nameData.error || decimalsData.error) {
                // throw new Error(getParsedReadContractError(symbolData, nameData, decimalsData))
                return
            }

            tokenData = getUnsupportedTokenData({
                ...data,
                symbol: symbolData.result,
                name: nameData.result,
                decimals: decimalsData.result,
                isUnconfirmed: false,
            })
        }

        catch (err) {
            console.log(`getCustomTokenData error: ${getParsedError(err)}`)
        }

        return tokenData

    }, [])

    const confirmTokenData = useCallback(async () => {

        if (isConfirmInProgress) {
            return
        }

        try {

            setIsConfirmInProgress(true)

            const unconfirmedTokens = Object.entries(unconfirmedTokenData).map(([tokenId, data]) => getToken({
                id: tokenId as TokenId,
                address: data.address,
                chainId: data.chainId,
            }))

            for (const token of unconfirmedTokens) {
                const tokenData = await getCustomTokenData(token)
                if (tokenData) {
                    setCustomToken(tokenData)
                }
            }
        }

        catch (err) {
            console.log(`confirmTokenData error: ${getParsedError(err)}`)
        }

        finally {
            setIsConfirmInProgress(false)
        }

    }, [getToken, setCustomToken, unconfirmedTokenData, isConfirmInProgress, setIsConfirmInProgress, getCustomTokenData])

    useEffect(() => {
        if (!isConfirmInProgress) {
            confirmTokenData()
        }
    }, [unconfirmedTokenData])

    const context: TokenDataContextType = {
        tokens: tokens,
        useBalancesData: useBalancesData,
        getToken: getToken,
        getSupportedToken: getSupportedToken,
        getNativeToken: getNativeToken,
        setCustomToken: setCustomToken,
        getCustomTokenData: getCustomTokenData,
        addUnconfirmedToken: addUnconfirmedToken,
        refetch: refetch,
    }

    return (
        <TokenDataContext.Provider value={context} >
            {children}
        </TokenDataContext.Provider>
    )
}

export default TokenDataProvider