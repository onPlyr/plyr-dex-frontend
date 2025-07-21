import { Address } from "viem"

import { uniV2CellAbi } from "@/app/abis/cells/uniV2"
import { uniV2FactoryAbi } from "@/app/abis/uniV2/uniV2Factory"
import { ChainId } from "@/app/types/chains"
import { TokenPair } from "@/app/types/tokens"

export interface UniV2CellPairData {
    chainId: ChainId,
    cell: Address,
    pairs: TokenPair[],
}

export interface UniV2FactoryQuery {
    chainId: ChainId,
    address: Address,
    abi: typeof uniV2CellAbi,
    functionName: "factory",
}

export interface UniV2GetPairQuery {
    chainId: ChainId,
    address: Address,
    abi: typeof uniV2FactoryAbi,
    functionName: "getPair",
    args: [Address, Address],
    cell: Address,
    pair: TokenPair,
}