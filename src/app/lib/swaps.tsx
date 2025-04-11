import { QueryStatus } from "@tanstack/query-core"
import { Address, Block, erc20Abi, formatUnits } from "viem"
import { getGasPrice, readContracts } from "@wagmi/core"
import { v4 as uuidv4 } from "uuid"

import { durationEstimateNumConfirmations, GasUnits, HopTypeGasUnits, SwapQuoteConfig } from "@/app/config/swaps"
import { wagmiConfig } from "@/app/config/wagmi"
import { getApiUrl } from "@/app/lib/apis"
import { getBridgePathHops } from "@/app/lib/bridges"
import { getBridgePathCells, getCellAbi, getChainCanSwap, getDecodedCellTradeData, getEncodedCellRouteData, getEncodedCellTrade, getQuoteCellInstructions, getSwapCells } from "@/app/lib/cells"
import { MathBigInt } from "@/app/lib/numbers"
import { getPlatform } from "@/app/lib/platforms"
import { toShort } from "@/app/lib/strings"
import { getTokenAddress, getTokenDataMap, getUnsupportedTokenData } from "@/app/lib/tokens"
import { getParsedError, isEqualAddress } from "@/app/lib/utils"
import { GetApiTokenPairFunction } from "@/app/providers/ApiDataProvider"
import { ApiResult, ApiRouteType, ApiSimpleQuoteResultData } from "@/app/types/apis"
import { BridgeProvider } from "@/app/types/bridges"
import { CellFeeType, CellRouteData, CellRouteDataParameter, CellTradeParameter } from "@/app/types/cells"
import { Chain } from "@/app/types/chains"
import { NetworkMode, SlippageConfig } from "@/app/types/preferences"
import {
    GetSwapQuoteDataReturnType, GetValidHopQuoteDataReturnData, GetValidHopQuoteDataReturnType, Hop, HopApiQuery, HopContractQuery, HopEvent, HopQueryData, HopQueryResult, HopQuote, HopType, InitiateSwapAction,
    isCrossChainHopType, isSwapHopType, isTransferEvent, isValidHopQuote, isValidInitiateSwapQuote, isValidQuoteData, isValidSwapFeeData, isValidSwapRoute, Swap, SwapFeeData, SwapFeeQuery, SwapFeeTokenData, SwapId, SwapQuote,
    SwapQuoteData, SwapRoute, SwapStatus, SwapType,
} from "@/app/types/swaps"
import { GetNativeTokenFunction, GetSupportedTokenByIdFunction, GetTokenFunction, isNativeToken, isValidTokenAmount, Token, TokenAmount, TokenDataMap } from "@/app/types/tokens"

export const generateSwapId = (): SwapId => {
    return uuidv4()
}

export const getInitiatedBlockNumber = (latestBlock?: Block) => {
    return latestBlock?.number ? MathBigInt.max([latestBlock.number - SwapQuoteConfig.InitiatedBlockBuffer, BigInt(1)]) : undefined
}

