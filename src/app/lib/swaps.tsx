import { QueryStatus } from "@tanstack/query-core"
import { Address, formatUnits, isAddressEqual } from "viem"
import { readContracts } from "@wagmi/core"
import { v4 as uuidv4 } from "uuid"

import { defaultSlippageBps, durationEstimateNumConfirmations, GasUnits, HopTypeGasUnits, SwapQuoteConfig } from "@/app/config/swaps"
import { wagmiConfig } from "@/app/config/wagmi"
import { getApiUrl } from "@/app/lib/apis"
import { getBridgePathHops } from "@/app/lib/bridges"
import { getBridgePathCells, getCellAbi, getChainCanSwap, getDecodedCellTradeData, getEncodedCellRouteData, getEncodedCellTrade, getSwapCells } from "@/app/lib/cells"
import { MathBigInt } from "@/app/lib/numbers"
import { getPlatform } from "@/app/lib/platforms"
import { toShort } from "@/app/lib/strings"
import { getToken, getTokenByAddress } from "@/app/lib/tokens"
import { getParsedError } from "@/app/lib/utils"
import { GetApiTokenPairFunction } from "@/app/providers/ApiDataProvider"
import { ApiResult, ApiRouteType, ApiSimpleQuoteResultData } from "@/app/types/apis"
import { BridgeProvider } from "@/app/types/bridges"
import { CellRouteData, CellRouteDataParameter, CellTradeParameter } from "@/app/types/cells"
import { Chain } from "@/app/types/chains"
import { Token } from "@/app/types/tokens"
import { GetSwapQuoteDataReturnType, GetValidHopQuoteDataReturnType, Hop, HopApiQuery, HopContractQuery, HopEvent, HopQueryData, HopQueryResult, HopQuote, HopType, InitiateSwapAction, isCrossChainHopType, isSwapHopType, isTransferEvent, isValidHopQuote, isValidQuoteData, isValidSwapRoute, Swap, SwapId, SwapQuote, SwapQuoteData, SwapRoute, SwapStatus, SwapType } from "@/app/types/swaps"

export const generateSwapId = (): SwapId => {
    return uuidv4()
}

export const getSwapQuoteTokenAddress = (chain: Chain, token: Token) => {
    const swapQuoteToken = chain.id === token.chainId ? token : getToken(token.id, chain)
    return swapQuoteToken?.isNative && swapQuoteToken.wrappedAddress ? swapQuoteToken.wrappedAddress : swapQuoteToken?.address
}

export const getMaxHops = (num?: number) => {
    return num && num <= SwapQuoteConfig.MaxHops ? num : SwapQuoteConfig.DefaultMaxHops
}

export const getHopTypeEstGasUnits = (type: HopType, estAmount?: bigint) => {
    return HopTypeGasUnits[type].estBase + (estAmount || HopTypeGasUnits[type].estDefault)
}

export const getMinAmount = (estAmount?: bigint, slippageBps?: bigint) => {
    return estAmount && estAmount > BigInt(0) && slippageBps ? (estAmount * (BigInt(10000) - slippageBps)) / BigInt(10000) : undefined
}

export const setNextHopAmounts = (hop: Hop, nextHop?: Hop, slippageBps?: bigint) => {

    if (!nextHop || !isValidHopQuote(hop)) {
        return
    }

    nextHop.srcData.estAmount = hop.dstData.estAmount
    nextHop.srcData.minAmount = isSwapHopType(hop.type) ? getMinAmount(hop.dstData.estAmount, slippageBps) : hop.dstData.estAmount
    if (!isSwapHopType(nextHop.type)) {
        nextHop.dstData.estAmount = nextHop.srcData.estAmount
        nextHop.dstData.minAmount = nextHop.srcData.estAmount
    }
}

export const getQuoteEstDuration = (hops: Hop[]) => {

    const finalHop = hops.at(-1)
    if (!finalHop || hops.every((hop) => !isCrossChainHopType(hop.type))) {
        return 0
    }

    return hops.reduce((sum, hop) => sum + (hop.srcData.chain.avgBlockTimeMs * durationEstimateNumConfirmations), 0) + (finalHop.dstData.chain.avgBlockTimeMs * durationEstimateNumConfirmations)
}

export const getQuoteEstGasUnits = (hops: HopQuote[]) => {
    return hops.reduce((sum, hop) => sum + hop.estGasUnits, BigInt(0))
}

