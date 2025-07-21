import { zeroAddress } from "viem"
import { readContracts } from "@wagmi/core"

import { uniV2CellAbi } from "@/app/abis/cells/uniV2"
import { uniV2FactoryAbi } from "@/app/abis/uniV2/uniV2Factory"
import { wagmiConfig } from "@/app/config/wagmi"
import { getChain } from "@/app/lib/chains"
import { getCellTokenPairId, getDedupedTokenPairs, getTokenPairAddresses } from "@/app/lib/tokens"
import { getParsedError, isEqualAddress } from "@/app/lib/utils"
import { GetApiTokenPairFunction } from "@/app/providers/ApiDataProvider"
import { ApiProvider } from "@/app/types/apis"
import { CellType } from "@/app/types/cells"
import { CellTokenPairs, Token } from "@/app/types/tokens"
import { UniV2CellPairData, UniV2FactoryQuery, UniV2GetPairQuery } from "@/app/types/uniV2"

export const getUniV2CellPairData = (chainIds: number[], tokens: Token[]) => {

    const cellPairData: UniV2CellPairData[] = []

    chainIds.forEach((chainId) => {

        const chain = getChain(chainId)
        const cells = chain?.cells.filter((cell) => cell.type === CellType.UniV2)
        const cellTokens = chain && tokens.filter((token) => token.chainId === chain.id)
        const pairs = getDedupedTokenPairs(cellTokens) // tokens a and b are interchangeable so we can reduce queries by deduping the pairs - https://docs.uniswap.org/contracts/v2/reference/smart-contracts/factory#getpair

        if (!chain || !cells?.length || !cellTokens?.length || !pairs?.length) {
            return
        }

        cells.forEach((cell) => cellPairData.push({
            chainId: chain.id,
            cell: cell.address,
            pairs: pairs,
        }))
    })

    return cellPairData
}

export const getUniV2Pairs = async ({
    chainIds,
    tokens,
}: {
    chainIds: number[],
    tokens: Token[],
}) => {

    const data: CellTokenPairs = new Map()

    try {

        const cellPairData = getUniV2CellPairData(chainIds, tokens)

        if (!chainIds.length || !tokens.length || !cellPairData.length) {
            return
        }

        const getPairQueries: UniV2GetPairQuery[] = []
        const factoryQueries: UniV2FactoryQuery[] = cellPairData.map((cellData) => ({
            chainId: cellData.chainId,
            address: cellData.cell,
            abi: uniV2CellAbi,
            functionName: "factory",
        }))

        const factoryResults = await readContracts(wagmiConfig, {
            contracts: factoryQueries,
        })

        factoryResults.forEach((factoryData, i) => {

            const address = factoryData.result
            const { chainId, cell, pairs } = cellPairData[i]

            if (!address) {
                return
            }

            pairs.forEach((pair) => getPairQueries.push({
                chainId: chainId,
                address: address,
                abi: uniV2FactoryAbi,
                functionName: "getPair",
                args: getTokenPairAddresses(pair),
                cell: cell,
                pair: pair,
            }))
        })

        const getPairResults = await readContracts(wagmiConfig, {
            contracts: getPairQueries,
        })

        getPairResults.forEach((getPairData, i) => {

            const isValidPair = Boolean(getPairData.result && !isEqualAddress(getPairData.result, zeroAddress))
            const { chainId, cell, pair } = getPairQueries[i]

            data.set(getCellTokenPairId(chainId, cell, pair[0], pair[1]), isValidPair).set(getCellTokenPairId(chainId, cell, pair[1], pair[0]), isValidPair)
        })

        return data
    }

    catch (err) {
        throw new Error(getParsedError(err))
    }
}

export const getDexalotPairs = async ({
    chainIds,
    tokens,
    getApiTokenPair,
}: {
    chainIds: number[],
    tokens: Token[],
    getApiTokenPair: GetApiTokenPairFunction,
}) => {

    const data: CellTokenPairs = new Map()

    try {

        if (!chainIds.length || !tokens.length) {
            return
        }

        chainIds.forEach((chainId) => {

            const chain = getChain(chainId)
            const cells = chain?.cells.filter((cell) => cell.type === CellType.Dexalot)
            const cellTokens = chain && tokens.filter((token) => token.chainId === chain.id && token.apiData?.[ApiProvider.Dexalot])
            const pairs = getDedupedTokenPairs(cellTokens) // getApiTokenPair checks as both base and quote tokens so we can reduce queries by deduping the pairs

            if (!chain || !cells?.length || !cellTokens?.length || !pairs?.length) {
                return
            }

            pairs.forEach((pair) => {

                const { pair: apiPair } = getApiTokenPair({
                    provider: ApiProvider.Dexalot,
                    chainId: chain.id,
                    srcTokenId: pair[0].id,
                    dstTokenId: pair[1].id,
                })

                cells.forEach((cell) => data.set(getCellTokenPairId(chain.id, cell.address, pair[0], pair[1]), Boolean(apiPair)).set(getCellTokenPairId(chain.id, cell.address, pair[1], pair[0]), Boolean(apiPair)))
            })
        })

        return data
    }

    catch (err) {
        throw new Error(getParsedError(err))
    }
}