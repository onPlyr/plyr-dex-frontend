import { Chain as RainbowKitChain } from "@rainbow-me/rainbowkit"
import { FallbackTransport, Hex, Transport } from "viem"

import { wagmiConfig } from "@/app/config/wagmi"
import { Cell } from "@/app/types/cells"
import { IconFormat } from "@/app/types/styling"
import { SwapAdapter } from "@/app/types/swaps"

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const wagmiChainIds = wagmiConfig.chains.map((chain) => chain.id)
export type ChainId = (typeof wagmiChainIds)[number]

export interface Chain extends RainbowKitChain {
    id: ChainId,
    icon: `${string}.${IconFormat}`,
    cells: Cell[],
    blockchainId: Hex,
    minGasPrice: bigint,
    defaultFixedNativeFee?: number,
    gasPriceExponent: number,
    avgBlockTimeMs: number,
    avgBlockTimeSampleRange: bigint,
    adapters?: SwapAdapter[],
    clientData: ClientData,
    isDisabled?: boolean,
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

export const isSupportedChainId = (chainId: number): chainId is ChainId => {
    return wagmiChainIds.includes(chainId as ChainId)
}
