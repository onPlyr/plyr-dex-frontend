import { zeroAddress } from "viem"
import { avalancheFuji } from "wagmi/chains"

import { plyrTau, SupportedChains, teschain } from "@/app/config/chains"
import { BaseToken, Token, TokenBridgeType, TokenFilterData, TokenSortType } from "@/app/types/tokens"

const baseTokens: BaseToken[] = [
    // {
    //     id: "alot",
    //     symbol: "ALOT",
    //     name: "Dexalot ",
    //     decimals: 18,
    //     icon: "alot.png",
    //     iconBackground: "#f6006b",
    //     chains: {
    //         [avalancheFuji.id]: {
    //             address: "0x9983F755Bbd60d1886CbfE103c98C272AA0F03d6",
    //         },
    //     },
    // },
    // {
    //     id: "apex",
    //     symbol: "APEX",
    //     name: "APEX ",
    //     decimals: 18,
    //     icon: "apex.png",
    //     iconBackground: "#2979ff",
    //     chains: {
    //         [avalancheFuji.id]: {
    //             address: "0x2468a9B0fD297CA7411aF891b5C86A212fD2a519",
    //         },
    //     },
    // },
    {
        id: "avax",
        symbol: "AVAX",
        name: "Native AVAX",
        decimals: 18,
        icon: "avax.png",
        iconBackground: "#ff394a",
        chains: {
            [avalancheFuji.id]: {
                address: zeroAddress,
                bridges: {
                    [teschain.id]: {
                        address: "0xf37a2b936f214f9e72156ce5e340514b21799f7d",
                        type: TokenBridgeType.NativeHome,
                    },
                },
                isNative: true,
                wrappedAddress: "0xd00ae08403B9bbb9124bB305C09058E32C39A48c",
                wrappedToken: "WAVAX",
            },
            // [teschain.id]: {
            //     address: "0x4730d16278c5bfb6f4326b8d2d2a9b3ad3fef098",
            //     bridges: {
            //         [avalancheFuji.id]: {
            //             address: "0x4730d16278c5bfb6f4326b8d2d2a9b3ad3fef098",
            //             type: TokenBridgeType.Erc20Remote,
            //         },
            //     },
            // },
        },
    },
    {
        id: "coq",
        symbol: "COQ",
        name: "COQ",
        decimals: 18,
        icon: "coq.png",
        iconBackground: "#fdcd5e",
        chains: {
            [plyrTau.id]: {
                chainSymbol: "MCOQ",
                address: "0x9b7ecaBE00D41eF37434975db8Fb7323dd596F1c",
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
        id: "super",
        symbol: "SUPER",
        name: "SUPER",
        decimals: 18,
        icon: `super.png`,
        iconBackground: "#00cccc",
        chains: {
            [plyrTau.id]: {
                chainSymbol: "MSUPER",
                address: "0xa79F25CBfe32f5f29F4Ca96aAe67acD49D65655f",
            },
        },
    },
    
    {
        id: "tusdc",
        symbol: "tUSDC",
        name: "tUSDC",
        decimals: 18,
        icon: `usdc.png`,
        iconBackground: "#2775ca",
        chains: {
            [plyrTau.id]: {
                chainSymbol: "tUSDC",
                address: "0xA69E8C5aFC0A4633d3d84d6C360998354c4C692C",
            },
        },
    },
    // {
    //     id: "gmtes",
    //     symbol: "gmTES",
    //     name: "gmTES",
    //     decimals: 18,
    //     icon: "tes.png",
    //     iconBackground: "#8258A2",
    //     chains: {
    //         [teschain.id]: {
    //             address: "0x54CE76b0839BF362aA04073321932d06c2Bf91dA",
    //         },
    //     },
    // },
    {
        id: "plyr",
        symbol: "PLYR",
        name: "Native PLYR",
        decimals: 18,
        icon: "plyr.png",
        iconBackground: "#ff6600",
        chains: {
            [plyrTau.id]: {
                address: zeroAddress,
                bridges: {
                    [avalancheFuji.id]: {
                        address: "0xeD92B6AAb57743479c94B16855E187dBB5c66AC9",
                        type: TokenBridgeType.NativeHome,
                    },
                },
                isNative: true,
                wrappedAddress: "0xAAAaBe49A72EcF0804292CE8e889016d9D05767c",
                wrappedToken: "wPLYR",
            },
            [avalancheFuji.id]: {
                address: "0x8A0E57eBd39F3e9b883200B0C8daFd9117Aa8A74",
                bridges: {
                    [plyrTau.id]: {
                        address: "0x8A0E57eBd39F3e9b883200B0C8daFd9117Aa8A74",
                        type: TokenBridgeType.Erc20Remote,
                    },
                },
            },
        },
    },
    // {
    //     id: "tes",
    //     symbol: "TES",
    //     name: "Native TES",
    //     decimals: 18,
    //     icon: "tes.png",
    //     iconBackground: "#8258A2",
    //     chains: {
    //         [avalancheFuji.id]: {
    //             chainName: "Wrapped TES",
    //             address: "0x43419000a94a21d1d0214ed2a6bfc3f05058f9ce",
    //             bridges: {
    //                 [teschain.id]: {
    //                     address: "0x43419000a94a21d1d0214ed2a6bfc3f05058f9ce",
    //                     type: TokenBridgeType.Erc20Remote,
    //                 },
    //             },
    //         },
    //         [teschain.id]: {
    //             address: zeroAddress,
    //             bridges: {
    //                 [avalancheFuji.id]: {
    //                     address: "0x65af4a715712d7ca14ebf1082c27d16b33e1e171",
    //                     type: TokenBridgeType.NativeHome,
    //                 },
    //             },
    //             isNative: true,
    //             wrappedAddress: "0x00af5f49a934dd2f0e2fe5fa1f9d23d200da7f82",
    //             wrappedToken: "wTES",
    //         },
    //     },
    // },
    {
        id: "usdc",
        symbol: "USDC",
        name: "Native USDC",
        decimals: 6,
        icon: "usdc.png",
        iconBackground: "#2775ca",
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
            // [teschain.id]: {
            //     address: "0xc4726bee045a2e0d447a8b1acb088da03bf1a5dd",
            //     bridges: {
            //         [avalancheFuji.id]: {
            //             address: "0xc4726bee045a2e0d447a8b1acb088da03bf1a5dd",
            //             type: TokenBridgeType.Erc20Remote,
            //         },
            //     },
            // },
        },
    },
    {
        id: "wavax",
        symbol: "WAVAX",
        name: "Wrapped AVAX",
        decimals: 18,
        icon: "wavax.png",
        iconBackground: "#ffffff",
        chains: {
            [avalancheFuji.id]: {
                address: "0xd00ae08403B9bbb9124bB305C09058E32C39A48c",
                bridges: {
                    [teschain.id]: {
                        address: "0xf37a2b936f214f9e72156ce5e340514b21799f7d",
                        type: TokenBridgeType.NativeHome,
                    },
                },
                isHidden: true,
            },
            // [teschain.id]: {
            //     address: "0x4730d16278c5bfb6f4326b8d2d2a9b3ad3fef098",
            //     bridges: {
            //         [avalancheFuji.id]: {
            //             address: "0x4730d16278c5bfb6f4326b8d2d2a9b3ad3fef098",
            //             type: TokenBridgeType.Erc20Remote,
            //         },
            //     },
            // },
        },
    },
    // {
    //     id: "wplyr",
    //     symbol: "wPLYR",
    //     name: "Wrapped PLYR",
    //     decimals: 18,
    //     icon: "wplyr.png",
    //     iconBackground: "#ff6600",
    //     chains: {
    //         // [avalancheFuji.id]: {
    //         //     address: "0x8A0E57eBd39F3e9b883200B0C8daFd9117Aa8A74",
    //         //     bridges: {
    //         //         [plyrTau.id]: {
    //         //             address: "0x8A0E57eBd39F3e9b883200B0C8daFd9117Aa8A74",
    //         //             type: TokenBridgeType.Erc20Remote,
    //         //         },
    //         //     },
    //         // },
    //         [plyrTau.id]: {
    //             address: "0xAAAaBe49A72EcF0804292CE8e889016d9D05767c",
    //             bridges: {
    //                 [avalancheFuji.id]: {
    //                     address: "0xeD92B6AAb57743479c94B16855E187dBB5c66AC9",
    //                     type: TokenBridgeType.NativeHome,
    //                 },
    //             },
    //             isHidden: true,
    //         },
    //     },
    // },
    // {
    //     id: "wtes",
    //     symbol: "wTES",
    //     name: "Wrapped TES",
    //     decimals: 18,
    //     icon: "wtes.png",
    //     iconBackground: "#ffffff",
    //     chains: {
    //         // [avalancheFuji.id]: {
    //         //     address: "0x43419000a94a21d1d0214ed2a6bfc3f05058f9ce",
    //         //     bridges: {
    //         //         [teschain.id]: {
    //         //             address: "0x43419000a94a21d1d0214ed2a6bfc3f05058f9ce",
    //         //             type: TokenBridgeType.Erc20Remote,
    //         //         },
    //         //     },
    //         // },
    //         [teschain.id]: {
    //             address: "0x00af5f49a934dd2f0e2fe5fa1f9d23d200da7f82",
    //             bridges: {
    //                 [avalancheFuji.id]: {
    //                     address: "0x65af4a715712d7ca14ebf1082c27d16b33e1e171",
    //                     type: TokenBridgeType.NativeHome,
    //                 },
    //             },
    //             isHidden: true,
    //         },
    //     },
    // },
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
            symbol: chainData.chainSymbol ?? baseToken.symbol,
            name: chainData.chainName ?? baseToken.name,
            decimals: baseToken.decimals,
            icon: chainData.chainIcon ?? baseToken.icon,
            chainId: chain.id,
            filters: filterData,
            iconBackground: chainData.chainIconBackground ?? baseToken.iconBackground,
        } as Token

    })
}).flat()

export const DefaultTokenSortType = TokenSortType.BalanceValue