export const getQuoteEstGasFee = (chain: Chain, hops: HopQuote[]) => {
    return getQuoteEstGasUnits(hops) * chain.minGasPrice
}

export const getSwapType = (hops: Hop[]) => {
    return hops.some((hop) => isSwapHopType(hop.type)) ? SwapType.Swap : SwapType.Transfer
}

export const getSwapAdapter = (chain: Chain, address?: Address) => {
    return address && chain.adapters?.find((adapter) => isAddressEqual(address, adapter.address))
}

export const getSwapHopStatus = (swap: Swap) => {
    return swap.hops.some((hop) => hop.status === SwapStatus.Error) ? SwapStatus.Error : swap.hops.every((hop) => hop.status === SwapStatus.Success) ? SwapStatus.Success : SwapStatus.Pending
}

export const getSwapStatus = (swap: Swap, hopStatus: SwapStatus) => {
    return hopStatus !== SwapStatus.Success ? hopStatus : swap.dstAmount && swap.dstAmount > BigInt(0) && swap.dstTxHash && swap.dstTimestamp ? SwapStatus.Success : SwapStatus.Pending
}

export const getSwapRouteEstGasFee = (route: SwapRoute) => {
    return isValidSwapRoute(route) ? BigInt(SwapQuoteConfig.MaxHops) * (GasUnits.Est + GasUnits.Buffer + (BigInt(2) * GasUnits.Buffer)) * route.srcData.chain.minGasPrice : undefined
}

export const getInitiateSwapError = ({
    action,
    isConnected,
    srcChain,
    srcToken,
    srcAmount,
    dstChain,
    dstToken,
    quoteData,
    selectedQuote,
    isInProgress,
    queryStatus,
    error,
    disabled,
}: {
    action: InitiateSwapAction,
    isConnected?: boolean,
    srcChain?: Chain,
    srcToken?: Token,
    srcAmount?: bigint,
    dstChain?: Chain,
    dstToken?: Token,
    quoteData?: SwapQuoteData,
    selectedQuote?: SwapQuote,
    isInProgress?: boolean,
    queryStatus?: QueryStatus,
    error?: string,
    disabled?: boolean,
}) => {

    let msg: string | undefined = undefined
    let isConnectError = false

    if (action === InitiateSwapAction.Review) {
        if (!srcChain || !srcToken || !dstChain || !dstToken) {
            msg = "Select Tokens"
        }
        else if (!srcAmount || srcAmount === BigInt(0)) {
            msg = "Enter Amount"
        }
        else if (queryStatus && queryStatus === "error") {
            msg = error || "Error Fetching Routes"
        }
        else if (!isInProgress && (!quoteData || quoteData.quotes.length === 0)) {
            msg = "No Routes Found"
        }
        else if (!isConnected) {
            msg = "Connect Wallet"
            isConnectError = true
        }
        else if (selectedQuote && (!srcToken.balance || srcToken.balance < srcAmount)) {
            msg = "Insufficient Balance"
        }
    }

    else if (action === InitiateSwapAction.Initiate) {
        if (!isConnected) {
            msg = "Connect Wallet"
            isConnectError = true
        }
        else if (!selectedQuote) {
            msg = "Select Route"
        }
        else if (selectedQuote.srcAmount === BigInt(0)) {
            msg = "Enter Amount"
        }
        else if (!srcToken?.balance || srcToken.balance < selectedQuote.srcAmount) {
            msg = "Insufficient Balance"
        }
    }

    if (!msg) {
        if (disabled) {
            msg = "Disabled"
        }
    }

    return {
        errorMsg: msg,
        isConnectError: isConnectError,
    }
}

