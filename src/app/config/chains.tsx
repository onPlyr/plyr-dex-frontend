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

export const plyrPhi = {
    id: 16180,
    name: "PLYR PHI",
    testnet: false,
    nativeCurrency: {
        name: "PLYR",
        symbol: "PLYR",
        decimals: 18,
    },
    rpcUrls: {
        default: {
            http: ["https://subnets.avax.network/plyr/mainnet/rpc"],
        },
    },
    blockExplorers: {
        default: {
            name: "PLYR PHI Explorer",
            url: "https://explorer.plyr.network",
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
    plyrPhi,
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
                address: "0x949A4DC0d6c6B261a648B5542F550aB9fb1acdf1",
            },
            // {
            //     ...cellTypeDefinitions[CellType.Dexalot],
            //     address: "0xb2bA8c55d3F033fa33BDFf4ddb620071E5728596",
            // },
        ],
        blockchainId: "0x0427d4b22a2a78bcddd456742caf91b56badbff985ee19aef14573e7343fd652",
        minGasPrice: BigInt(1),
        gasPriceExponent: 9,
        avgBlockTimeMs: 500,
        avgBlockTimeSampleRange: BigInt(100000),
        clientData: {
            maxQueryChunkSize: 1000,
            maxQueryBatchSize: 20,
            maxQueryNumBatches: 10,
        },
        adapters: [
            // yak swap adapters
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
                address: "0xb94187369171f12ae28e08424BBD01424f13c659",
                name: "LFJ Liquidity Book",
                platform: "lfj",
            },
            {
                address: "0xf9F824576F06fF92765f2Af700a5A9923526261e",
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
                address: "0x4efB1880Dc9B01c833a6E2824C8EadeA83E428B0",
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
            // others
            {
                address: "0xb2bA8c55d3F033fa33BDFf4ddb620071E5728596",
                name: "Dexalot",
                platform: "dexalot",
            },
        ],
        //isDisabled: true,
    },
    [avalancheFuji.id]: {
        ...avalancheFuji,
        icon: `${avalancheFuji.id}.png`,
        iconBackground: "#ff394a",
        cells: [
            {
                ...cellTypeDefinitions[CellType.YakSwap],
                address: "0xF4C4459b642dA4aeE87f80AD4A040a8C01807Da8",
            },
            {
                ...cellTypeDefinitions[CellType.Dexalot],
                address: "0xbf6bE308626E49108aB776cA4A8e42666aB28616",
            },
        ],
        blockchainId: "0x7fc93d85c6d62c5b2ac0b519c87010ea5294012d1e407030d6acd0021cac10d5",
        minGasPrice: BigInt(1),
        gasPriceExponent: 9,
        avgBlockTimeMs: 500,
        avgBlockTimeSampleRange: BigInt(100000),
        clientData: {
            maxQueryChunkSize: 1000,
            maxQueryBatchSize: 20,
            maxQueryNumBatches: 10,
        },
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
                address: "0xbf6bE308626E49108aB776cA4A8e42666aB28616",
                name: "Dexalot",
                platform: "dexalot",
            },
        ],
    },
    [teschain.id]: {
        ...teschain,
        icon: `${teschain.id}.png`,
        cells: [
            {
                ...cellTypeDefinitions[CellType.UniV2],
                address: "0x01774D88deeB642b290D0BE0ABe4656BA23D58CB",
            },
        ],
        blockchainId: "0x7ca356c6720a432ffb58563d59b3424eb441239e373a93a6de9da358b81366f0",
        minGasPrice: BigInt(25),
        gasPriceExponent: 9,
        avgBlockTimeMs: 500,
        avgBlockTimeSampleRange: BigInt(5000),
        clientData: {
            maxQueryChunkSize: 100,
            maxQueryBatchSize: 10,
            maxQueryNumBatches: 10,
        },
        adapters: [
            {
                address: "0x4C5b32F836017d4686FDB3A7eB129c8642A97495",
                name: "Uniswap V2",
                platform: "uniswap",
            },
        ],
        isDisabled: true,
    },
    [plyrPhi.id]: {
        ...plyrPhi,
        icon: `${plyrPhi.id}.png`,
        iconBackground: "#ff6600",
        cells: [
            {
                ...cellTypeDefinitions[CellType.UniV2],
                address: "0x2b7DcD9E57D1893d455FB3239F83a3745Bb912e8",
            },
        ],
        blockchainId: "0x256c7bda2ac1afff9fa39e76ead0a2fae122c73ee0143402fe128fc463c9ce1b",
        minGasPrice: BigInt(25),
        gasPriceExponent: 9,
        avgBlockTimeMs: 500,
        avgBlockTimeSampleRange: BigInt(10000),
        clientData: {
            maxQueryChunkSize: 100,
            maxQueryBatchSize: 10,
            maxQueryNumBatches: 10,
        },
        adapters: [
            {
                address: "0x2b7DcD9E57D1893d455FB3239F83a3745Bb912e8",
                name: "PLYR[SWAP]",
                platform: "plyr",
            },
        ],
    },
    [plyrTau.id]: {
        ...plyrTau,
        icon: `${plyrTau.id}.png`,
        iconBackground: "#ff6600",
        cells: [
            {
                ...cellTypeDefinitions[CellType.UniV2],
                address: "0x33234C8083Ff12AFFa0Fed2c854082296046C59d",
            },
        ],
        blockchainId: "0x59b5bdd59c9a138861e499f871c3cf10f2517394f6ff77f8067430d57e8e9489",
        minGasPrice: BigInt(25),
        gasPriceExponent: 9,
        avgBlockTimeMs: 500,
        avgBlockTimeSampleRange: BigInt(10000),
        clientData: {
            maxQueryChunkSize: 100,
            maxQueryBatchSize: 10,
            maxQueryNumBatches: 10,
        },
        adapters: [
            {
                address: "0x33234C8083Ff12AFFa0Fed2c854082296046C59d",
                name: "PLYR[SWAP]",
                platform: "plyr",
            },
            {
                address: "0x41E0e24C4637F254B8039E50c3eFb31c435b8C1D",
                name: "PLYR[SWAP]",
                platform: "plyr",
            },
        ],
    },
    [coqnet.id]: {
        ...coqnet,
        icon: `${coqnet.id}.svg`,
        iconBackground: "#ff6600",
        cells: [
            {
                ...cellTypeDefinitions[CellType.HopOnly],
                address: "0xa7f586470CD7b70F9b5893eEe85C0b5354541A99",
            },
        ],
        blockchainId: "0x898b8aa8353f2b79ee1de07c36474fcee339003d90fa06ea3a90d9e88b7d7c33",
        minGasPrice: BigInt(25),
        gasPriceExponent: 9,
        avgBlockTimeMs: 500,
        avgBlockTimeSampleRange: BigInt(10000),
        clientData: {
            maxQueryChunkSize: 100,
            maxQueryBatchSize: 10,
            maxQueryNumBatches: 10,
        },
        adapters: [],
        isDisabled: true,
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
        clientData: {
            maxQueryChunkSize: 100,
            maxQueryBatchSize: 10,
            maxQueryNumBatches: 10,
        },
        adapters: [],
        isDisabled: true,
    },
} as const

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
            fetchOptions: chain.clientData.fetchOptions,
            onFetchRequest: chain.clientData.onFetchRequest,
            onFetchResponse: chain.clientData.onFetchResponse,
        }),
        http(),
    ])
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const clientTransports: Record<number, any> = {
    ...clientTransportsData,
} as const