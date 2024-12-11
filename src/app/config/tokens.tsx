import { avalancheFuji } from "wagmi/chains"

import { plyrTau, SupportedChains, teschain } from "@/app/config/chains"
import { BaseToken, Token, TokenBridgeType, TokenFilterData, TokenSortType } from "@/app/types/tokens"

const baseTokens: BaseToken[] = [
    {
        id: "avax",
        symbol: "AVAX",
        name: "Native AVAX",
        decimals: 18,
        chains: {
            [avalancheFuji.id]: {
                address: "0x0000000000000000000000000000000000000000",
                bridges: {
                    [teschain.id]: {
                        address: "0xf37a2b936f214f9e72156ce5e340514b21799f7d",
                        type: TokenBridgeType.NativeHome,
                    },
                },
                isNative: true,
                wrappedToken: "wavax",
            },
        },
    },
    {
        id: "gamr",
        symbol: "GAMR",
        name: "GAMR",
        decimals: 18,
        chains: {
            [plyrTau.id]: {
                address: "0xa875625fe8A955406523E52E485f351b92908ce1",
            },
        },
    },
    {
        id: "coq",
        symbol: "MCOQ",
        name: "COQ",
        decimals: 18,
        chains: {
            [plyrTau.id]: {
                address: "0x9b7ecaBE00D41eF37434975db8Fb7323dd596F1c",
            },
        },
    },
    {
        id: "super",
        symbol: "MSUPER",
        name: "SUPER",
        decimals: 18,
        chains: {
            [plyrTau.id]: {
                address: "0xa79F25CBfe32f5f29F4Ca96aAe67acD49D65655f",
            },
        },
    },
    {
        id: "plyr",
        symbol: "PLYR",
        name: "Native PLYR",
        decimals: 18,
        chains: {
            [plyrTau.id]: {
                address: "0x0000000000000000000000000000000000000000",
                bridges: {
                    [avalancheFuji.id]: {
                        address: "0xeD92B6AAb57743479c94B16855E187dBB5c66AC9",
                        type: TokenBridgeType.NativeHome,
                    },
                },
                isNative: true,
                wrappedToken: "wplyr",
            },
        },
    },
    {
        id: "tes",
        symbol: "TES",
        name: "Native TES",
        decimals: 18,
        chains: {
            [teschain.id]: {
                address: "0x0000000000000000000000000000000000000000",
                bridges: {
                    [avalancheFuji.id]: {
                        address: "0x65af4a715712d7ca14ebf1082c27d16b33e1e171",
                        type: TokenBridgeType.NativeHome,
                    },
                },
                isNative: true,
                wrappedToken: "wtes",
            },
        },
    },
    {
        id: "usdc",
        symbol: "USDC",
        name: "Native USDC",
        decimals: 6,
        chains: {
            [avalancheFuji.id]: {
                address: "0x5425890298aed601595a70AB815c96711a31Bc65",
                bridges: {
                    [teschain.id]: {
                        address: "0x00ba05e110e333243bb0e68b64f28166059ff7ce",
                        type: TokenBridgeType.Erc20Home,
                    },
                },
            },
            [teschain.id]: {
                chainSymbol: "wUSDC",
                chainName: "USDC",
                address: "0xc4726bee045a2e0d447a8b1acb088da03bf1a5dd",
                bridges: {
                    [avalancheFuji.id]: {
                        address: "0xc4726bee045a2e0d447a8b1acb088da03bf1a5dd",
                        type: TokenBridgeType.Erc20Remote,
                    },
                },
            },
        },
    },
    {
        id: "wavax",
        symbol: "WAVAX",
        name: "Wrapped AVAX",
        decimals: 18,
        chains: {
            [avalancheFuji.id]: {
                address: "0xd00ae08403B9bbb9124bB305C09058E32C39A48c",
                bridges: {
                    [teschain.id]: {
                        address: "0xf37a2b936f214f9e72156ce5e340514b21799f7d",
                        type: TokenBridgeType.NativeHome,
                    },
                },
            },
            [teschain.id]: {
                address: "0x4730d16278c5bfb6f4326b8d2d2a9b3ad3fef098",
                bridges: {
                    [avalancheFuji.id]: {
                        address: "0x4730d16278c5bfb6f4326b8d2d2a9b3ad3fef098",
                        type: TokenBridgeType.Erc20Remote,
                    },
                },
            },
            [plyrTau.id]: {
                address: "0x008058f98b3351C72ea0C5f471E1bAe268f31c41",
            },
        },
    },
    {
        id: "wplyr",
        symbol: "wPLYR",
        name: "Wrapped PLYR",
        decimals: 18,
        chains: {
            [avalancheFuji.id]: {
                address: "0x8A0E57eBd39F3e9b883200B0C8daFd9117Aa8A74",
                bridges: {
                    [plyrTau.id]: {
                        address: "0x8A0E57eBd39F3e9b883200B0C8daFd9117Aa8A74",
                        type: TokenBridgeType.Erc20Remote,
                    },
                },
            },
            [plyrTau.id]: {
                address: "0xAAAaBe49A72EcF0804292CE8e889016d9D05767c",
                bridges: {
                    [avalancheFuji.id]: {
                        address: "0xeD92B6AAb57743479c94B16855E187dBB5c66AC9",
                        type: TokenBridgeType.NativeHome,
                    },
                },
            },
        },
    },
    {
        id: "wtes",
        symbol: "wTES",
        name: "Wrapped TES",
        decimals: 18,
        chains: {
            [avalancheFuji.id]: {
                address: "0x43419000a94a21d1d0214ed2a6bfc3f05058f9ce",
                bridges: {
                    [teschain.id]: {
                        address: "0x43419000a94a21d1d0214ed2a6bfc3f05058f9ce",
                        type: TokenBridgeType.Erc20Home,
                    },
                },
            },
            [teschain.id]: {
                address: "0x00af5f49a934dd2f0e2fe5fa1f9d23d200da7f82",
                bridges: {
                    [avalancheFuji.id]: {
                        address: "0x65af4a715712d7ca14ebf1082c27d16b33e1e171",
                        type: TokenBridgeType.NativeHome,
                    },
                },
            },
        },
    },
] as const

export const Tokens: Token[] = Object.values(SupportedChains).map((chain) => {
    return baseTokens.filter((baseToken) => baseToken.chains[chain.id] !== undefined).map((baseToken) => {

        const chainData = baseToken.chains[chain.id]!
        const filterData = {
            symbol: (chainData.chainSymbol ?? baseToken.symbol).toLowerCase(),
            name: (chainData.chainName ?? baseToken.name).toLowerCase(),
            address: chainData.address.toLowerCase(),
            chain: chain.name.toLowerCase(),
            chainId: chain.id.toString(),
        } as TokenFilterData

        return {
            ...chainData,
            id: baseToken.id,
            symbol: (chainData.chainSymbol ?? baseToken.symbol),
            name: (chainData.chainName ?? baseToken.name),
            decimals: baseToken.decimals,
            chainId: chain.id,
            filters: filterData,
        } as Token

    })
}).flat()


//console.log(Tokens)

export const DefaultTokenSortType = TokenSortType.BalanceValue
