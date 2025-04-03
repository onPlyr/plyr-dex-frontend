"use client"

import { createContext, useCallback, useMemo } from "react"
import { useAccount } from "wagmi"
import { readContract } from "@wagmi/core"

import { wagmiConfig } from "@/app/config/wagmi"
import useApiTokenData from "@/app/hooks/apis/useApiTokenData"
import usePreferences from "@/app/hooks/preferences/usePreferences"
import useTokens from "@/app/hooks/tokens/useTokens"
import { getApiUrl } from "@/app/lib/apis"
import { getDecodedCellTradeData } from "@/app/lib/cells"
import { getHopQueryData, getHopTypeEstGasUnits, getMinAmount, getQuoteEstGasFee, getQuoteEstGasUnits, setNextHopAmounts } from "@/app/lib/swaps"
import { getParsedError } from "@/app/lib/utils"
import { ApiFirmQuoteResultData, ApiProvider, ApiResult, ApiRoute, ApiRouteType, ApiTokenPairData, ApiTokenPairName } from "@/app/types/apis"
import { CellRouteData, CellRouteDataParameter, CellTradeParameter } from "@/app/types/cells"
import { ChainId } from "@/app/types/chains"
import { PreferenceType } from "@/app/types/preferences"
import { SwapQuote } from "@/app/types/swaps"
import { TokenId } from "@/app/types/tokens"

export type GetApiTokenDataFunction = (provider: ApiProvider, chainId: ChainId) => ApiTokenPairData | undefined
export type GetApiTokenPairFunction = ({
    provider,
    chainId,
    srcTokenId,
    dstTokenId,
}: {
    provider: ApiProvider,
    chainId: ChainId,
    srcTokenId: TokenId,
    dstTokenId: TokenId,
}) => {
    pair?: ApiTokenPairName,
    isBase?: boolean,
}

export interface GetFirmQuoteReturnType {
    swap: SwapQuote,
    error?: string,
}
export type GetFirmQuoteFunction = (swap: SwapQuote) => Promise<GetFirmQuoteReturnType | undefined>

interface ApiDataContextType {
    getApiTokenData: GetApiTokenDataFunction,
    getApiTokenPair: GetApiTokenPairFunction,
    getFirmQuote: GetFirmQuoteFunction,
}

export const ApiDataContext = createContext({} as ApiDataContextType)

