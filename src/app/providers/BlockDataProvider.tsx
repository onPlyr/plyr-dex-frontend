"use client"

import { createContext, useCallback, useEffect, useState } from "react"
import { Block } from "viem"
import { watchBlocks } from "@wagmi/core"

import { SupportedChains } from "@/app/config/chains"
import { wagmiConfig } from "@/app/config/wagmi"
import { ChainId } from "@/app/types/chains"

type LatestBlockData = Record<ChainId, Block | undefined>

interface BlockDataContextType {
    latestBlocks: LatestBlockData,
    getLatestBlock: (chainId: ChainId) => Block | undefined,
}

export const BlockDataContext = createContext({} as BlockDataContextType)

const BlockDataProvider = ({
    children,
}: {
    children: React.ReactNode,
}) => {

    const [latestBlocks, setLatestBlocks] = useState<LatestBlockData>(Object.fromEntries(Object.values(SupportedChains).filter((chain) => !chain.isDisabled).map((chain) => [chain.id, undefined])) as LatestBlockData)

    useEffect(() => {

        const unwatchBlocks = Object.values(SupportedChains).filter((chain) => !chain.isDisabled).map((chain) => watchBlocks(wagmiConfig, {
            chainId: chain.id,
            blockTag: "finalized",
            emitOnBegin: true,
            onBlock: (block) => {
                setLatestBlocks((prev) => ({
                    ...prev,
                    [chain.id]: block,
                }))
            },
            syncConnectedChain: false,
        }))

        return () => unwatchBlocks.forEach((unwatch) => unwatch())

    }, [])

    const getLatestBlock = useCallback((chainId: ChainId) => {
        return latestBlocks[chainId]
    }, [latestBlocks])

    const context: BlockDataContextType = {
        latestBlocks: latestBlocks,
        getLatestBlock: getLatestBlock,
    }

    return (
        <BlockDataContext.Provider value={context}>
            {children}
        </BlockDataContext.Provider>
    )
}

export default BlockDataProvider
