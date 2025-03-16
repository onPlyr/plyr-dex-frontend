import { Address } from "viem"

import { erc20TokenHomeAbi } from "@/app/abis/ictt/erc20TokenHome"
import { erc20TokenRemoteAbi } from "@/app/abis/ictt/erc20TokenRemote"
import { nativeTokenHomeAbi } from "@/app/abis/ictt/nativeTokenHome"
import { nativeTokenRemoteAbi } from "@/app/abis/ictt/nativeTokenRemote"
import { ChainId } from "@/app/types/chains"
import { Hop, SwapId } from "@/app/types/swaps"
import { Token } from "@/app/types/tokens"

////////////////////////////////////////////////////////////////////////////////
// types

export const BridgeType = {
    NativeHome: "nativeHome",
    NativeRemote: "nativeRemote",
    Erc20Home: "erc20Home",
    Erc20Remote: "erc20Remote",
} as const
export type BridgeType = (typeof BridgeType)[keyof typeof BridgeType]

export const HomeBridgeType = [BridgeType.NativeHome, BridgeType.Erc20Home] as const
export type HomeBridgeType = typeof HomeBridgeType[number]

export const RemoteBridgeType = [BridgeType.NativeRemote, BridgeType.Erc20Remote] as const
export type RemoteBridgeType = typeof RemoteBridgeType[number]

export const NativeBridgeType = [BridgeType.NativeHome, BridgeType.NativeRemote] as const
export type NativeBridgeType = typeof NativeBridgeType[number]

export const BridgeProvider = {
    ICTT: "ICTT",
} as const
export type BridgeProvider = (typeof BridgeProvider)[keyof typeof BridgeProvider]

export const BridgeTypeAbi = {
    [BridgeType.NativeHome]: nativeTokenHomeAbi,
    [BridgeType.NativeRemote]: nativeTokenRemoteAbi,
    [BridgeType.Erc20Home]: erc20TokenHomeAbi,
    [BridgeType.Erc20Remote]: erc20TokenRemoteAbi,
} as const
export type BridgeTypeAbi = (typeof BridgeTypeAbi)[keyof typeof BridgeTypeAbi]

export const isHomeBridge = (type: BridgeType): type is HomeBridgeType => {
    return HomeBridgeType.includes(type as HomeBridgeType)
}

export const isRemoteBridge = (type: BridgeType): type is RemoteBridgeType => {
    return RemoteBridgeType.includes(type as RemoteBridgeType)
}

export const isNativeBridge = (type: BridgeType): type is NativeBridgeType => {
    return NativeBridgeType.includes(type as NativeBridgeType)
}

////////////////////////////////////////////////////////////////////////////////
// bridge paths

interface BaseBridgePathData {
    chainId: ChainId,
    token: Token,
    address: Address,
    type: BridgeType,
}

export interface BridgePath {
    srcData: BaseBridgePathData,
    dstData: BaseBridgePathData,
    provider: BridgeProvider,
}

interface BridgeBaseData<TType = BridgeType> {
    chainId: ChainId,
    address: Address,
    type: TType,
}

export interface TokenBridge {
    home: BridgeBaseData<HomeBridgeType>,
    remote: BridgeBaseData<RemoteBridgeType>,
    provider: BridgeProvider,
}

export interface BridgePathHopData {
    id: SwapId,
    parentId?: SwapId,
    hop: Hop,
    isNextHop?: boolean,
}