export const getSwapQuoteData = async ({
    route,
    getApiTokenPair,
    maxNumHops,
    cellRouteData,
}: {
    route: SwapRoute,
    getApiTokenPair: GetApiTokenPairFunction,
    maxNumHops?: number,
    cellRouteData?: CellRouteData,
}): Promise<GetSwapQuoteDataReturnType> => {

    const swapQuoteData: GetSwapQuoteDataReturnType = {}
    const swapQuotes: SwapQuote[] = []
    const timestamp = new Date().getTime()
    const maxHops = getMaxHops(maxNumHops)
    const slippageBps = cellRouteData?.[CellRouteDataParameter.SlippageBips] ?? BigInt(defaultSlippageBps)

    if (!isValidSwapRoute(route)) {
        return swapQuoteData
    }

    try {

        const initialHopData = getInitialHopQuoteData({
            route: route,
            maxHops: maxHops,
            slippageBps: slippageBps,
        })
        const { data: validHopData, error: quoteError } = await getValidHopQuoteData({
            hopData: initialHopData,
            getApiTokenPair: getApiTokenPair,
            maxHops: maxHops,
            slippageBps: slippageBps,
            cellRouteData: cellRouteData,
        })

        if (quoteError || !validHopData) {
            throw new Error(quoteError || "getValidHopQuoteData returned no data")
        }

        for (const [id, hops] of Object.entries(validHopData)) {

            const [firstHop, finalHop] = [hops.at(0), hops.at(-1)]
            if (!firstHop || !finalHop) {
                continue
            }

            const events = getHopEventData({
                hops: hops,
                slippageBps: slippageBps,
            })

            const quote: SwapQuote = {
                id: id,
                srcData: {
                    ...firstHop.srcData,
                },
                dstData: {
                    ...finalHop.dstData,
                },
                hops: hops,
                events: events,
                srcAmount: route.srcData.amount,
                estDstAmount: finalHop.dstData.estAmount,
                minDstAmount: finalHop.dstData.minAmount,
                estDuration: getQuoteEstDuration(hops),
                estGasUnits: getQuoteEstGasUnits(hops),
                estGasFee: getQuoteEstGasFee(route.srcData.chain, hops),
                type: getSwapType(hops),
                isConfirmed: hops.every((hop) => hop.isConfirmed),
                timestamp: timestamp,
            }
            swapQuotes.push(quote)
        }
    }

    catch (err) {
        swapQuoteData.error = getParsedError(err)
    }

    finally {

        if (swapQuotes.length > 0) {
            swapQuotes.sort((a, b) => parseFloat(formatUnits(b.estDstAmount - a.estDstAmount, route.dstData.token.decimals)))
            swapQuoteData.data = {
                srcData: {
                    chain: route.srcData.chain,
                    token: route.srcData.token,
                },
                dstData: {
                    chain: route.dstData.chain,
                    token: route.dstData.token,
                },
                timestamp: timestamp,
                maxDstAmount: MathBigInt.max(swapQuotes.map((quote) => quote.estDstAmount)),
                minDuration: Math.min(...swapQuotes.map((quote) => quote.estDuration)),
                quotes: swapQuotes,
            }
        }

        return swapQuoteData
    }

    // console.log(`>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> getSwapQuoteData START <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<`)
    // console.log(`>>> ${formatUnits(route.srcData.amount, route.srcData.token.decimals)} ${route.srcData.token.symbol} (${route.srcData.chain.name}) -> ${route.dstData.token.symbol} (${route.dstData.chain.name})`)
    // swapQuotes.forEach((swap) => {
    //     console.log(`>>> getSwapQuoteData quote: ${swap.srcData.minAmount ? formatUnits(swap.srcData.minAmount, swap.srcData.token.decimals) : "n/a"} ${swap.srcData.token.symbol} (${swap.srcData.chain.name}) -> ${formatUnits(swap.minDstAmount, swap.dstData.token.decimals)} ${swap.dstData.token.symbol} (${swap.dstData.chain.name ?? "n/a"})`)
    //     console.log(`>>> HOPS <<<`)
    //     swap.hops.forEach((hop, i) => {
    //         console.log(`   >>> getSwapQuoteData hop ${i}: ${hop.srcData.minAmount ? formatUnits(hop.srcData.minAmount, hop.srcData.token.decimals) : "n/a"} ${hop.srcData.token.symbol} (${hop.srcData.chain.name}) -> ${formatUnits(hop.dstData.minAmount, hop.dstData.token.decimals)} ${hop.dstData.token.symbol} (${hop.dstData?.chain.name ?? "n/a"}) / type: ${hop.type}`)
    //     })
    //     console.log(`>>> EVENTS <<<`)
    //     swap.events.forEach((event, i) => {
    //         console.log(`   >>> getSwapQuoteData event ${i}: ${event.srcData.minAmount ? formatUnits(event.srcData.minAmount, event.srcData.token.decimals) : "n/a"} ${event.srcData.token.symbol} (${event.srcData.chain.name}) -> ${event.dstData.minAmount ? formatUnits(event.dstData.minAmount, event.dstData.token.decimals) : "n/a"} ${event.dstData?.token.symbol ?? "n/a"} (${event.dstData?.chain.name ?? "n/a"}) / hop: ${event.hopIndex} / adapter: ${serialize(event.adapter)} / bridge: ${serialize(event.bridge)} / ${event.type}`)
    //     })
    // })
    // console.log(`>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> getSwapQuoteData END <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<`)
}

