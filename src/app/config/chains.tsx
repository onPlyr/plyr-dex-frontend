import { Chain as RainbowKitChain } from "@rainbow-me/rainbowkit"
import { fallback, http } from "wagmi"
import { avalanche, avalancheFuji } from "wagmi/chains"

import { cellTypeDefinitions } from "@/app/config/cells"
import { CellType } from "@/app/types/cells"
import { Chain, ChainId, ClientTransportsType } from "@/app/types/chains"

// note: custom chains must be defined and added to both the wagmiChains array and SupportedChains map to be usable

const rpcUrl = process.env.NEXT_PUBLIC_TESCHAIN_RPC_URL || ""

export const teschain = {
    id: 900090009000,
    name: "Tesseract9000",
    nativeCurrency: {
        name: "Tes",
        symbol: "TES",
        decimals: 18,
    },
    rpcUrls: {
        default: {
            http: [rpcUrl],
        },
    },
} as const satisfies RainbowKitChain

export const plyrTau = {
    id: 62831,
    name: "PLYR TAU NETWORK",
    testnet: true,
    nativeCurrency: {
        name: "PLYR",
        symbol: "PLYR",
        decimals: 18,
    },
    rpcUrls: {
        default: {
            http: ["https://subnets.avax.network/plyr/testnet/rpc"],
        },
    },
    blockExplorers: {
        default: {
            name: "PLYR TAU Explorer",
            url: "https://explorer-testnet.plyr.network",
        },
    },
} as const satisfies RainbowKitChain

export const wagmiChains = [
    avalanche,
    avalancheFuji,
    teschain,
    plyrTau,
] as const

// todo: avg block time needs updating / renaming as it's not used for that now
// used for est swap times, so avg swap time or similar probably a better name
export const SupportedChains: Record<ChainId, Chain> = {
    [avalanche.id]: {
        ...avalanche,
        icon: `${avalanche.id}.png`,
        iconBackground: "#ff394a",
        cells: [],
        blockchainId: "0x0427d4b22a2a78bcddd456742caf91b56badbff985ee19aef14573e7343fd652",
        minGasPrice: BigInt(25),
        gasPriceExponent: 9,
        avgBlockTimeMs: 500,
        avgBlockTimeSampleRange: BigInt(100000),
        clientData: {
            maxQueryChunkSize: 1000,
            maxQueryBatchSize: 10,
            maxQueryNumBatches: 10,
        },
    },
    [avalancheFuji.id]: {
        ...avalancheFuji,
        icon: `${avalancheFuji.id}.png`,
        iconBackground: "#ff394a",
        cells: [
            {
                ...cellTypeDefinitions[CellType.YakSwap],
                address: "0x605E3f6239066f350C6497241d2cA285061dd095",
            },
            // {
            //     ...cellTypeDefinitions[CellType.Dexalot],
            //     address: "0xaC497Cf95801cE89C527eAc5F3792a239f8975F7",
            // },
        ],
        blockchainId: "0x7fc93d85c6d62c5b2ac0b519c87010ea5294012d1e407030d6acd0021cac10d5",
        minGasPrice: BigInt(1),
        gasPriceExponent: 9,
        avgBlockTimeMs: 500,
        avgBlockTimeSampleRange: BigInt(100000),
        adapters: {
            "0xdF3d4b7032EB29599503a78FFD28C2906C6EAe4e": {
                name: "Pangolin",
                platform: "pangolin",
            },
            "0xF3ff754A631B0230e3bEbEC8061a68333B6A4B13": {
                name: "LFJ Liquidity Book",
                platform: "lfj",
            },
            "0x61f697853D7Cb5c4ffc96f895aE56ed6CEf8a14f": {
                name: "LFJ V1",
                platform: "lfj",
            },
        },
        clientData: {
            maxQueryChunkSize: 1000,
            maxQueryBatchSize: 10,
            maxQueryNumBatches: 10,
        },
    },
    [teschain.id]: {
        ...teschain,
        icon: `${teschain.id}.png`,
        cells: [
            {
                ...cellTypeDefinitions[CellType.UniV2],
                address: "0x4C5b32F836017d4686FDB3A7eB129c8642A97495",
            },
        ],
        blockchainId: "0x7ca356c6720a432ffb58563d59b3424eb441239e373a93a6de9da358b81366f0",
        minGasPrice: BigInt(25),
        gasPriceExponent: 9,
        avgBlockTimeMs: 500,
        avgBlockTimeSampleRange: BigInt(5000),
        adapters: {
            "0x4C5b32F836017d4686FDB3A7eB129c8642A97495": {
                name: "Uniswap V2",
                platform: "uniswap",
            },
        },
        clientData: {
            maxQueryChunkSize: 100,
            maxQueryBatchSize: 10,
            maxQueryNumBatches: 10,
        },
    },
    [plyrTau.id]: {
        ...plyrTau,
        icon: `${plyrTau.id}.png`,
        iconBackground: "#ff6600",
        cells: [
            {
                ...cellTypeDefinitions[CellType.UniV2],
                address: "0xcC76c9F36193Ba61BF92020eAc5De177A6cE2E3A",
            },
        ],
        blockchainId: "0x59b5bdd59c9a138861e499f871c3cf10f2517394f6ff77f8067430d57e8e9489",
        minGasPrice: BigInt(25),
        gasPriceExponent: 9,
        avgBlockTimeMs: 500,
        avgBlockTimeSampleRange: BigInt(10000),
        adapters: {
            "0xcC76c9F36193Ba61BF92020eAc5De177A6cE2E3A": {
                name: "Uniswap V2",
                platform: "uniswap",
            },
        },
        clientData: {
            maxQueryChunkSize: 100,
            maxQueryBatchSize: 10,
            maxQueryNumBatches: 10,
        },
    },
} as const

export const defaultChain = SupportedChains[avalancheFuji.id]

const clientTransportsData: ClientTransportsType = {}
Object.values(SupportedChains).forEach((chain) => {
    clientTransportsData[chain.id] = fallback([
        http(chain.rpcUrls?.default.http[0], {
            batch: {
                batchSize: chain.clientData.maxQueryBatchSize,
            },
        }),
        http(),
    ])
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const clientTransports: Record<number, any> = {
    ...clientTransportsData,
} as const
