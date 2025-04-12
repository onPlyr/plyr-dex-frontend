"use client"

import { createContext, useCallback, useMemo } from "react"
import { useAccount } from "wagmi"
import { getGasPrice, readContract } from "@wagmi/core"

import { wagmiConfig } from "@/app/config/wagmi"
import useApiTokenData from "@/app/hooks/apis/useApiTokenData"
import usePreferences from "@/app/hooks/preferences/usePreferences"
import { getApiUrl } from "@/app/lib/apis"
import { getDecodedCellTradeData, getEncodedCellTrade, getEncodedCellTradeData } from "@/app/lib/cells"
import { getHopQueryData, getHopTypeEstGasUnits, getMinAmount, setNextHopAmounts } from "@/app/lib/swaps"
import { getParsedError } from "@/app/lib/utils"
import { ApiFirmQuoteResultData, ApiProvider, ApiResult, ApiRoute, ApiRouteType, ApiTokenPairData, ApiTokenPairName } from "@/app/types/apis"
import { CellRouteData, CellRouteDataParameter, CellTradeData, CellTradeParameter } from "@/app/types/cells"
import { ChainId } from "@/app/types/chains"
import { PreferenceType } from "@/app/types/preferences"
import { SwapQuote } from "@/app/types/swaps"
import { GetSupportedTokenByIdFunction, TokenId } from "@/app/types/tokens"

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
export type GetFirmQuoteFunction = (swap: SwapQuote, getSupportedTokenById: GetSupportedTokenByIdFunction) => Promise<GetFirmQuoteReturnType | undefined>

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
    const apiTokenData = useApiTokenData()
    const { slippage, networkMode } = useMemo(() => ({
        slippage: BigInt(getPreference(PreferenceType.Slippage)),
        networkMode: getPreference(PreferenceType.NetworkMode),
    }), [getPreference])
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

    const getFirmQuote: GetFirmQuoteFunction = useCallback(async (swap, getSupportedTokenById) => {

        let error: string | undefined = undefined
        let gasPrice: bigint | undefined = undefined

        const hops = swap.hops.map((hop) => ({ ...hop }))

        try {

            if (!accountAddress || swap.isConfirmed) {
                return
            }

            for (const hop of hops) {

                const prevHop = hop.index > 0 ? hops.at(hop.index - 1) : undefined
                const nextHop = hops.at(hop.index + 1)

                if (hop.isConfirmed || (prevHop && !prevHop.isConfirmed)) {
                    continue
                }

                if (hop.srcData.cell.apiData) {

                    const url = getApiUrl({
                        provider: hop.srcData.cell.apiData.provider,
                        networkMode: networkMode,
                        route: ApiRoute.FirmQuote,
                        type: ApiRouteType.App,
                        params: {
                            chain: hop.srcData.chain.id.toString(),
                            account: accountAddress,
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
                        throw new Error("Invalid minimum amount")
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
                    })

                    if (!contractQuery) {
                        continue
                    }

                    const [estEncodedTrade, estGasUnits] = await readContract(wagmiConfig, contractQuery)
                    const estTradeData = getDecodedCellTradeData(hop.srcData.cell, estEncodedTrade)
                    const estTrade = estTradeData?.trade
                    const estAmount = estTrade?.[CellTradeParameter.AmountOut] ?? estTrade?.[CellTradeParameter.MinAmountOut]
                    const minAmount = getMinAmount(estAmount, slippage)

                    const tradeData: CellTradeData | undefined = estTradeData && estTrade && {
                        ...estTradeData,
                        trade: {
                            ...estTrade,
                            [CellTradeParameter.MinAmountOut in estTrade ? CellTradeParameter.MinAmountOut : CellTradeParameter.AmountOut]: minAmount,
                        },
                    }
                    const encodedTrade = tradeData && (hop.srcData.cell.tradeDataParams ? getEncodedCellTradeData(hop.srcData.cell, tradeData) : getEncodedCellTrade(hop.srcData.cell, tradeData.trade))

                    if (!encodedTrade || !tradeData || !estAmount || estAmount === BigInt(0)) {
                        hop.isError = true
                        throw new Error("Invalid route response")
                    }
                    else if (!minAmount || minAmount < hop.dstData.minAmount) {
                        hop.isError = true
                        throw new Error("Invalid minimum amount")
                    }

                    hop.dstData.estAmount = estAmount
                    hop.trade = tradeData.trade
                    hop.encodedTrade = encodedTrade
                    hop.estGasUnits = getHopTypeEstGasUnits(hop.type, estGasUnits)
                    hop.isConfirmed = true
                }

                if (nextHop) {
                    setNextHopAmounts(hop, nextHop, slippage)
                }
            }

            gasPrice = await getGasPrice(wagmiConfig, {
                chainId: swap.srcData.chain.id,
            })
        }

        catch (err) {
            error = getParsedError(err)
            console.warn(`getFirmQuote error: ${error}`)
        }

        finally {

            const [firstHop, finalHop] = [hops.at(0), hops.at(-1)]

            if (firstHop && gasPrice) {
                swap.estGasUnits = firstHop.estGasUnits
                swap.estGasFee = firstHop.estGasUnits * gasPrice
            }

            if (finalHop) {
                swap.estDstAmount = finalHop.dstData.estAmount
                swap.minDstAmount = finalHop.dstData.minAmount
                swap.dstData.estAmount = finalHop.dstData.estAmount
                swap.dstData.minAmount = finalHop.dstData.minAmount
            }

            if (!error && hops.every((hop) => hop.isConfirmed) && !hops.some((hop) => hop.isError)) {
                swap.isConfirmed = true
            }

            swap.hops = hops
        }

        return {
            swap: swap,
            error: error,
        }

    }, [accountAddress, networkMode, cellRouteData, getApiTokenPair, slippage])

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