import { zeroAddress } from "viem"
import { avalanche, avalancheFuji } from "wagmi/chains"

import { coqnet, coqnetFuji, plyrTau, SupportedChains, teschain } from "@/app/config/chains"
import { ApiProvider } from "@/app/types/apis"
import { BridgePath, BridgeProvider, BridgeType } from "@/app/types/bridges"
import { BaseToken, Token, TokenFilterData, TokenId, TokenSortType } from "@/app/types/tokens"

const baseTokens: BaseToken[] = [
    {
        id: "alot",
        symbol: "ALOT",
        name: "Dexalot ",
        decimals: 18,
        icon: "alot.png",
        iconBackground: "#f6006b",
        chains: {
            [avalancheFuji.id]: {
                address: "0x9983F755Bbd60d1886CbfE103c98C272AA0F03d6",
                apiData: {
                    [ApiProvider.Dexalot]: {
                        id: "ALOT",
                    },
                },
            },
        },
    },
    {
        id: "apex",
        symbol: "APEX",
        name: "APEX ",
        decimals: 18,
        icon: "apex.png",
        iconBackground: "#2979ff",
        chains: {
            [avalancheFuji.id]: {
                address: "0x2468a9B0fD297CA7411aF891b5C86A212fD2a519",
            },
        },
    },
    {
        id: "avax",
        symbol: "AVAX",
        name: "Native AVAX",
        decimals: 18,
        icon: "avax.svg",
        iconBackground: "#ff394a",
        chains: {
            [avalanche.id]: {
                address: zeroAddress,
                apiData: {
                    [ApiProvider.Dexalot]: {
                        id: "AVAX",
                    },
                },
                isNative: true,
                wrappedAddress: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
                wrappedToken: "WAVAX",
            },
            [avalancheFuji.id]: {
                address: zeroAddress,
                apiData: {
                    [ApiProvider.Dexalot]: {
                        id: "AVAX",
                    },
                },
                isNative: true,
                wrappedAddress: "0xd00ae08403B9bbb9124bB305C09058E32C39A48c",
                wrappedToken: "WAVAX",
            },
            [teschain.id]: {
                displayName: "AVAX",
                address: "0x4730d16278c5bfb6f4326b8d2d2a9b3ad3fef098",
            },
            [coqnet.id]: {
                displayName: "AVAX",
                address: "0x28af629a9f3ece3c8d9f0b7ccf6349708cec8cfb",
            }
        },
        bridges: [
            {
                home: {
                    chainId: avalanche.id,
                    address: "0x30CdA6AF61c3A07ca81909699C85307DEF4398E5",
                    type: BridgeType.NativeHome,
                },
                remote: {
                    chainId: coqnet.id,
                    address: "0x28af629a9f3ece3c8d9f0b7ccf6349708cec8cfb",
                    type: BridgeType.Erc20Remote,
                },
                provider: BridgeProvider.ICTT,
            },
            {
                home: {
                    chainId: avalancheFuji.id,
                    address: "0xf37a2b936f214f9e72156ce5e340514b21799f7d",
                    type: BridgeType.NativeHome,
                },
                remote: {
                    chainId: teschain.id,
                    address: "0x4730d16278c5bfb6f4326b8d2d2a9b3ad3fef098",
                    type: BridgeType.Erc20Remote,
                },
                provider: BridgeProvider.ICTT,
            },
        ],
    },
    {
        id: "coq",
        symbol: "COQ",
        name: "COQ",
        decimals: 18,
        icon: "coq.png",
        iconBackground: "#fdcd5e",
        chains: {
            [avalanche.id]: {
                address: "0x420FcA0121DC28039145009570975747295f2329",
            },
            [plyrTau.id]: {
                address: "0x9b7ecaBE00D41eF37434975db8Fb7323dd596F1c",
            },
            [coqnet.id]: {
                address: zeroAddress,
                isNative: true,
                wrappedAddress: "0x2c76Ab64981E1d4304fC064a7dC3Be4aA3266c98",
                wrappedToken: "WCOQ",
            },
            [coqnetFuji.id]: {
                address: zeroAddress,
                isNative: true,
            }
        },
        bridges: [
            {
                home: {
                    chainId: avalanche.id,
                    address: "0x7D5041b9e8F144b2b3377A722dF5DD6eaF447cF2",
                    type: BridgeType.Erc20Home,
                },
                remote: {
                    chainId: coqnet.id,
                    address: "0x2c76Ab64981E1d4304fC064a7dC3Be4aA3266c98",
                    type: BridgeType.NativeRemote,
                },
                provider: BridgeProvider.ICTT,
            },
        ],
    },
    {
        id: "dexalot-btcb",
        symbol: "BTC.b",
        name: "Dexalot BTC.b",
        decimals: 8,
        icon: "btcb.png",
        iconBackground: "#2775ca",
        chains: {
            [avalancheFuji.id]: {
                address: "0x5AAD791Bafde4fC3f2B60195b8C51820087Ff6FF",
                apiData: {
                    [ApiProvider.Dexalot]: {
                        id: "BTC.b",
                    },
                },
            },
        },
    },
    {
        id: "dexalot-usdc",
        symbol: "USDC",
        name: "Dexalot USDC",
        decimals: 6,
        icon: "usdc.png",
        iconBackground: "#2775ca",
        chains: {
            [avalancheFuji.id]: {
                address: "0x68B773B8C10F2ACE8aC51980A1548B6B48a2eC54",
                apiData: {
                    [ApiProvider.Dexalot]: {
                        id: "USDC",
                    },
                },
            },
        },
    },
    {
        id: "dexalot-usdt",
        symbol: "USDt",
        name: "Dexalot USDt",
        decimals: 6,
        icon: "usdt.svg",
        iconBackground: "#2775ca",
        chains: {
            [avalancheFuji.id]: {
                address: "0x24236E8319504A663431EF23F810b6Fa723859c4",
                apiData: {
                    [ApiProvider.Dexalot]: {
                        id: "USDt",
                    },
                },
            },
        },
    },
    {
        id: "gamr",
        symbol: "GAMR",
        name: "GAMR",
        decimals: 18,
        icon: "gamr.png",
        iconBackground: "#00cccc",
        chains: {
            [plyrTau.id]: {
                address: "0xa875625fe8A955406523E52E485f351b92908ce1",
            },
        },
    },
    {
        id: "gmtes",
        symbol: "gmTES",
        name: "gmTES",
        decimals: 18,
        icon: "tes.png",
        iconBackground: "#8258A2",
        chains: {
            [teschain.id]: {
                address: "0x54CE76b0839BF362aA04073321932d06c2Bf91dA",
            },
        },
    },
    {
        id: "plyr",
        symbol: "PLYR",
        name: "Native PLYR",
        decimals: 18,
        icon: "plyr.png",
        iconBackground: "#ff6600",
        chains: {
            [avalancheFuji.id]: {
                displayName: "PLYR",
                address: "0x8A0E57eBd39F3e9b883200B0C8daFd9117Aa8A74",
            },
            [plyrTau.id]: {
                address: zeroAddress,
                isNative: true,
                wrappedAddress: "0xAAAaBe49A72EcF0804292CE8e889016d9D05767c",
                wrappedToken: "wPLYR",
            },
        },
        bridges: [
            {
                home: {
                    chainId: plyrTau.id,
                    address: "0xeD92B6AAb57743479c94B16855E187dBB5c66AC9",
                    type: BridgeType.NativeHome,
                },
                remote: {
                    chainId: avalancheFuji.id,
                    address: "0x8A0E57eBd39F3e9b883200B0C8daFd9117Aa8A74",
                    type: BridgeType.Erc20Remote,
                },
                provider: BridgeProvider.ICTT,
            }
        ],
    },
    {
        id: "tes",
        symbol: "TES",
        name: "Native TES",
        decimals: 18,
        icon: "tes.png",
        iconBackground: "#8258A2",
        chains: {
            [avalancheFuji.id]: {
                displayName: "TES",
                address: "0x43419000a94a21d1d0214ed2a6bfc3f05058f9ce",
            },
            [teschain.id]: {
                address: zeroAddress,
                isNative: true,
                wrappedAddress: "0x00af5f49a934dd2f0e2fe5fa1f9d23d200da7f82",
                wrappedToken: "wTES",
            },
        },
        bridges: [
            {
                home: {
                    chainId: teschain.id,
                    address: "0x65af4a715712d7ca14ebf1082c27d16b33e1e171",
                    type: BridgeType.NativeHome,
                },
                remote: {
                    chainId: avalancheFuji.id,
                    address: "0x43419000a94a21d1d0214ed2a6bfc3f05058f9ce",
                    type: BridgeType.Erc20Remote,
                },
                provider: BridgeProvider.ICTT,
            }
        ],
    },
    {
        id: "usdc",
        symbol: "USDC",
        name: "Native USDC",
        decimals: 6,
        icon: "usdc.png",
        iconBackground: "#2775ca",
        chains: {
            [avalanche.id]: {
                address: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
            },
            [avalancheFuji.id]: {
                address: "0x5425890298aed601595a70AB815c96711a31Bc65",
            },
            [coqnet.id]: {
                displayName: "USDC",
                address: "0x00396774d1E5b1C2B175B0F0562f921887678771",
            },
            [teschain.id]: {
                displayName: "USDC",
                address: "0xc4726bee045a2e0d447a8b1acb088da03bf1a5dd",
            },
        },
        bridges: [
            {
                home: {
                    chainId: avalanche.id,
                    address: "0x97bBA61F61f2b0eEF60428947b990457f8eCb3a3",
                    type: BridgeType.Erc20Home,
                },
                remote: {
                    chainId: coqnet.id,
                    address: "0x00396774d1E5b1C2B175B0F0562f921887678771",
                    type: BridgeType.Erc20Remote,
                },
                provider: BridgeProvider.ICTT,
            },
            {
                home: {
                    chainId: avalancheFuji.id,
                    address: "0x00ba05e110e333243bb0e68b64f28166059ff7ce",
                    type: BridgeType.Erc20Home,
                },
                remote: {
                    chainId: teschain.id,
                    address: "0xc4726bee045a2e0d447a8b1acb088da03bf1a5dd",
                    type: BridgeType.Erc20Remote,
                },
                provider: BridgeProvider.ICTT,
            },
        ],
    },
] as const

