import { Address, Hash, zeroAddress } from "viem"
import { getBlock } from "@wagmi/core"

import { SupportedChains } from "@/app/config/chains"
import { wagmiConfig } from "@/app/config/wagmi"
import { MathBigInt } from "@/app/lib/numbers"
import { Chain, isSupportedChainId } from "@/app/types/chains"
import { NetworkMode } from "@/app/types/preferences"
import { Token } from "@/app/types/tokens"

export const getChain = (chainId: number) => {
    return isSupportedChainId(chainId) && !SupportedChains[chainId].isDisabled ? SupportedChains[chainId] : undefined
}

export const getChainByBlockchainId = (blockchainId?: Hash) => {
    return blockchainId ? Object.values(SupportedChains).find((chain) => chain.blockchainId.toLowerCase() === blockchainId.toLowerCase() && !chain.isDisabled) : undefined
}

export const getDefaultBlockExplorerUrl = (chain?: Chain) => {
    return chain?.blockExplorers?.default.url
}

export const getBlockExplorerLink = ({
    chain,
    tx,
    address,
    token,
}: {
    chain?: Chain,
    tx?: Hash,
    address?: Address,
    token?: Token,
}) => {

    let url = undefined

    if (chain && (tx || address || token) && (token === undefined || (token && token.address !== zeroAddress))) {

        const baseUrl = getDefaultBlockExplorerUrl(chain)
        const type = tx ? "tx" : address ? "address" : token ? "token" : undefined
        const hash = tx ?? address ?? token?.address

        if (baseUrl && type && hash) {
            url = `${baseUrl.replace(/\/+$/, "")}/${type}/${hash}`
        }
    }

    return url
}

export const getAverageBlockTime = async ({
    chain,
    blockRange,
}: {
    chain: Chain,
    blockRange?: bigint,
}) => {

    const sampleSize = blockRange || chain.avgBlockTimeSampleRange
    const latestBlock = await getBlock(wagmiConfig, {
        chainId: chain.id,
    })
    const sampleBlock = await getBlock(wagmiConfig, {
        chainId: chain.id,
        blockNumber: latestBlock.number > sampleSize ? latestBlock.number - sampleSize : BigInt(1),
    })

    const numBlocks = latestBlock.number - sampleBlock.number
    const avgTimeSeconds = Number(latestBlock.timestamp - sampleBlock.timestamp) / Number(numBlocks)

    return {
        avgTimeSeconds: avgTimeSeconds,
        sampleBlock: sampleBlock,
        latestBlock: latestBlock,
    }
}

export const getEstimatedBlockFromTimestamp = async ({
    chain,
    timestamp,
    // queryBlocks,
}: {
    chain: Chain,
    timestamp: Date,
    // queryBlocks?: bigint,
}) => {

    const { avgTimeSeconds, sampleBlock, latestBlock } = await getAverageBlockTime({
        chain: chain,
    })

    // todo: check that the difference in blocks is within the max query range, keep fetching estimate until it is otherwise the query will never find it
    // const numBlocksQuery = queryBlocks || BigInt(chain.clientData.maxQueryChunkSize * chain.clientData.maxQueryBatchSize * chain.clientData.maxQueryNumBatches)
    const targetTimestampSeconds = BigInt(Math.floor(timestamp.getTime() / 1000))

    const diffSecondsLatest = MathBigInt.abs(latestBlock.timestamp - targetTimestampSeconds)
    const numBlocksLatest = BigInt(Math.floor(Number(diffSecondsLatest) / Number(avgTimeSeconds)))

    const diffSecondsSample = MathBigInt.abs(sampleBlock.timestamp - targetTimestampSeconds)
    const numBlocksSample = BigInt(Math.floor(Number(diffSecondsSample) / Number(avgTimeSeconds)))

    const estBlockNum = diffSecondsSample < diffSecondsLatest 
        ? (sampleBlock.timestamp < targetTimestampSeconds 
            ? sampleBlock.number + numBlocksSample 
            : sampleBlock.number - numBlocksSample) 
        : latestBlock.number - numBlocksLatest

    const estBlock = estBlockNum < BigInt(1) ? sampleBlock : await getBlock(wagmiConfig, {
        chainId: chain.id,
        blockNumber: estBlockNum,
    })

    const diffSecondsEst = MathBigInt.abs(estBlock.timestamp - targetTimestampSeconds)
    const diffSecondsMin = MathBigInt.min([diffSecondsLatest, diffSecondsSample, diffSecondsEst])
    const closestBlock = diffSecondsMin === diffSecondsEst ? estBlock : diffSecondsMin === diffSecondsSample ? sampleBlock : latestBlock

    return {
        estimatedBlock: closestBlock,
        targetTimestampSeconds: targetTimestampSeconds,
        avgBlockTimeSeconds: avgTimeSeconds,
        latestBlock: latestBlock,
        sampleBlock: sampleBlock,
    }
}

export const getFilteredChains = (networkMode: NetworkMode) => {
    return Object.values(SupportedChains).filter(chain => 
        networkMode === NetworkMode.Testnet ? chain.testnet === true : chain.testnet !== true
    )
}

// returns as number rather than chain id to avoid triggering dependency array changes while watching blocks
export const getNetworkModeChainIds = (networkMode: NetworkMode) => {
    return getFilteredChains(networkMode).map((chain) => Number(chain.id))
}