const ApiDataProvider = ({
    children,
}: {
    children: React.ReactNode,
}) => {

    const { address: accountAddress } = useAccount()
    const { getPreference } = usePreferences()
    const { getSupportedTokenById } = useTokens()
    const apiTokenData = useApiTokenData()
    const slippage = useMemo(() => BigInt(getPreference(PreferenceType.Slippage)), [getPreference])
    const networkMode = useMemo(() => getPreference(PreferenceType.NetworkMode), [getPreference])
    const cellRouteData: CellRouteData = useMemo(() => ({ [CellRouteDataParameter.SlippageBips]: slippage }), [slippage])

    const getApiTokenData: GetApiTokenDataFunction = useCallback((provider, chainId) => apiTokenData.data[provider]?.[chainId], [apiTokenData.data])
    const getApiTokenPair: GetApiTokenPairFunction = useCallback(({
        provider,
        chainId,
        srcTokenId,
        dstTokenId,
    }) => {

        const providerTokenData = getApiTokenData(provider, chainId)
        const asBasePair = providerTokenData?.[srcTokenId]?.asBaseToken[dstTokenId]
        const asQuotePair = providerTokenData?.[srcTokenId]?.asQuoteToken[dstTokenId]

        return {
            pair: asBasePair || asQuotePair,
            isBase: !!asBasePair,
        }

    }, [getApiTokenData])

    const getFirmQuote: GetFirmQuoteFunction = useCallback(async (swap) => {

        let error: string | undefined = undefined

        try {

            if (!accountAddress || swap.isConfirmed) {
                return
            }

            for (let i = 0; i < swap.hops.length; i++) {

                const hop = swap.hops[i]
                const prevHop = i > 0 ? swap.hops.at(i - 1) : undefined
                const nextHop = swap.hops.at(i + 1)

                if (hop.isConfirmed || (prevHop && !prevHop.isConfirmed)) {
                    continue
                }

                if (hop.srcData.cell.apiData) {

                    const url = getApiUrl({
                        provider: hop.srcData.cell.apiData.provider,
                        route: ApiRoute.FirmQuote,
                        type: ApiRouteType.App,
                        params: {
                            chain: hop.srcData.chain.id.toString(),
                            srcToken: hop.srcData.token.id,
                            dstToken: hop.dstData.token.id,
                            srcAmount: hop.srcData.estAmount.toString(),
                            cell: hop.srcData.cell.address,
                            slippage: slippage.toString(),
                        },
                    })

                    const response = url && await fetch(url).then((response) => response.json() as Promise<ApiResult>)
                    if (!response) {
                        throw new Error(`No response from endpoint: ${url?.pathname}`)
                    }

                    const { data, error } = response
                    if (error || !data) {
                        throw new Error(error || `No data returned by endpoint: ${url.pathname}`)
                    }

                    const result = data as ApiFirmQuoteResultData
                    const minAmount = BigInt(result.amount)
                    if (!minAmount || minAmount < hop.dstData.minAmount) {
                        hop.isError = true
                        throw new Error("Invalid Minimum Amount")
                    }

                    hop.encodedTrade = result.encodedTrade
                    hop.isConfirmed = true
                }

                else {

                    const { contractQuery } = getHopQueryData({
                        hop: hop,
                        getApiTokenPair: getApiTokenPair,
                        cellRouteData: cellRouteData,
                        getSupportedTokenById: getSupportedTokenById,
                        //networkMode: networkMode,
                    })

                    if (!contractQuery) {
                        continue
                    }

                    const [encodedTrade, estGasUnits] = await readContract(wagmiConfig, contractQuery)
                    const trade = getDecodedCellTradeData(hop.srcData.cell, encodedTrade)?.trade
                    const estAmount = trade?.[CellTradeParameter.AmountOut] ?? trade?.[CellTradeParameter.MinAmountOut]
                    const minAmount = getMinAmount(estAmount, slippage)

                    if (!encodedTrade || !trade || !estAmount || estAmount === BigInt(0)) {
                        hop.isError = true
                        throw new Error("Invalid Route Response")
                    }

                    else if (!minAmount || minAmount < hop.dstData.minAmount) {
                        hop.isError = true
                        throw new Error("Invalid Minimum Amount")
                    }

                    hop.dstData.estAmount = estAmount
                    hop.trade = trade
                    hop.encodedTrade = encodedTrade
                    hop.estGasUnits = getHopTypeEstGasUnits(hop.type, estGasUnits)
                    hop.isConfirmed = true
                }

                if (nextHop) {
                    setNextHopAmounts(hop, nextHop, slippage)
                }
            }
        }

        catch (err) {
            error = getParsedError(err)
        }

        finally {

            swap.estGasUnits = getQuoteEstGasUnits(swap.hops)
            swap.estGasFee = getQuoteEstGasFee(swap.srcData.chain, swap.hops)

            const finalHop = swap.hops.at(-1)
            if (finalHop) {
                swap.estDstAmount = finalHop.dstData.estAmount
                swap.minDstAmount = finalHop.dstData.minAmount
                swap.dstData.estAmount = finalHop.dstData.estAmount
                swap.dstData.minAmount = finalHop.dstData.minAmount
            }

            if (!error && swap.hops.every((hop) => hop.isConfirmed) && !swap.hops.some((hop) => hop.isError)) {
                swap.isConfirmed = true
            }

            return {
                swap: swap,
                error: error,
            }
        }

    }, [accountAddress, getSupportedTokenById, cellRouteData, getApiTokenPair, slippage, networkMode])

    const context: ApiDataContextType = {
        getApiTokenData: getApiTokenData,
        getApiTokenPair: getApiTokenPair,
        getFirmQuote: getFirmQuote,
    }

    return (
        <ApiDataContext.Provider value={context} >
            {children}
        </ApiDataContext.Provider>
    )
}

export default ApiDataProvider