export const getInitialHopQuoteData = ({
    route,
    maxHops,
    slippageBps,
}: {
    route: SwapRoute,
    maxHops: number,
    slippageBps?: bigint,
}) => {

    const hopData: Record<SwapId, HopQuote[]> = {}
    if (!isValidSwapRoute(route)) {
        return hopData
    }

    const { srcData, dstData } = route

    if (srcData.chain.id === dstData.chain.id && getChainCanSwap(srcData.chain)) {
        for (const cell of getSwapCells(srcData.chain)) {
            hopData[generateSwapId()] = [
                {
                    srcData: {
                        chain: srcData.chain,
                        token: srcData.token,
                        cell: cell,
                        estAmount: srcData.amount,
                        minAmount: srcData.amount,
                    },
                    dstData: {
                        chain: dstData.chain,
                        token: dstData.token,
                        cell: cell,
                    },
                    type: HopType.SwapAndTransfer,
                    index: 0,
                    estGasUnits: getHopTypeEstGasUnits(HopType.SwapAndTransfer),
                },
            ]
        }
    }

    const bridgePathHops = getBridgePathHops({
        route: route,
        maxHops: maxHops,
        slippageBps: slippageBps,
    })

    if (!bridgePathHops || bridgePathHops.length === 0) {
        return hopData
    }

    for (const pathHops of bridgePathHops) {

        const pathSrcCells = pathHops.map((hop) => getBridgePathCells(hop.srcData.chain, isSwapHopType(hop.type)))
        const maxHopCells = Math.max(...pathSrcCells.map((cells) => cells.length))
        const pathSwapIds = Array.from(Array(maxHopCells), () => generateSwapId())

        for (let quoteNum = 0; quoteNum < pathSwapIds.length; quoteNum++) {

            const swapId = pathSwapIds[quoteNum]
            hopData[swapId] = []

            for (const hop of pathHops) {

                const nextHop = pathHops.find((data) => data.index === hop.index + 1)
                const hopSrcCells = pathSrcCells[hop.index]
                const hopDstCells = nextHop && isSwapHopType(nextHop.type) ? getSwapCells(hop.dstData.chain) : [hop.dstData.chain.cells[0]]

                hopData[swapId].push({
                    ...hop,
                    srcData: {
                        ...hop.srcData,
                        cell: hopSrcCells.at(quoteNum) ?? hopSrcCells[0],
                    },
                    dstData: {
                        ...hop.dstData,
                        cell: hopDstCells.at(quoteNum) ?? hopDstCells[0],
                    },
                } as HopQuote)
            }
        }
    }

    // console.log(`>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> getInitialHopQuoteData START <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<`)
    // Object.entries(hopData).forEach(([id, hops]) => {
    //     console.log(`>>> path: ${id}`)
    //     hops.forEach((data, i) => {
    //         console.log(`   >>> hop ${i}: ${data.srcData.minAmount ? formatUnits(data.srcData.minAmount, data.srcData.token.decimals) : "n/a"} ${data.srcData.token.symbol} (${data.srcData.chain.name}) -> ${data.dstData.minAmount ? formatUnits(data.dstData.minAmount, data.dstData.token.decimals) : "n/a"} ${data.dstData.token.symbol} (${data.dstData.chain.name}) / type: ${data.type} / srcCell: ${data.srcData.cell?.type ?? "NO SRC CELL"} / dstCell: ${data.dstData.cell?.type ?? "NO CELL???????"}`)
    //     })
    // })
    // console.log(`>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> getInitialHopQuoteData END <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<`)

    return hopData
}

