import { avalanche, avalancheFuji } from "viem/chains"

import { coqnet, plyrPhi, plyrTau, SupportedChains } from "@/app/config/chains"
import { HopGasUnitsData, HopType } from "@/app/types/swaps"
import { NetworkMode } from "@/app/types/preferences"

// defaults
export const defaultMinGasPrice = BigInt(25)
export const defaultGasPriceExponent = 9

export const durationEstimateNumConfirmations = 3

export const TokenInputPercentOptions = [
    {
        percent: 50,
        label: "Half",
    },
    {
        percent: 100,
        label: "Max",
    },
] as const

export const SwapQuoteConfig = {
    MaxHops: 2,
    DefaultMaxHops: 2,
    QuoteValidMs: 30000,
    AlternativeQuoteSwitchDelayMs: 5000,
    InitiatedBlockBuffer: BigInt(10),
    DefaultFixedNativeFee: 0.001,
    DefaultBaseFeeBps: 10,
} as const

export const YakSwapConfig = {
    DefaultMaxSteps: 2,
    Fee: BigInt(0),
}

export const GasUnits = {
    Est: BigInt(500000),
    Buffer: BigInt(1000000),
} as const

export const HopTypeGasUnits: Record<HopType, HopGasUnitsData> = {
    [HopType.Hop]: {
        estBase: BigInt(0),
        estDefault: GasUnits.Est,
        recipientLimitBase: GasUnits.Buffer,
        requiredLimitBase: GasUnits.Buffer + GasUnits.Est,
    },
    [HopType.HopAndCall]: {
        estBase: GasUnits.Buffer,
        estDefault: GasUnits.Est,
        recipientLimitBase: GasUnits.Buffer,
        requiredLimitBase: GasUnits.Buffer + GasUnits.Est,
    },
    [HopType.SwapAndHop]: {
        estBase: GasUnits.Buffer,
        estDefault: GasUnits.Est,
        recipientLimitBase: GasUnits.Buffer,
        requiredLimitBase: GasUnits.Buffer + GasUnits.Est,
    },
    [HopType.SwapAndTransfer]: {
        estBase: GasUnits.Buffer,
        estDefault: GasUnits.Est,
        recipientLimitBase: GasUnits.Buffer,
        requiredLimitBase: GasUnits.Buffer + GasUnits.Est,
    },
} as const

export const DefaultSwapRouteConfig = {
    [NetworkMode.Mainnet]: {
        srcChain: SupportedChains[plyrPhi.id],
        dstChain: SupportedChains[plyrPhi.id],
    },
    [NetworkMode.Testnet]: {
        srcChain: SupportedChains[avalancheFuji.id],
        dstChain: SupportedChains[plyrTau.id],
    },
} as const