export const getSwapQuoteTokenAddresses = (hop: Hop, getSupportedTokenById: GetSupportedTokenByIdFunction) => {

    const srcToken = hop.srcData.token
    const dstToken = hop.dstData.chain.id === hop.srcData.chain.id ? hop.dstData.token : getSupportedTokenById({
        id: hop.dstData.token.id,
        chainId: hop.srcData.chain.id,
    })

    return {
        srcTokenAddress: getTokenAddress(srcToken),
        dstTokenAddress: dstToken && getTokenAddress(dstToken),
    }
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

export const getSwapType = (hops: Hop[]) => {
    return hops.some((hop) => isSwapHopType(hop.type)) ? SwapType.Swap : SwapType.Transfer
}

export const getSwapAdapter = (chain: Chain, address?: Address) => {
    return address && chain.adapters?.find((adapter) => isEqualAddress(address, adapter.address))
}

export const getSwapHopStatus = (swap: Swap) => {
    return swap.hops.some((hop) => hop.status === SwapStatus.Error) ? SwapStatus.Error : swap.hops.every((hop) => hop.status === SwapStatus.Success) ? SwapStatus.Success : SwapStatus.Pending
}

export const getSwapStatus = (swap: Swap, hopStatus: SwapStatus) => {
    return hopStatus !== SwapStatus.Success ? hopStatus : swap.dstAmount && swap.dstAmount > BigInt(0) && swap.dstTxHash && swap.dstTimestamp ? SwapStatus.Success : SwapStatus.Pending
}

export const getSwapRouteEstGasFee = (route: SwapRoute) => {
    return isValidSwapRoute(route) ? (GasUnits.Est + GasUnits.Buffer + (BigInt(2) * GasUnits.Buffer)) * route.srcData.chain.minGasPrice : undefined
}

export const getSwapChainIds = (swap: Swap, status?: SwapStatus) => {

    const hops = status ? swap.hops.filter((hop) => hop.status === status) : swap.hops
    const hopChainIds = hops.map((hop) => [hop.srcData.chain.id, hop.dstData.chain.id]).flat()
    const swapChainIds = !status || swap.status === status ? [swap.dstData.chain.id] : []

    return Array.from(new Set([
        ...hopChainIds,
        ...swapChainIds,
    ]))
}

export const getSwapSrcAmount = (hop?: Hop, feeData?: SwapFeeData) => {
    if (!hop || !isValidQuoteData(hop.srcData) || hop.index !== 0 || !feeData || !isValidSwapFeeData(feeData)) {
        return
    }
    return hop.srcData.estAmount > feeData[CellFeeType.Base] ? hop.srcData.estAmount - feeData[CellFeeType.Base] : undefined
}

export const getInitiateSwapValue = (swap?: SwapQuote) => {
    if (!swap || !isValidInitiateSwapQuote(swap)) {
        return
    }
    return isNativeToken(swap.srcData.token) ? swap.srcAmount + swap.feeData[CellFeeType.FixedNative] : swap.feeData[CellFeeType.FixedNative]
}

export const getSwapNativeTokenAmount = (swap?: Swap) => {
    if (!swap || !isValidSwapFeeData(swap.feeData)) {
        return
    }
    else if (!isNativeToken(swap.srcData.token)) {
        return swap.feeData[CellFeeType.FixedNative]
    }
    return swap.feeData[CellFeeType.FixedNative] + swap.srcAmount
}

export const getSwapFeeTokenData = (swap: Swap, getNativeToken: GetNativeTokenFunction): SwapFeeTokenData[] | undefined => {

     
    const displayFees = isValidSwapFeeData(swap.feeData) && Object.entries(swap.feeData).filter(([_, amount]) => amount > BigInt(0))
    if (!displayFees || !displayFees.length) {
        return
    }

    const nativeToken = getNativeToken(swap.srcData.chain.id)
    const nativeTokenData = {
        symbol: nativeToken?.symbol || swap.srcData.chain.nativeCurrency.symbol,
        decimals: nativeToken?.decimals || swap.srcData.chain.nativeCurrency.decimals,
    }

    return displayFees.map(([type, amount]) => ({
        type: type as CellFeeType,
        symbol: type === CellFeeType.FixedNative ? nativeTokenData.symbol : swap.srcData.token.symbol,
        decimals: type === CellFeeType.FixedNative ? nativeTokenData.decimals : swap.srcData.token.decimals,
        amount: amount,
    }))
}

export const getInitiateSwapError = ({
    action,
    isConnected,
    srcChain,
    srcToken,
    srcAmount,
    srcBalance,
    nativeBalance,
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
    srcBalance?: TokenAmount,
    nativeBalance?: TokenAmount,
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

    const nativeAmount = getSwapNativeTokenAmount(selectedQuote)

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
        else if (selectedQuote && nativeAmount === undefined) {
            msg = "Invalid Fees"
        }
        else if (selectedQuote && (!isValidTokenAmount(srcBalance) || srcBalance.amount < srcAmount || !isValidTokenAmount(nativeBalance) || (nativeAmount !== undefined && nativeBalance.amount < nativeAmount))) {
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
        else if (nativeAmount === undefined) {
            msg = "Invalid Fees"
        }
        else if (!isInProgress && (!isValidTokenAmount(srcBalance) || srcBalance.amount < selectedQuote.srcAmount || !isValidTokenAmount(nativeBalance) || nativeBalance.amount < nativeAmount)) {
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
    getToken,
    getSupportedTokenById,
}: {
    route: SwapRoute,
    getApiTokenPair: GetApiTokenPairFunction,
    maxNumHops?: number,
    cellRouteData?: CellRouteData,
    getToken: GetTokenFunction,
    getSupportedTokenById: GetSupportedTokenByIdFunction,
}): Promise<GetSwapQuoteDataReturnType> => {

    const swapQuoteData: GetSwapQuoteDataReturnType = {}
    const swapQuotes: SwapQuote[] = []
    const timestamp = new Date().getTime()
    const maxHops = getMaxHops(maxNumHops)
    const slippageBps = cellRouteData?.[CellRouteDataParameter.SlippageBips] ?? BigInt(SlippageConfig.DefaultBps)
    const quoteTokens = getTokenDataMap([])

    if (!isValidSwapRoute(route)) {
        return swapQuoteData
    }

    try {

        const initialHopData = getInitialHopQuoteData({
            route: route,
            maxHops: maxHops,
            slippageBps: slippageBps,
            getSupportedTokenById: getSupportedTokenById,
        })

        const feeData = await getQuoteFeeData({
            route: route,
            hopData: initialHopData,
        })

        const { data: validHopData, error: quoteError } = await getValidHopQuoteData({
            hopData: initialHopData,
            feeData: feeData,
            getApiTokenPair: getApiTokenPair,
            maxHops: maxHops,
            slippageBps: slippageBps,
            cellRouteData: cellRouteData,
            getSupportedTokenById: getSupportedTokenById,
        })

        if (quoteError) {
            throw new Error(quoteError)
        }
        else if (!validHopData) {
            return swapQuoteData
        }

        const { quoteTokenData } = await getUnconfirmedQuoteTokens({
            quoteData: validHopData,
            getToken: getToken,
        })

        if (quoteTokenData.size) {
            quoteTokenData.forEach((token) => quoteTokens.set(token.uid, token))
        }

        const gasPrice = await getGasPrice(wagmiConfig, {
            chainId: route.srcData.chain.id,
        })

        for (const [id, hops] of Object.entries(validHopData)) {

            const [firstHop, finalHop] = [hops.at(0), hops.at(-1)]
            const swapFeeData = feeData.get(id)

            if (!firstHop || !finalHop || !swapFeeData) {
                continue
            }

            const events = getHopEventData({
                hops: hops,
                slippageBps: slippageBps,
                getToken: getToken,
                quoteTokens: quoteTokens,
            })

            swapQuotes.push({
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
                feeData: swapFeeData,
                estDuration: getQuoteEstDuration(hops),
                estGasUnits: firstHop.estGasUnits,
                estGasFee: firstHop.estGasUnits * gasPrice,
                type: getSwapType(hops),
                isConfirmed: hops.every((hop) => hop.isConfirmed),
                timestamp: timestamp,
            })
        }
    }

    catch (err) {
        swapQuoteData.error = getParsedError(err)
        console.warn(`getSwapQuoteData error: ${swapQuoteData.error}`)
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
                quoteTokens: quoteTokens,
            }
        }
    }

    return swapQuoteData
}

export const getInitialHopQuoteData = ({
    route,
    maxHops,
    slippageBps,
    getSupportedTokenById,
}: {
    route: SwapRoute,
    maxHops: number,
    slippageBps?: bigint,
    getSupportedTokenById: GetSupportedTokenByIdFunction,
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
        getSupportedTokenById: getSupportedTokenById,
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

    return hopData
}

export const getQuoteFeeData = async ({
    route,
    hopData,
}: {
    route: SwapRoute,
    hopData: Record<SwapId, HopQuote[]>,
}) => {

    const quoteIds = Object.keys(hopData)
    const quoteFeeData: Map<SwapId, SwapFeeData> = new Map(quoteIds.map((swapId) => [swapId, {
        [CellFeeType.FixedNative]: undefined,
        [CellFeeType.Base]: undefined,
    }]))

    if (!isValidSwapRoute(route) || !quoteFeeData.size) {
        return quoteFeeData
    }

    try {

        const queryData: Map<SwapId, SwapFeeQuery> = new Map([])

        Object.entries(hopData).forEach(([swapId, hops]) => {

            const cell = hops.find((hop) => hop.index === 0)?.srcData.cell
            const abi = getCellAbi(cell)
            const instructions = cell && abi && getQuoteCellInstructions(route, cell, hops)

            if (cell && abi && instructions) {
                queryData.set(swapId, {
                    chainId: route.srcData.chain.id,
                    address: cell.address,
                    abi: abi,
                    functionName: "calculateFees",
                    args: [instructions, route.srcData.amount],
                })
            }
        })

        const results = await readContracts(wagmiConfig, {
            contracts: Array.from(queryData.values()),
        })

        Array.from(queryData.keys()).forEach((swapId, i) => quoteFeeData.set(swapId, {
            [CellFeeType.FixedNative]: results.at(i)?.result?.[0],
            [CellFeeType.Base]: results.at(i)?.result?.[1],
        }))
    }

    catch (err) {
        console.warn(`getValidHopQuoteData error: ${getParsedError(err)}`)
    }

    return quoteFeeData
}

export const getValidHopQuoteData = async ({
    hopData,
    feeData,
    getApiTokenPair,
    maxHops,
    slippageBps,
    cellRouteData,
    getSupportedTokenById,
}: {
    hopData: Record<SwapId, HopQuote[]>,
    feeData: Map<SwapId, SwapFeeData>,
    getApiTokenPair: GetApiTokenPairFunction,
    maxHops: number,
    slippageBps?: bigint,
    cellRouteData?: CellRouteData,
    getSupportedTokenById: GetSupportedTokenByIdFunction,
}): Promise<GetValidHopQuoteDataReturnType> => {

    const quoteIds = Object.keys(hopData)
    const hopQuoteData: GetValidHopQuoteDataReturnType = {}

    if (!quoteIds.length) {
        return hopQuoteData
    }

    try {

        Object.entries(hopData).forEach(([swapId, hops]) => {

            const firstHop = hops.find((hop) => hop.index === 0)
            const hopFeeData = feeData.get(swapId)
            const srcAmount = getSwapSrcAmount(firstHop, hopFeeData)

            if (!firstHop || !hopFeeData || !srcAmount) {
                if (firstHop) {
                    firstHop.isError = true
                }
                return
            }

            firstHop.srcData.estAmount = srcAmount
            firstHop.srcData.minAmount = srcAmount

            if (!isSwapHopType(firstHop.type)) {
                firstHop.dstData.estAmount = srcAmount
                firstHop.dstData.minAmount = srcAmount
            }

            hops.filter((hop) => hop.index !== 0).forEach((hop) => {

                const prevHop = hops.find((data) => data.index === hop.index - 1)
                const isPrevSwap = prevHop && isSwapHopType(prevHop.type)

                if (!prevHop) {
                    hop.isError = true
                    return
                }

                hop.srcData.estAmount = !isPrevSwap ? prevHop.dstData.estAmount : undefined
                hop.srcData.minAmount = !isPrevSwap ? hop.srcData.estAmount : getMinAmount(hop.srcData.estAmount, slippageBps)
            })
        })

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
                    getSupportedTokenById: getSupportedTokenById,
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

                const { srcData } = hop
                if (!isValidQuoteData(srcData)) {
                    hop.isError = true
                    continue
                }

                if (srcData.cell.apiData) {

                    const { dstTokenAddress: dstSwapTokenAddress } = getSwapQuoteTokenAddresses(hop, getSupportedTokenById)
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
                            getTokenAddress(srcData.token),
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
        console.warn(`getValidHopQuoteData error: ${hopQuoteData.error}`)
    }

    finally {
        hopQuoteData.data = {}
        for (const [swapId, hops] of Object.entries(hopData)) {
            if (hops.length && hops.every((hop) => isValidHopQuote(hop))) {
                hopQuoteData.data[swapId] = hops.map((hop) => {
                    const prevHop = hop.index > 0 ? hops.at(hop.index - 1) : undefined
                    return {
                        ...hop,
                        isConfirmed: !(isSwapHopType(hop.type) && hop.srcData.cell.apiData) && !(prevHop && isSwapHopType(prevHop.type) && prevHop.srcData.cell.apiData),
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
    getSupportedTokenById,
}: {
    hop: Hop,
    getApiTokenPair: GetApiTokenPairFunction,
    cellRouteData?: CellRouteData,
    getSupportedTokenById: GetSupportedTokenByIdFunction,
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
            networkMode: srcData.chain.testnet ? NetworkMode.Testnet : NetworkMode.Mainnet,
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
        const { srcTokenAddress, dstTokenAddress } = getSwapQuoteTokenAddresses(hop, getSupportedTokenById)
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
        console.warn(`getHopQueryResults error: ${error}`)
    }

    return {
        apiData: apiData,
        contractData: contractData,
        error: error,
    }
}

export const getUnconfirmedQuoteTokens = async ({
    quoteData,
    getToken,
}: {
    quoteData: GetValidHopQuoteDataReturnData,
    getToken: GetTokenFunction,
}) => {

    let error: string | undefined = undefined
    const unconfirmedTokenData = getTokenDataMap([])
    const quoteTokenData = getTokenDataMap([])

    try {

        Object.values(quoteData).flat().forEach((hop) => {

            const tokenAddresses = new Set([...hop.trade?.[CellTradeParameter.Path] ?? []])
            if (hop.trade?.[CellTradeParameter.TokenOut]) {
                tokenAddresses.add(hop.trade[CellTradeParameter.TokenOut])
            }

            tokenAddresses.forEach((address) => {
                const token = getToken({
                    address: address,
                    chainId: hop.srcData.chain.id,
                })
                if (token.isUnconfirmed && !unconfirmedTokenData.has(token.uid)) {
                    unconfirmedTokenData.set(token.uid, token)
                }
            })
        })

        if (unconfirmedTokenData.size) {

            const baseSymbolQuery = {
                abi: erc20Abi,
                functionName: "symbol",
            } as const

            const baseNameQuery = {
                abi: erc20Abi,
                functionName: "name",
            } as const

            const baseDecimalsQuery = {
                abi: erc20Abi,
                functionName: "decimals",
            } as const

            const results = await readContracts(wagmiConfig, {
                contracts: Array.from(unconfirmedTokenData.values()).map((token) => ([
                    {
                        ...baseSymbolQuery,
                        chainId: token.chainId,
                        address: token.address,
                    },
                    {
                        ...baseNameQuery,
                        chainId: token.chainId,
                        address: token.address,
                    },
                    {
                        ...baseDecimalsQuery,
                        chainId: token.chainId,
                        address: token.address,
                    },
                ])).flat(),
            })

            Array.from(unconfirmedTokenData.values()).forEach((token, i) => {

                const resultsIndex = i * 3
                const [symbolData, nameData, decimalsData] = results.slice(resultsIndex, resultsIndex + 3)

                if (symbolData.result && nameData.result && decimalsData.result) {
                    quoteTokenData.set(token.uid, getUnsupportedTokenData({
                        ...token,
                        symbol: symbolData.result as string,
                        name: nameData.result as string,
                        decimals: decimalsData.result as number,
                        isUnconfirmed: false,
                    }))
                }
            })
        }
    }

    catch (err) {
        error = getParsedError(err)
        console.warn(`getUnconfirmedQuoteTokens error: ${error}`)
    }

    return {
        quoteTokenData,
        error,
    }
}

export const getHopEventData = ({
    hops,
    slippageBps,
    getToken,
    quoteTokens,
}: {
    hops: Hop[],
    slippageBps?: bigint,
    getToken: GetTokenFunction,
    quoteTokens: TokenDataMap,
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
        const tradeDstTokenData = tokenOut && getToken({
            address: tokenOut,
            chainId: hop.srcData.chain.id,
        })
        const tradeDstToken = (tradeDstTokenData?.isUnconfirmed && quoteTokens.get(tradeDstTokenData.uid)) || tradeDstTokenData
        const prevHop = hops.at(hop.index - 1)

        let prevDstToken: Token | undefined = hop.srcData.token
        let prevDstAmount = hop.srcData.estAmount
        let isPrevSwap = !!prevHop && isSwapHopType(prevHop.type)

        if (isSwapHopType(hop.type) && hop.srcData.cell) {

            if (tradePath && tradePath.length > 0) {

                for (let i = 0; i < tradePath.length - 1; i++) {

                    const adapterAddress = adapterAddresses?.[i] || hop.srcData.cell.address
                    const adapter = getSwapAdapter(hop.srcData.chain, adapterAddress)
                    const eventSrcTokenData = getToken({
                        address: tradePath[i],
                        chainId: hop.srcData.chain.id,
                    })
                    const eventSrcToken = (eventSrcTokenData.isUnconfirmed && quoteTokens.get(eventSrcTokenData.uid)) || eventSrcTokenData
                    const eventDstTokenData = getToken({
                        address: tradePath[i + 1],
                        chainId: hop.srcData.chain.id,
                    })
                    const eventDstToken = (eventDstTokenData.isUnconfirmed && quoteTokens.get(eventDstTokenData.uid)) || eventDstTokenData
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