export const getValidHopQuoteData = async ({
    hopData,
    getApiTokenPair,
    maxHops,
    slippageBps,
    cellRouteData,
}: {
    hopData: Record<SwapId, HopQuote[]>,
    getApiTokenPair: GetApiTokenPairFunction,
    maxHops: number,
    slippageBps?: bigint,
    cellRouteData?: CellRouteData,
}): Promise<GetValidHopQuoteDataReturnType> => {

    const quoteIds = Object.keys(hopData)
    const hopQuoteData: GetValidHopQuoteDataReturnType = {}

    if (quoteIds.length === 0) {
        return hopQuoteData
    }

    try {

        for (let i = 0; i < maxHops; i++) {

            const apiQueries: HopApiQuery[] = []
            const contractQueries: HopContractQuery[] = []

            for (const id of quoteIds) {

                const hops = hopData[id]
                if (i > hops.length - 1) {
                    continue
                }

                const hop = hops.find((data) => data.index === i)
                const prevHop = i > 0 ? hops.find((data) => data.index === i - 1) : undefined

                if (!hop || hop.isError) {
                    continue
                }
                else if (prevHop && (prevHop.isError || !isValidHopQuote(prevHop))) {
                    hop.isError = true
                    continue
                }
                else if (isValidHopQuote(hop)) {
                    continue
                }
                else if (!isSwapHopType(hop.type) && !isValidQuoteData(hop.srcData)) {
                    hop.isError = true
                    continue
                }
                else if (!hop.srcData.cell || !hop.dstData.cell) {
                    hop.isError = true
                    continue
                }

                const { apiQuery, contractQuery } = getHopQueryData({
                    hop: hop,
                    getApiTokenPair: getApiTokenPair,
                    cellRouteData: cellRouteData,
                })

                if (hop.srcData.cell.apiData && apiQuery) {
                    hop.queryIndex = apiQueries.push(apiQuery) - 1
                }
                else if (contractQuery) {
                    hop.queryIndex = contractQueries.push(contractQuery) - 1
                }
                else {
                    hop.isError = true
                    continue
                }
            }

            const { apiData, contractData, error: hopQueryResultsError } = await getHopQueryResults({
                apiQueries: apiQueries,
                contractQueries: contractQueries,
            })

            if (hopQueryResultsError) {
                throw new Error(hopQueryResultsError)
            }

            for (const id of quoteIds) {

                const hops = hopData[id]
                if (i > hops.length - 1) {
                    continue
                }

                const hop = hops.find((data) => data.index === i)
                const prevHop = i > 0 ? hops.find((data) => data.index === i - 1) : undefined
                const nextHop = i + 1 <= hops.length - 1 ? hops[i + 1] : undefined

                if (!hop || hop.isError) {
                    continue
                }
                else if (prevHop && (prevHop.isError || !isValidHopQuote(prevHop))) {
                    hop.isError = true
                    continue
                }
                else if (isValidHopQuote(hop)) {
                    setNextHopAmounts(hop, nextHop, slippageBps)
                    continue
                }
                else if (hop.queryIndex === undefined) {
                    hop.isError = true
                    continue
                }

                const { srcData, dstData } = hop
                if (!isValidQuoteData(srcData)) {
                    hop.isError = true
                    continue
                }

                if (srcData.cell.apiData) {

                    const dstSwapTokenAddress = getSwapQuoteTokenAddress(srcData.chain, dstData.token)
                    const { amount: dstAmount } = apiData[hop.queryIndex]
                    if (!dstSwapTokenAddress || !dstAmount || dstAmount === BigInt(0)) {
                        hop.isError = true
                        continue
                    }

                    hop.dstData.estAmount = dstAmount
                    hop.dstData.minAmount = getMinAmount(hop.dstData.estAmount, slippageBps)
                    hop.trade = {
                        [CellTradeParameter.AmountOut]: hop.dstData.estAmount,
                        [CellTradeParameter.MinAmountOut]: hop.dstData.minAmount,
                        [CellTradeParameter.Path]: [
                            srcData.token.address,
                            dstSwapTokenAddress,
                        ],
                        [CellTradeParameter.Adapters]: [
                            srcData.cell.address,
                        ],
                    }
                    hop.encodedTrade = getEncodedCellTrade(srcData.cell, hop.trade, [
                        CellTradeParameter.AmountOut,
                        CellTradeParameter.MinAmountOut,
                        CellTradeParameter.Path,
                        CellTradeParameter.Adapters,
                    ])
                }

                else {

                    const { encodedTrade, estGasUnits } = contractData[hop.queryIndex]
                    const trade = getDecodedCellTradeData(srcData.cell, encodedTrade)?.trade
                    const dstAmount = trade?.[CellTradeParameter.AmountOut] ?? trade?.[CellTradeParameter.MinAmountOut]
                    if (!encodedTrade || !trade || !dstAmount || dstAmount === BigInt(0)) {
                        hop.isError = true
                        continue
                    }

                    hop.dstData.estAmount = dstAmount
                    hop.dstData.minAmount = getMinAmount(hop.dstData.estAmount, slippageBps)
                    hop.trade = trade
                    hop.encodedTrade = encodedTrade
                    hop.estGasUnits = getHopTypeEstGasUnits(hop.type, estGasUnits)
                }

                if (!isValidHopQuote(hop)) {
                    hop.isError = true
                    continue
                }

                if (nextHop) {
                    setNextHopAmounts(hop, nextHop, slippageBps)
                }
            }
        }
    }

    catch (err) {
        hopQuoteData.error = getParsedError(err)
    }

    finally {
        hopQuoteData.data = {}
        for (const [swapId, hops] of Object.entries(hopData)) {
            if (hops.length > 0 && hops.every((hop) => isValidHopQuote(hop))) {
                hopQuoteData.data[swapId] = hops.map((hop, i) => {
                    const prevHop = i > 0 ? hops.at(i - 1) : undefined
                    return {
                        ...hop,
                        isConfirmed: !hop.srcData.cell.apiData || (prevHop && !prevHop.isConfirmed),
                    }
                })
            }
        }
    }

    return hopQuoteData
}

