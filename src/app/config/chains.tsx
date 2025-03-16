import { Chain as RainbowKitChain } from "@rainbow-me/rainbowkit"
import { fallback, http } from "wagmi"
import { avalanche, avalancheFuji } from "wagmi/chains"

import { cellTypeDefinitions } from "@/app/config/cells"
import { CellType } from "@/app/types/cells"
import { Chain, ChainId, ClientTransportsType } from "@/app/types/chains"
import { NetworkMode } from "@/app/types/preferences"

// note: custom chains must be defined and added to both the wagmiChains array and SupportedChains to be usable

const rpcUrl = process.env.NEXT_PUBLIC_TESCHAIN_RPC_URL || ""

export const teschain = {
    id: 900090009000,
    name: "Tesseract9000",
    testnet: true,
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
    name: "PLYR TAU",
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
            name: "Avalanche L1 Explorer",
            url: "https://subnets-test.avax.network/plyr",
        },
    },
} as const satisfies RainbowKitChain

export const coqnet = {
    id: 42069,
    name: "Coqnet",
    testnet: false,
    nativeCurrency: {
        name: "COQ",
        symbol: "COQ",
        decimals: 18,
    },
    rpcUrls: {
        default: {
            http: ["https://subnets.avax.network/coqnet/mainnet/rpc"],
        },
    },
    blockExplorers: {
        default: {
            name: "Avalanche L1 Explorer",
            url: "https://subnets.avax.network/coqnet",
        },
    },
} as const satisfies RainbowKitChain

export const coqnetFuji = {
    id: 48765,
    name: "Coqnet Testnet",
    testnet: true,
    nativeCurrency: {
        name: "COQ",
        symbol: "COQ",
        decimals: 18,
    },
    rpcUrls: {
        default: {
            http: ["https://subnets.avax.network/coqnetfuji/testnet/rpc"],
        },
    },
    blockExplorers: {
        default: {
            name: "Avalanche L1 Explorer",
            url: "https://subnets-test.avax.network/coqnetfuji",
        },
    },
} as const satisfies RainbowKitChain

export const wagmiChains = [
    avalanche,
    avalancheFuji,
    teschain,
    plyrTau,
    coqnet,
    coqnetFuji,
] as const

