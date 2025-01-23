import { Chain as RainbowKitChain } from "@rainbow-me/rainbowkit"
import { Address, FallbackTransport, Hex, Transport } from "viem"

import { wagmiConfig } from "@/app/config/wagmi"
import { Cell } from "@/app/types/cells"
import { IconFormat } from "@/app/types/styling"
import { Adapter } from "@/app/types/swaps"

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const wagmiChainIds = wagmiConfig.chains.map((chain) => chain.id)
export type ChainId = (typeof wagmiChainIds)[number]

export interface Chain extends RainbowKitChain {
    id: ChainId,
    icon: `${string}.${IconFormat}`,
    cells: Cell[],
    blockchainId: Hex,
    minGasPrice: bigint,
    gasPriceExponent: number,
    avgBlockTimeMs: number,
    avgBlockTimeSampleRange: bigint,
    adapters?: {
        [key: Address]: Adapter,
    },
    clientData: ClientData,
}

export interface RainbowKitChainData {
    hasIcon: boolean,
    iconUrl?: string,
    iconBackground?: string,
    id: number,
    name?: string,
    unsupported?: boolean,
}

export interface ClientData {
    maxQueryChunkSize: number,
    maxQueryBatchSize: number,
    maxQueryNumBatches: number,
}

export type ClientTransportsType = {
    [chainId in ChainId]?: FallbackTransport<Transport[]>
}