export const Tokens: Token[] = Object.values(SupportedChains).filter((chain) => !chain.isDisabled).map((chain) => {
    return baseTokens.filter((baseToken) => baseToken.chains[chain.id] !== undefined).map((baseToken) => {

        const chainData = baseToken.chains[chain.id]!
        const filterData: TokenFilterData = {
            symbol: (chainData.displaySymbol ?? baseToken.symbol).toLowerCase(),
            name: (chainData.displayName ?? baseToken.name).toLowerCase(),
            address: chainData.address.toLowerCase(),
            chain: chain.name.toLowerCase(),
            chainId: chain.id.toString(),
        } as TokenFilterData

        return {
            ...chainData,
            id: baseToken.id,
            symbol: chainData.displaySymbol ?? baseToken.symbol,
            name: chainData.displayName ?? baseToken.name,
            decimals: baseToken.decimals,
            icon: chainData.displayIcon ?? baseToken.icon,
            chainId: chain.id,
            filters: filterData,
            iconBackground: chainData.displayIconBackground ?? baseToken.iconBackground,
            canBridge: baseToken.bridges?.some((bridge) => bridge.home.chainId === chain.id || bridge.remote.chainId === chain.id),
        } as Token

    })
}).flat()

export const DefaultTokenSortType = TokenSortType.BalanceValue

export const TokenBridgePaths: Record<TokenId, BridgePath[]> = {}
for (const baseToken of baseTokens) {

    if (!baseToken.bridges) {
        continue
    }

    const tokenPaths: BridgePath[] = []
    const bridgeTokens = Tokens.slice(0).filter((token) => token.canBridge)

    for (const bridge of baseToken.bridges) {

        const homeToken = bridgeTokens.find((token) => token.id === baseToken.id && token.chainId === bridge.home.chainId)
        const remoteToken = bridgeTokens.find((token) => token.id === baseToken.id && token.chainId === bridge.remote.chainId)
        if (!homeToken || !remoteToken) {
            continue
        }

        const pathFrom: BridgePath = {
            srcData: {
                ...bridge.home,
                token: homeToken,
            },
            dstData: {
                ...bridge.remote,
                token: remoteToken,
            },
            provider: bridge.provider,
        }
        tokenPaths.push(pathFrom)

        const pathTo: BridgePath = {
            srcData: {
                ...bridge.remote,
                token: remoteToken,
            },
            dstData: {
                ...bridge.home,
                token: homeToken,
            },
            provider: bridge.provider,
        }
        tokenPaths.push(pathTo)
    }

    TokenBridgePaths[baseToken.id] = tokenPaths
}
