import { useCallback, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { Block } from "viem"
import { getBlock } from "@wagmi/core"

import { SupportedChains } from "@/app/config/chains"
import { wagmiConfig } from "@/app/config/wagmi"
import { getParsedError } from "@/app/lib/utils"
import { ChainId, isSupportedChainId } from "@/app/types/chains"

type BlockDataMap = Map<number, Block | undefined>
export interface UseLatestBlocksReturnType {
    blockData: BlockDataMap,
    getLatestBlock: (chainId: ChainId) => Block | undefined,
    isPending: boolean,
    isFetching: boolean,
    error?: string,
    refetch: () => void,
}

const fetchLatestBlocks = async ({
    chainIds,
    initialData,
}: {
    chainIds: number[],
    initialData: BlockDataMap,
}) => {

    const blockData: BlockDataMap = new Map(initialData)

    try {

        if (!chainIds.length) {
            return blockData
        }

        for (const id of chainIds) {

            if (!isSupportedChainId(id)) {
                continue
            }

            blockData.set(id, await getBlock(wagmiConfig, {
                chainId: id,
                blockTag: "finalized",
                includeTransactions: false,
            }))
        }

        return blockData
    }

    catch (err) {
        throw new Error(getParsedError(err))
    }
}

const useLatestBlocks = (chainIds: ChainId[]): UseLatestBlocksReturnType => {

    const queryChainIds: number[] = useMemo(() => chainIds.filter((chainId) => Object.values(SupportedChains).some((chain) => !chain.isDisabled && chain.id === chainId)), [chainIds])
    const initialBlockData: BlockDataMap = useMemo(() => new Map(queryChainIds.map((id) => [id, undefined])), [queryChainIds])

    const { data, isPending, isFetching, error, refetch } = useQuery({
        queryKey: ["latestBlocks", queryChainIds],
        queryFn: async () => fetchLatestBlocks({
            chainIds: queryChainIds,
            initialData: initialBlockData,
        }),
    })

    const blockData = useMemo(() => data ?? initialBlockData, [initialBlockData, data])
    const errorMsg = useMemo(() => error ? getParsedError(error) : undefined, [error])
    const getLatestBlock = useCallback((chainId: ChainId) => blockData.get(chainId), [blockData])

    return {
        blockData: blockData,
        getLatestBlock: getLatestBlock,
        isPending: isPending,
        isFetching: isFetching,
        error: errorMsg,
        refetch: refetch,
    }
}

export default useLatestBlocks