export const getHopQueryData = ({
    hop,
    getApiTokenPair,
    cellRouteData,
}: {
    hop: Hop,
    getApiTokenPair: GetApiTokenPairFunction,
    cellRouteData?: CellRouteData,
}) => {

    const queryData: HopQueryData = {}
    const { srcData, dstData } = hop
    if (!isValidQuoteData(srcData)) {
        return queryData
    }

    if (srcData.cell.apiData) {

        const { pair, isBase } = getApiTokenPair({
            provider: srcData.cell.apiData.provider,
            chainId: srcData.chain.id,
            srcTokenId: srcData.token.id,
            dstTokenId: dstData.token.id,
        })
        if (!pair) {
            return queryData
        }

        const apiQueryUrl = getApiUrl({
            provider: srcData.cell.apiData.provider,
            route: srcData.cell.apiData.getQuote,
            type: ApiRouteType.App,
            params: {
                chain: srcData.chain.id.toString(),
                srcToken: srcData.token.id,
                srcAmount: srcData.estAmount.toString(),
                dstToken: dstData.token.id,
                pair: pair,
                isBase: isBase ? "true" : "false",
            },
        })

        if (!apiQueryUrl) {
            return queryData
        }

        queryData.apiQuery = apiQueryUrl
    }

    else {

        const abi = getCellAbi(srcData.cell)
        const srcTokenAddress = getSwapQuoteTokenAddress(srcData.chain, srcData.token)
        const dstTokenAddress = getSwapQuoteTokenAddress(srcData.chain, dstData.token)
        const routeData = getEncodedCellRouteData(srcData.chain, srcData.cell, cellRouteData, false)

        if (!abi || !srcTokenAddress || !dstTokenAddress || !routeData) {
            return queryData
        }

        queryData.contractQuery = {
            chainId: srcData.chain.id,
            address: srcData.cell.address,
            abi: abi,
            functionName: "route",
            args: [srcData.estAmount, srcTokenAddress, dstTokenAddress, routeData],
        }
    }

    return queryData
}

export const getHopQueryResults = async ({
    apiQueries,
    contractQueries,
}: {
    apiQueries: HopApiQuery[],
    contractQueries: HopContractQuery[],
}) => {

    let apiData: HopQueryResult[] = []
    let contractData: HopQueryResult[] = []
    let error: string | undefined = undefined

    try {

        apiData = await Promise.all(apiQueries.map((query) => fetch(query).then((response) => response.json() as Promise<ApiResult>).then((result) => ({
            amount: result.data ? BigInt((result.data as ApiSimpleQuoteResultData).amount) : undefined,
        }))))

        contractData = await readContracts(wagmiConfig, {
            contracts: contractQueries,
        }).then((responses) => responses.map((response) => ({
            encodedTrade: response.result?.[0],
            estGasUnits: response.result?.[1]
        } as HopQueryResult)))
    }

    catch (err) {
        error = `getHopQueryResults error: ${err}`
    }

    return {
        apiData: apiData,
        contractData: contractData,
        error: error,
    }
}

