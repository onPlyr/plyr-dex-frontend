"use client"

import { createContext, useCallback, useMemo } from "react"
import { erc20Abi, getAddress, zeroAddress } from "viem"
import { readContracts } from "@wagmi/core"

import { DefaultUserPreferences } from "@/app/config/preferences"
import { Tokens } from "@/app/config/tokens"
import { wagmiConfig } from "@/app/config/wagmi"
import usePreferences from "@/app/hooks/preferences/usePreferences"
import { PreferenceType } from "@/app/types/preferences"
import useBalances, { UseBalancesReturnType } from "@/app/hooks/tokens/useBalances"
import useTokenPrices, { UseTokenPricesReturnType } from "@/app/hooks/tokens/useTokenPrices"
import useLocalStorage from "@/app/hooks/utils/useLocalStorage"
import { getNetworkModeChainIds } from "@/app/lib/chains"
import { getTokenAddress, getTokenDataMap, getTokenFilterData, getTokensFromDataMap, getTokenUid, getUnsupportedTokenData } from "@/app/lib/tokens"
import { getParsedError, isEqualAddress } from "@/app/lib/utils"
import { ChainId } from "@/app/types/chains"
import { StorageKey } from "@/app/types/storage"
import { FavouriteTokenData, GetSupportedTokenByIdFunction, GetTokenByIdFunctionArgs, GetTokenFunction, GetTokenFunctionArgs, GetTokenFunctionAsync, isNativeToken, Token, TokenDataMap, TokenJson, TokenUid } from "@/app/types/tokens"

interface TokenDataContextType {
    tokens: Token[],
    tokenData: TokenDataMap,
    useBalancesData: UseBalancesReturnType,
    useTokenPricesData: UseTokenPricesReturnType,
    getToken: GetTokenFunction,
    getSupportedTokenById: GetSupportedTokenByIdFunction,
    getNativeToken: (chainId?: ChainId) => Token | undefined,
    setCustomToken: (token: Token) => void,
    removeCustomToken: (token: Token) => void,
    getContractTokenData: GetTokenFunctionAsync,
    favouriteTokenData: FavouriteTokenData,
    getIsFavouriteToken: (token: Token) => boolean,
    setIsFavouriteToken: (token: Token) => void,
    refetch: () => void,
}

export const TokenDataContext = createContext({} as TokenDataContextType)

const isSupportedToken = (customToken: Token) => Tokens.some((supportedToken) => customToken.uid === supportedToken.uid)
const customTokenSerializer = (data: TokenDataMap) => {
    return JSON.stringify(
        getTokensFromDataMap(data).filter((token) => !isSupportedToken(token)).map((token) => ({
            id: token.id,
            uid: token.uid,
            symbol: token.symbol,
            name: token.name,
            decimals: token.decimals,
            address: token.address,
            chainId: token.chainId,
            isCustomToken: true,
            isUnconfirmed: token.isUnconfirmed,
        } satisfies TokenJson))
    )
}
const customTokenDeserializer = (data: string) => {
    return getTokenDataMap((JSON.parse(data) as Token[]).filter((token) => !isSupportedToken(token)).map((token) => ({
        ...token,
        filters: getTokenFilterData(token),
    })))
}

const favouriteTokenSerializer = (data: FavouriteTokenData) => JSON.stringify(Array.from(data.values()))
const favouriteTokenDeserializer = (data: string) => new Set(JSON.parse(data) as TokenUid[])

const getDataUid = (data: GetTokenFunctionArgs) => data.uid ?? getTokenUid(data.chainId, getTokenAddress(data))
const isNativeData = (data: GetTokenFunctionArgs) => !data.isCustomToken && isEqualAddress(data.address, zeroAddress)

const TokenDataProvider = ({
    children,
}: {
    children: React.ReactNode,
}) => {

    const { preferences } = usePreferences()
    const networkMode = useMemo(() => preferences[PreferenceType.NetworkMode] ?? DefaultUserPreferences[PreferenceType.NetworkMode], [preferences])
    const chainIds = useMemo(() => getNetworkModeChainIds(networkMode), [networkMode])

    const [customTokenData, setCustomTokenData] = useLocalStorage({
        key: StorageKey.CustomTokens,
        initialValue: getTokenDataMap([]),
        options: {
            serializer: customTokenSerializer,
            deserializer: customTokenDeserializer,
        },
    })

    const setCustomToken = useCallback((token: Token) => setCustomTokenData((prev) => new Map(prev).set(token.uid, {
        ...token,
        isCustomToken: true,
    })), [setCustomTokenData])

    const removeCustomToken = useCallback((token: Token) => setCustomTokenData((prev) => {
        const data = new Map(prev)
        data.delete(token.uid)
        return data
    }), [setCustomTokenData])

    const tokens = useMemo(() => Tokens.concat(getTokensFromDataMap(customTokenData)).filter((token) => chainIds.includes(token.chainId)), [chainIds, customTokenData])
    const tokenData = useMemo(() => getTokenDataMap(tokens), [tokens])

    const getNativeToken = useCallback((chainId?: ChainId) => tokens.find((token) => isNativeToken(token) && token.chainId === chainId), [tokens])
    const getSupportedTokenById = useCallback((data: GetTokenByIdFunctionArgs) => tokens.find((token) => !token.isCustomToken && token.id === data.id && token.chainId === data.chainId), [tokens])
    const getToken = useCallback((data: GetTokenFunctionArgs) => tokenData.get(getDataUid(data)) || (isNativeData(data) && getNativeToken(data.chainId)) || getUnsupportedTokenData(data), [tokenData, getNativeToken])

    const useBalancesData = useBalances(tokens)
    const { refetch: refetchBalances } = useBalancesData

    const useTokenPricesData = useTokenPrices(tokens)
    const { refetch: refetchPrices } = useTokenPricesData

    const [favouriteTokenData, setFavouriteTokenData] = useLocalStorage({
        key: StorageKey.FavouriteTokens,
        initialValue: new Set() as FavouriteTokenData,
        options: {
            serializer: favouriteTokenSerializer,
            deserializer: favouriteTokenDeserializer,
        },
    })

    const getIsFavouriteToken = useCallback((token: Token) => favouriteTokenData.has(token.uid), [favouriteTokenData])
    const setIsFavouriteToken = useCallback((token: Token) => {
        setFavouriteTokenData((prev) => {
            const data = new Set(prev)
            if (data.has(token.uid)) {
                data.delete(token.uid)
            } else {
                data.add(token.uid)
            }
            return data
        })
    }, [setFavouriteTokenData])

    const getContractTokenData: GetTokenFunctionAsync = useCallback(async (data) => {

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
            console.log(`getContractTokenData error: ${getParsedError(err)}`)
        }

        return tokenData

    }, [])

    const refetch = useCallback(() => {
        refetchBalances()
        refetchPrices()
    }, [refetchBalances, refetchPrices])

    const context: TokenDataContextType = {
        tokens: tokens,
        tokenData: tokenData,
        useBalancesData: useBalancesData,
        useTokenPricesData: useTokenPricesData,
        getToken: getToken,
        getSupportedTokenById: getSupportedTokenById,
        getNativeToken: getNativeToken,
        setCustomToken: setCustomToken,
        removeCustomToken: removeCustomToken,
        getContractTokenData: getContractTokenData,
        favouriteTokenData: favouriteTokenData,
        getIsFavouriteToken: getIsFavouriteToken,
        setIsFavouriteToken: setIsFavouriteToken,
        refetch: refetch,
    }

    return (
        <TokenDataContext.Provider value={context} >
            {children}
        </TokenDataContext.Provider>
    )
}

export default TokenDataProvider