// todo: avg block time needs updating / renaming as it's not used for that now
// used for est swap times, so avg swap time or similar probably a better name
export const SupportedChains: Record<ChainId, Chain> = {
    [avalanche.id]: {
        ...avalanche,
        icon: `${avalanche.id}.png`,
        iconBackground: "#ff394a",
        cells: [
            {
                ...cellTypeDefinitions[CellType.YakSwap],
                address: "0x961BC362b0a77781612E6dC4F5E02DFa85C9504d",
            },
        ],
        blockchainId: "0x0427d4b22a2a78bcddd456742caf91b56badbff985ee19aef14573e7343fd652",
        minGasPrice: BigInt(1),
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
            // {
            //     ...cellTypeDefinitions[CellType.YakSwap],
            //     address: "0x605E3f6239066f350C6497241d2cA285061dd095",
            // },
            // todo: tbc, needs testing with new initiated event
            // event Initiated(address indexed sender, address indexed token, uint256 amount, bytes instructions)
            // abi: https://gist.github.com/midnight-commit/df2a17af93fec774e4bbd717f9a4e9cd
            {
                ...cellTypeDefinitions[CellType.YakSwap],
                // address: "0x5e30439FDD999686ccbb22a59bfedD05b6bFe1C3",
                address: "0x6Abb82d940887a637948d6f223259499a4433E67",
            },
            {
                ...cellTypeDefinitions[CellType.Dexalot],
                address: "0xaC497Cf95801cE89C527eAc5F3792a239f8975F7",
                // address: "0x05d9C541CA76635062b3173c76934DA23820ae0E",
            },
        ],
        blockchainId: "0x7fc93d85c6d62c5b2ac0b519c87010ea5294012d1e407030d6acd0021cac10d5",
        minGasPrice: BigInt(1),
        gasPriceExponent: 9,
        avgBlockTimeMs: 500,
        avgBlockTimeSampleRange: BigInt(100000),
        adapters: [
            {
                address: "0xdF3d4b7032EB29599503a78FFD28C2906C6EAe4e",
                name: "Pangolin",
                platform: "pangolin",
            },
            {
                address: "0xF3ff754A631B0230e3bEbEC8061a68333B6A4B13",
                name: "LFJ Liquidity Book",
                platform: "lfj",
            },
            {
                address: "0x61f697853D7Cb5c4ffc96f895aE56ed6CEf8a14f",
                name: "LFJ V1",
                platform: "lfj",
            },
            {
                address: "0xaC497Cf95801cE89C527eAc5F3792a239f8975F7",
                // address: "0x05d9C541CA76635062b3173c76934DA23820ae0E",
                name: "Dexalot",
                platform: "dexalot",
            },
        ],
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
                // address: "0x4C5b32F836017d4686FDB3A7eB129c8642A97495",
                address: "0x01774D88deeB642b290D0BE0ABe4656BA23D58CB",
            },
        ],
        blockchainId: "0x7ca356c6720a432ffb58563d59b3424eb441239e373a93a6de9da358b81366f0",
        minGasPrice: BigInt(25),
        gasPriceExponent: 9,
        avgBlockTimeMs: 500,
        avgBlockTimeSampleRange: BigInt(5000),
        adapters: [
            {
                address: "0x4C5b32F836017d4686FDB3A7eB129c8642A97495",
                name: "Uniswap V2",
                platform: "uniswap",
            },
        ],
        clientData: {
            maxQueryChunkSize: 100,
            maxQueryBatchSize: 10,
            maxQueryNumBatches: 10,
        },
        isDisabled: true,
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
        adapters: [
            {
                address: "0xcC76c9F36193Ba61BF92020eAc5De177A6cE2E3A",
                name: "Uniswap V2",
                platform: "uniswap",
            },
            {
                address: "0x41E0e24C4637F254B8039E50c3eFb31c435b8C1D",
                name: "PLYR[SWAP]",
                platform: "plyr",
            },
        ],
        clientData: {
            maxQueryChunkSize: 100,
            maxQueryBatchSize: 10,
            maxQueryNumBatches: 10,
        },
    },
    [coqnet.id]: {
        ...coqnet,
        icon: `${coqnet.id}.svg`,
        iconBackground: "#ff6600",
        cells: [
            {
                ...cellTypeDefinitions[CellType.HopOnly],
                address: "0x04CfcA82fDf5F4210BC90f06C44EF25Bf743D556",
            },
        ],
        blockchainId: "0x898b8aa8353f2b79ee1de07c36474fcee339003d90fa06ea3a90d9e88b7d7c33",
        minGasPrice: BigInt(25),
        gasPriceExponent: 9,
        avgBlockTimeMs: 500,
        avgBlockTimeSampleRange: BigInt(10000),
        adapters: [],
        clientData: {
            maxQueryChunkSize: 100,
            maxQueryBatchSize: 10,
            maxQueryNumBatches: 10,
        },
    },
    [coqnetFuji.id]: {
        ...coqnetFuji,
        icon: `${coqnetFuji.id}.png`,
        iconBackground: "#ff6600",
        cells: [],
        blockchainId: "0x1fbae9f07fdccb931e9de419b15690728296f4743f77588082b3e4425d6de54a",
        minGasPrice: BigInt(25),
        gasPriceExponent: 9,
        avgBlockTimeMs: 500,
        avgBlockTimeSampleRange: BigInt(10000),
        adapters: [],
        clientData: {
            maxQueryChunkSize: 100,
            maxQueryBatchSize: 10,
            maxQueryNumBatches: 10,
        },
    },
} as const

export const defaultNetworkMode = NetworkMode.Testnet

const networkModeLabels: Record<NetworkMode, string> = {
    [NetworkMode.Mainnet]: "Mainnet",
    [NetworkMode.Testnet]: "Testnet",
}

export const getNetworkModeLabel = (networkMode: NetworkMode) => {
    return networkModeLabels[networkMode]
}
        
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