export const getHopEventData = ({
    hops,
    slippageBps,
}: {
    hops: Hop[],
    slippageBps?: bigint,
}) => {

    const events: HopEvent[] = []

    for (let hopIndex = 0; hopIndex < hops.length; hopIndex++) {

        const hop = hops[hopIndex]
        const {
            [CellTradeParameter.Adapters]: adapterAddresses,
            [CellTradeParameter.Path]: tradePath,
            [CellTradeParameter.AmountOut]: amountOut,
            [CellTradeParameter.MinAmountOut]: minAmountOut,
            [CellTradeParameter.TokenOut]: tokenOut,
        } = hop.trade ?? {}

        const tradeDstAmount = amountOut || minAmountOut || hop.dstData.estAmount
        const tradeDstToken = tokenOut && getTokenByAddress(tokenOut, hop.srcData.chain)

        let prevDstToken: Token | undefined = hop.srcData.token
        let prevDstAmount = hop.srcData.estAmount
        let isPrevSwap = hopIndex === 0 ? false : isSwapHopType(hops[hopIndex - 1].type)

        if (isSwapHopType(hop.type) && hop.srcData.cell) {

            if (tradePath && tradePath.length > 0) {

                for (let i = 0; i < tradePath.length - 1; i++) {

                    const adapterAddress = adapterAddresses?.[i] || hop.srcData.cell.address
                    const adapter = getSwapAdapter(hop.srcData.chain, adapterAddress)
                    const eventSrcToken = getTokenByAddress(tradePath[i], hop.srcData.chain)
                    const eventDstToken = getTokenByAddress(tradePath[i + 1], hop.srcData.chain)
                    const eventDstAmount = i === tradePath.length - 2 ? tradeDstAmount : undefined

                    if (eventSrcToken && eventDstToken) {
                        events.push({
                            srcData: {
                                chain: hop.srcData.chain,
                                token: eventSrcToken,
                                estAmount: prevDstAmount,
                                minAmount: isPrevSwap ? getMinAmount(prevDstAmount, slippageBps) : prevDstAmount,
                            },
                            dstData: {
                                chain: hop.srcData.chain,
                                token: eventDstToken,
                                estAmount: eventDstAmount,
                                minAmount: getMinAmount(eventDstAmount, slippageBps),
                            },
                            type: SwapType.Swap,
                            index: i,
                            hopIndex: hop.index,
                            adapter: adapter,
                            adapterAddress: adapterAddress,
                        })
                        prevDstAmount = eventDstAmount
                    }
                    prevDstToken = eventDstToken
                }
            }

            else if (tradeDstToken) {
                events.push({
                    srcData: {
                        chain: hop.srcData.chain,
                        token: hop.srcData.token,
                        estAmount: prevDstAmount,
                        minAmount: isPrevSwap ? getMinAmount(prevDstAmount, slippageBps) : prevDstAmount,
                    },
                    dstData: {
                        chain: hop.srcData.chain,
                        token: tradeDstToken,
                        estAmount: tradeDstAmount,
                        minAmount: getMinAmount(tradeDstAmount, slippageBps),
                    },
                    type: SwapType.Swap,
                    index: 0,
                    hopIndex: hop.index,
                    adapter: getSwapAdapter(hop.srcData.chain, hop.srcData.cell.address),
                    adapterAddress: hop.srcData.cell.address,
                })
                prevDstToken = tradeDstToken
                prevDstAmount = tradeDstAmount
            }

            isPrevSwap = true
        }

        if (isCrossChainHopType(hop.type) && prevDstToken) {
            events.push({
                srcData: {
                    chain: hop.srcData.chain,
                    token: prevDstToken,
                    estAmount: prevDstAmount,
                    minAmount: isPrevSwap ? getMinAmount(prevDstAmount, slippageBps) : prevDstAmount,
                },
                dstData: {
                    chain: hop.dstData.chain,
                    token: hop.dstData.token,
                    estAmount: hop.dstData.estAmount,
                    minAmount: hop.dstData.minAmount,
                },
                type: SwapType.Transfer,
                index: events.length,
                hopIndex: hop.index,
                bridge: BridgeProvider.ICTT,
            })
        }
    }

    return events
}

export const getHopEventPlatformData = (event: HopEvent) => {

    const platform = getPlatform(event.adapter?.platform)
    const platformName = isTransferEvent(event) ? event.bridge : event.adapter ? event.adapter.name : event.adapterAddress && toShort(event.adapterAddress)

    return {
        platform: platform,
        platformName: platformName,
    }
}
