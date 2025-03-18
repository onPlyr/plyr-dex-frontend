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
        adapters: [
            {
                address: "0x3614657EDc3cb90BA420E5f4F61679777e4974E3",
                name: "Pangolin",
                platform: "pangolin",
            },
            {
                address: "0xDB66686Ac8bEA67400CF9E5DD6c8849575B90148",
                name: "LFJ",
                platform: "lfj",
            },
            {
                address: "0x6A68F261F8976559259d74A3494C19Ee2bDE0e4F",
                name: "LFJ Liquidity Book",
                platform: "lfj",
            },
            {
                address: "0xd8F5aBA3Ee8E3B27633E06b43f459f5bCE516Ab6",
                name: "LFJ Liquidity Book",
                platform: "lfj",
            },
            {
                address: "0x29deCcD2f4Fdb046D24585d01B1DcDFb902ACAcD",
                name: "Uniswap",
                platform: "uniswap",
            },
            {
                address: "0xd0f6e66113A6D6Cca238371948F4Ce2893D62881",
                name: "Curve",
                platform: "curve",
            },
            {
                address: "0x7F8B47Ff174Eaf96960a050B220a907dFa3feD5b",
                name: "GMX",
                platform: "gmx",
            },
            {
                address: "0x5d6fCD3108E016912Fa3448636e378B116167104",
                name: "GMX",
                platform: "gmx",
            },
            {
                address: "0x97d26D7fc0895e3456b2146585848b466cfbb1cf",
                name: "Pharaoh",
                platform: "pharaoh",
            },
            {
                address: "0xFE163f7DB6674ae3Fed3f148B19483ca516565Fd",
                name: "Geode",
                platform: "geode",
            },
            {
                address: "0x3f314530a4964acCA1f20dad2D35275C23Ed7F5d",
                name: "Sushi",
                platform: "sushi",
            },
            {
                address: "0xaFb5aE9934266a131F44F2A80c783d6a827A3d1a",
                name: "Synapse",
                platform: "synapse",
            },
            {
                address: "0x491dc06178CAF5b962DB53576a8A1456a8476232",
                name: "Curve",
                platform: "curve",
            },
            {
                address: "0x5083fC22c18771609fA661fc6304a611613A6068",
                name: "Curve",
                platform: "curve",
            },
            {
                address: "0x77fc17D927eBcEaEA2c4704BaB1AEebB0547ea42",
                name: "Curve",
                platform: "curve",
            },
            {
                address: "0x22c62c9E409B97F1f9caA5Ca5433074914d73c3e",
                name: "Curve",
                platform: "curve",
            },
            {
                address: "0x3EeA1f1fFCA00c69bA5a99E362D9A7d4e3902B3c",
                name: "Curve",
                platform: "curve",
            },
            {
                address: "0x3B9645B2432374d9B3Fa766b95D5A793D7241190",
                name: "WOOFi",
                platform: "woofi",
            },
            {
                address: "0x7De32C76309aeB1025CBA3384caBe36326603046",
                name: "Wombat",
                platform: "wombat",
            },
            {
                address: "0x2F6ca0a98CF8f7D407E98993fD576f70F0FAA80B",
                name: "BENQI",
                platform: "benqi",
            },
            {
                address: "0x79632b8194a1Ce048e5d9b0e282E9eE2d4579c20",
                name: "GoGoPool",
                platform: "gogopool",
            },
            // todo: check if the below is needed
            {
                address: "0x5C4d23fd18Fc4128f77426F42237acFcE618D0b1",
                name: "WAVAX",
                platform: "wrappedavax",
            },
            {
                address: "0xA05A3ebE5D0Ab59E449Fe34014f51948cb9F31dF",
                name: "Pharaoh",
                platform: "pharaoh",
            },
            {
                address: "0x214617987145Ef7c5462870362FdCAe9cacdf3C8",
                name: "LFJ Token Mill",
                platform: "lfj",
            },
        ],
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
            // {
            //     ...cellTypeDefinitions[CellType.Dexalot],
            //     address: "0xaC497Cf95801cE89C527eAc5F3792a239f8975F7",
            //     // address: "0x05d9C541CA76635062b3173c76934DA23820ae0E",
            // },
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
            // {
            //     address: "0xaC497Cf95801cE89C527eAc5F3792a239f8975F7",
            //     // address: "0x05d9C541CA76635062b3173c76934DA23820ae0E",
            //     name: "Dexalot",
            //     platform: "dexalot",
            // },
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
        isDisabled: true,
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
