import { getAddress, zeroAddress } from "viem"
import { avalanche, avalancheFuji } from "wagmi/chains"

import { coqnet, coqnetFuji, plyrPhi, plyrTau, SupportedChains, teschain } from "@/app/config/chains"
import { getTokenAddress, getTokenFilterData, getTokenUid } from "@/app/lib/tokens"
import { ApiProvider } from "@/app/types/apis"
import { BridgePath, BridgeProvider, BridgeType } from "@/app/types/bridges"
import { BaseToken, Token, TokenId } from "@/app/types/tokens"

const baseTokens: BaseToken[] = [

    // {
    //     id: "ami",
    //     symbol: "AMI",
    //     name: "AVAX Meme Index",
    //     decimals: 18,
    //     icon: "ami.png",
    //     chains: {
    //         [avalanche.id]: {
    //             address: "0xC139Aa91399600f6b72975AC3317b6d49Cb30a69",
    //         },
    //         [plyrPhi.id]: {
    //             address: "0x8D5dEadEEc6B9118313FFee8fe3dff788a40e4EA",
    //         },
    //     },
    //     bridges: [
    //         {
    //             home: {
    //                 chainId: avalanche.id,
    //                 address: "0xaABae47f41fee8f877c7F2641A306A01F7d8A2FA",
    //                 type: BridgeType.Erc20Home,
    //             },
    //             remote: {
    //                 chainId: plyrPhi.id,
    //                 address: "0x8D5dEadEEc6B9118313FFee8fe3dff788a40e4EA",
    //                 type: BridgeType.Erc20Remote,
    //             },
    //             provider: BridgeProvider.ICTT,
    //         },
    //     ],
    // },
    // {
    //     id: "apex",
    //     symbol: "APEX",
    //     name: "APEX",
    //     decimals: 18,
    //     icon: "apex.png",
    //     chains: {
    //         [avalanche.id]: {
    //             address: "0x98B172A09102869adD73116FC92A0A60BFF4778F",
    //         },
    //         [avalancheFuji.id]: {
    //             address: "0x2468a9B0fD297CA7411aF891b5C86A212fD2a519",
    //         },
    //         [plyrPhi.id]: {
    //             address: "0x612A487212710fCDc022935Ae5757FaCABD2881a",
    //         },
    //     },
    //     bridges: [
    //         {
    //             home: {
    //                 chainId: avalanche.id,
    //                 address: "0xbBac9D0c3f3D3B74fbB2a43acf218014a3614986",
    //                 type: BridgeType.Erc20Home,
    //             },
    //             remote: {
    //                 chainId: plyrPhi.id,
    //                 address: "0x612A487212710fCDc022935Ae5757FaCABD2881a",
    //                 type: BridgeType.Erc20Remote,
    //             },
    //             provider: BridgeProvider.ICTT,
    //         },
    //     ],
    // },
    // {
    //     id: "arena",
    //     symbol: "ARENA",
    //     name: "Arena",
    //     decimals: 18,
    //     icon: "arena.png",
    //     chains: {
    //         [avalanche.id]: {
    //             address: "0xB8d7710f7d8349A506b75dD184F05777c82dAd0C",
    //         },
    //         [plyrPhi.id]: {
    //             address: "0x3D1307f5C85D06B1C31253A12A87c1a83391d137",
    //         },
    //     },
    //     bridges: [
    //         {
    //             home: {
    //                 chainId: avalanche.id,
    //                 address: "0xD5bD19580DcA877B296cF9C41664C8Aa108Fe709",
    //                 type: BridgeType.Erc20Home,
    //             },
    //             remote: {
    //                 chainId: plyrPhi.id,
    //                 address: "0x3D1307f5C85D06B1C31253A12A87c1a83391d137",
    //                 type: BridgeType.Erc20Remote,
    //             },
    //             provider: BridgeProvider.ICTT,
    //         },
    //     ],
    // },
    // {
    //     id: "avax",
    //     priceId: "avax",
    //     symbol: "AVAX",
    //     name: "Native AVAX",
    //     decimals: 18,
    //     icon: "avax.svg",
    //     chains: {
    //         [avalanche.id]: {
    //             address: zeroAddress,
    //             apiData: {
    //                 [ApiProvider.Dexalot]: {
    //                     id: "AVAX",
    //                 },
    //             },
    //             isNative: true,
    //             wrappedAddress: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
    //             wrappedToken: "WAVAX",
    //         },
    //         [avalancheFuji.id]: {
    //             address: zeroAddress,
    //             apiData: {
    //                 [ApiProvider.Dexalot]: {
    //                     id: "AVAX",
    //                 },
    //             },
    //             isNative: true,
    //             wrappedAddress: "0xd00ae08403B9bbb9124bB305C09058E32C39A48c",
    //             wrappedToken: "WAVAX",
    //         },
    //         [teschain.id]: {
    //             displayName: "AVAX",
    //             address: "0x4730d16278c5bfb6f4326b8d2d2a9b3ad3fef098",
    //         },
    //         [coqnet.id]: {
    //             displayName: "AVAX",
    //             address: "0x28af629a9f3ece3c8d9f0b7ccf6349708cec8cfb",
    //         },
    //         [plyrPhi.id]: {
    //             displayName: "AVAX",
    //             address: "0x1D1c9Bc4EB65fF52402275a6e64A2773eBF3ed04",
    //         },
    //     },
    //     bridges: [
    //         {
    //             home: {
    //                 chainId: avalanche.id,
    //                 address: "0x30CdA6AF61c3A07ca81909699C85307DEF4398E5",
    //                 type: BridgeType.NativeHome,
    //             },
    //             remote: {
    //                 chainId: coqnet.id,
    //                 address: "0x28af629a9f3ece3c8d9f0b7ccf6349708cec8cfb",
    //                 type: BridgeType.Erc20Remote,
    //             },
    //             provider: BridgeProvider.ICTT,
    //         },
    //         {
    //             home: {
    //                 chainId: avalancheFuji.id,
    //                 address: "0xf37a2b936f214f9e72156ce5e340514b21799f7d",
    //                 type: BridgeType.NativeHome,
    //             },
    //             remote: {
    //                 chainId: teschain.id,
    //                 address: "0x4730d16278c5bfb6f4326b8d2d2a9b3ad3fef098",
    //                 type: BridgeType.Erc20Remote,
    //             },
    //             provider: BridgeProvider.ICTT,
    //         },
    //         {
    //             home: {
    //                 chainId: avalanche.id,
    //                 address: "0x4D9c836d404629Ab44ef92acDD7e167ea8d4BdD7",
    //                 type: BridgeType.NativeHome,
    //             },
    //             remote: {
    //                 chainId: plyrPhi.id,
    //                 address: "0x1D1c9Bc4EB65fF52402275a6e64A2773eBF3ed04",
    //                 type: BridgeType.Erc20Remote,
    //             },
    //             provider: BridgeProvider.ICTT,
    //         },
    //     ],
    // },
    // {
    //     id: "big",
    //     symbol: "BIG",
    //     name: "Believe in Greatness",
    //     decimals: 18,
    //     icon: "big.png",
    //     chains: {
    //         [avalanche.id]: {
    //             address: "0x2d0aFed89a6D6A100273Db377dBA7a32C739E314",
    //         },
    //         [plyrPhi.id]: {
    //             address: "0x0eF4cF2298BA3dd3840B96561749826B05D386Aa",
    //         },
    //     },
    //     bridges: [
    //         {
    //             home: {
    //                 chainId: avalanche.id,
    //                 address: "0xab55a89Fb353546AbE5d965Fd2e1Ef72fcdff1ea",
    //                 type: BridgeType.Erc20Home,
    //             },
    //             remote: {
    //                 chainId: plyrPhi.id,
    //                 address: "0x0eF4cF2298BA3dd3840B96561749826B05D386Aa",
    //                 type: BridgeType.Erc20Remote,
    //             },
    //             provider: BridgeProvider.ICTT,
    //         },
    //     ],
    // },
    // {
    //     id: "bls",
    //     symbol: "BLS",
    //     name: "BloodLoop Shard",
    //     decimals: 18,
    //     icon: "bls.png",
    //     chains: {
    //         [avalanche.id]: {
    //             address: "0x46B9144771Cb3195D66e4EDA643a7493fADCAF9D",
    //         },
    //         [plyrPhi.id]: {
    //             address: "0xa28028081804b05fe8e7B3b78dD5dAF2A0488DB4",
    //         },
    //     },
    //     bridges: [
    //         {
    //             home: {
    //                 chainId: avalanche.id,
    //                 address: "0xBcc8965B645B0AD73399D4DC0eEB3876D3714614",
    //                 type: BridgeType.Erc20Home,
    //             },
    //             remote: {
    //                 chainId: plyrPhi.id,
    //                 address: "0xa28028081804b05fe8e7B3b78dD5dAF2A0488DB4",
    //                 type: BridgeType.Erc20Remote,
    //             },
    //             provider: BridgeProvider.ICTT,
    //         },
    //     ],
    // },
    // {
    //     id: "blub",
    //     symbol: "BLUB",
    //     name: "Blub",
    //     decimals: 18,
    //     icon: "blub.png",
    //     chains: {
    //         [avalanche.id]: {
    //             address: "0x0f669808d88B2b0b3D23214DCD2a1cc6A8B1B5cd",
    //         },
    //         [plyrPhi.id]: {
    //             address: "0x528B5C9f4a401B230F6e15014522e1b60a15f342",
    //         },
    //     },
    //     bridges: [
    //         {
    //             home: {
    //                 chainId: avalanche.id,
    //                 address: "0x2EFA08d8643f341e5FDf03C04389cAab595dF64b",
    //                 type: BridgeType.Erc20Home,
    //             },
    //             remote: {
    //                 chainId: plyrPhi.id,
    //                 address: "0x528B5C9f4a401B230F6e15014522e1b60a15f342",
    //                 type: BridgeType.Erc20Remote,
    //             },
    //             provider: BridgeProvider.ICTT,
    //         },
    //     ],
    // },
    // {
    //     id: "btcb",
    //     priceId: "btc.avax",
    //     symbol: "BTC.b",
    //     name: "Bitcoin",
    //     decimals: 8,
    //     icon: "btcb.png",
    //     chains: {
    //         [avalanche.id]: {
    //             address: "0x152b9d0FdC40C096757F570A51E494bd4b943E50",
    //             apiData: {
    //                 [ApiProvider.Dexalot]: {
    //                     id: "BTC.b",
    //                 },
    //             },
    //         },
    //         [plyrPhi.id]: {
    //             address: "0xF7Df8Ea81caEE397B15c84763F23343977652a11",
    //         },
    //     },
    //     bridges: [
    //         {
    //             home: {
    //                 chainId: avalanche.id,
    //                 address: "0x799B0c114707b731a868b54403c2C7DC3f648f73",
    //                 type: BridgeType.Erc20Home,
    //             },
    //             remote: {
    //                 chainId: plyrPhi.id,
    //                 address: "0xF7Df8Ea81caEE397B15c84763F23343977652a11",
    //                 type: BridgeType.Erc20Remote,
    //             },
    //             provider: BridgeProvider.ICTT,
    //         },
    //     ],
    // },
    
    // {
    //     id: "coq",
    //     priceId: "coq",
    //     symbol: "COQ",
    //     name: "COQ",
    //     decimals: 18,
    //     icon: "coq.png",
    //     chains: {
    //         [avalanche.id]: {
    //             address: "0x420FcA0121DC28039145009570975747295f2329",
    //             apiData: {
    //                 [ApiProvider.Dexalot]: {
    //                     id: "COQ",
    //                 },
    //             },
    //         },
    //         [coqnet.id]: {
    //             address: zeroAddress,
    //             isNative: true,
    //             wrappedAddress: "0x2c76Ab64981E1d4304fC064a7dC3Be4aA3266c98",
    //             wrappedToken: "WCOQ",
    //         },
    //         [coqnetFuji.id]: {
    //             address: zeroAddress,
    //             isNative: true,
    //         },
    //         [plyrPhi.id]: {
    //             address: "0x17563c474A5c3FfD51808FDcdDe3457b6dc38932",
    //         },
    //         [plyrTau.id]: {
    //             address: "0x9b7ecaBE00D41eF37434975db8Fb7323dd596F1c",
    //         },
    //     },
    //     bridges: [
    //         {
    //             home: {
    //                 chainId: avalanche.id,
    //                 address: "0x7D5041b9e8F144b2b3377A722dF5DD6eaF447cF2",
    //                 type: BridgeType.Erc20Home,
    //             },
    //             remote: {
    //                 chainId: coqnet.id,
    //                 address: "0x2c76Ab64981E1d4304fC064a7dC3Be4aA3266c98",
    //                 type: BridgeType.NativeRemote,
    //             },
    //             provider: BridgeProvider.ICTT,
    //         },
    //         {
    //             home: {
    //                 chainId: avalanche.id,
    //                 address: "0x5b4Efb72e4e96485a5f8a24a9FE9758162c711B0",
    //                 type: BridgeType.Erc20Home,
    //             },
    //             remote: {
    //                 chainId: plyrPhi.id,
    //                 address: "0x17563c474A5c3FfD51808FDcdDe3457b6dc38932",
    //                 type: BridgeType.Erc20Remote,
    //             },
    //             provider: BridgeProvider.ICTT,
    //         },
    //     ],
    // },
    
    
    {
        id: "gamr",
        priceId: "gamr",
        symbol: "GAMR",
        name: "GAMR",
        decimals: 18,
        icon: "gamr.png",
        chains: {
            [plyrPhi.id]: {
                address: "0x413F1a8F0A2Bd9b6D31B2CA91c4aa7bC08266731",
            },
            [plyrTau.id]: {
                address: "0xa875625fe8A955406523E52E485f351b92908ce1",
            },
        },
        bridges: [
            {
                home: {
                    chainId: plyrPhi.id,
                    address: "0xaAb8E58FAA03f882e8938823ED8200f3E48297bB",
                    type: BridgeType.Erc20Home,
                },
                remote: {
                    chainId: avalanche.id,
                    address: "0xEcB70d85aA4dAc4102688c313588710A3f143529",
                    type: BridgeType.Erc20Remote,
                },
                provider: BridgeProvider.ICTT,
            },
        ],
    },
    
    // {
    //     id: "joe",
    //     symbol: "JOE",
    //     name: "JOE",
    //     decimals: 18,
    //     icon: "joe.png",
    //     chains: {
    //         [avalanche.id]: {
    //             address: "0x6e84a6216eA6dACC71eE8E6b0a5B7322EEbC0fDd",
    //         },
    //         [plyrPhi.id]: {
    //             address: "0xef40C286c6D7c90C19ffcEb54d8C225DAa554C3F",
    //         },
    //     },
    //     bridges: [
    //         {
    //             home: {
    //                 chainId: avalanche.id,
    //                 address: "0x624d0e724fc3eDACd82aE747DF526Cd21f41EbC2",
    //                 type: BridgeType.Erc20Home,
    //             },
    //             remote: {
    //                 chainId: plyrPhi.id,
    //                 address: "0xef40C286c6D7c90C19ffcEb54d8C225DAa554C3F",
    //                 type: BridgeType.Erc20Remote,
    //             },
    //             provider: BridgeProvider.ICTT,
    //         },
    //     ],
    // },
    // {
    //     id: "ket",
    //     symbol: "KET",
    //     name: "yellow ket",
    //     decimals: 18,
    //     icon: "ket.png",
    //     chains: {
    //         [avalanche.id]: {
    //             address: "0xFFFF003a6BAD9b743d658048742935fFFE2b6ED7",
    //         },
    //         [plyrPhi.id]: {
    //             address: "0x78DE1332ef4775811fff5000D5A9eBF70a665B5b",
    //         },
    //     },
    //     bridges: [
    //         {
    //             home: {
    //                 chainId: avalanche.id,
    //                 address: "0xB699674870e2cf583f51C63Be29DA9F113ce6B3B",
    //                 type: BridgeType.Erc20Home,
    //             },
    //             remote: {
    //                 chainId: plyrPhi.id,
    //                 address: "0x78DE1332ef4775811fff5000D5A9eBF70a665B5b",
    //                 type: BridgeType.Erc20Remote,
    //             },
    //             provider: BridgeProvider.ICTT,
    //         },
    //     ],
    // },
    // {
    //     id: "kimbo",
    //     symbol: "KIMBO",
    //     name: "Kimbo",
    //     decimals: 18,
    //     icon: "kimbo.png",
    //     chains: {
    //         [avalanche.id]: {
    //             address: "0x184ff13B3EBCB25Be44e860163A5D8391Dd568c1",
    //         },
    //         [plyrPhi.id]: {
    //             address: "0xcEf949Aaf9a0d91892eb452FB03914F40eAc16dd",
    //         },
    //     },
    //     bridges: [
    //         {
    //             home: {
    //                 chainId: avalanche.id,
    //                 address: "0x1E0516f22a5a26C3C7Bf646d8D8F4129E858AA79",
    //                 type: BridgeType.Erc20Home,
    //             },
    //             remote: {
    //                 chainId: plyrPhi.id,
    //                 address: "0xcEf949Aaf9a0d91892eb452FB03914F40eAc16dd",
    //                 type: BridgeType.Erc20Remote,
    //             },
    //             provider: BridgeProvider.ICTT,
    //         },
    //     ],
    // },
    
    {
        id: "plyr",
        priceId: "plyr",
        symbol: "PLYR",
        name: "Native PLYR",
        decimals: 18,
        icon: "plyr.png",
        chains: {
            [avalanche.id]: {
                displayName: "PLYR",
                address: "0xC09a033927f9fD558C92CF7AeAbE34B71ce4B31E",
            },
            [avalancheFuji.id]: {
                displayName: "PLYR",
                address: "0x8A0E57eBd39F3e9b883200B0C8daFd9117Aa8A74",
            },
            [plyrPhi.id]: {
                address: zeroAddress,
                isNative: true,
                wrappedAddress: "0xAAAaBe49A72EcF0804292CE8e889016d9D05767c",
                wrappedToken: "wPLYR",
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
            },
            {
                home: {
                    chainId: plyrPhi.id,
                    address: "0x8fa3B51e876CE26eA43c6d0Cf886050bF580118e",
                    type: BridgeType.NativeHome,
                },
                remote: {
                    chainId: avalanche.id,
                    address: "0xC09a033927f9fD558C92CF7AeAbE34B71ce4B31E",
                    type: BridgeType.Erc20Remote,
                },
                provider: BridgeProvider.ICTT,
            },
        ],
    },
    
    {
        id: "usdc",
        priceId: "usdc.avax",
        symbol: "USDC",
        name: "Native USDC",
        decimals: 6,
        icon: "usdc.svg",
        chains: {
            [avalanche.id]: {
                address: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
                apiData: {
                    [ApiProvider.Dexalot]: {
                        id: "USDC",
                    },
                },
            },
            [avalancheFuji.id]: {
                address: "0x5425890298aed601595a70AB815c96711a31Bc65",
            },
            [coqnet.id]: {
                displayName: "USDC",
                address: "0x00396774d1E5b1C2B175B0F0562f921887678771",
            },
            [plyrPhi.id]: {
                displayName: "USDC",
                address: "0x63F551298862f306B689724519D95eDA3dCDE5b8",
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
            {
                home: {
                    chainId: avalanche.id,
                    address: "0x3EC673E78355bF2470b6d6DAE2555E2Beb74C5A8",
                    type: BridgeType.Erc20Home,
                },
                remote: {
                    chainId: plyrPhi.id,
                    address: "0x63F551298862f306B689724519D95eDA3dCDE5b8",
                    type: BridgeType.Erc20Remote,
                },
                provider: BridgeProvider.ICTT,
            },
        ],
    },
    
    // {
    //     id: "wink",
    //     symbol: "WINK",
    //     name: "Wink",
    //     decimals: 18,
    //     icon: "wink.png",
    //     chains: {
    //         [avalanche.id]: {
    //             address: "0x7698A5311DA174A95253Ce86C21ca7272b9B05f8",
    //             apiData: {
    //                 [ApiProvider.Dexalot]: {
    //                     id: "WINK",
    //                 },
    //             },
    //         },
    //         [plyrPhi.id]: {
    //             address: "0x3433DC3a55D9C77315CD939AD775000D31F426D5",
    //         },
    //     },
    //     bridges: [
    //         {
    //             home: {
    //                 chainId: avalanche.id,
    //                 address: "0xB42F326F8A352B85fE5b5B0889348EcA1cE6BcF0",
    //                 type: BridgeType.Erc20Home,
    //             },
    //             remote: {
    //                 chainId: plyrPhi.id,
    //                 address: "0x3433DC3a55D9C77315CD939AD775000D31F426D5",
    //                 type: BridgeType.Erc20Remote,
    //             },
    //             provider: BridgeProvider.ICTT,
    //         },
    //     ],
    // },
    
] as const

export const Tokens: Token[] = Object.values(SupportedChains).filter((chain) => !chain.isDisabled).map((chain) => baseTokens.filter((baseToken) => !!baseToken.chains[chain.id]).map((baseToken) => {

    const chainData = baseToken.chains[chain.id]!
    const address = getAddress(chainData.address)
    const useAddress = getTokenAddress(chainData)

    return {
        ...chainData,
        id: baseToken.id,
        priceId: chainData.priceId || baseToken.priceId,
        uid: getTokenUid(chain.id, useAddress),
        symbol: chainData.displaySymbol ?? baseToken.symbol,
        name: chainData.displayName ?? baseToken.name,
        decimals: baseToken.decimals,
        address: address,
        chainId: chain.id,
        filters: getTokenFilterData({
            name: chainData.displayName ?? baseToken.name,
            symbol: chainData.displaySymbol ?? baseToken.symbol,
            address: useAddress,
        }),
        icon: chainData.displayIcon ?? baseToken.icon,
        canBridge: baseToken.bridges?.some((bridge) => bridge.home.chainId === chain.id || bridge.remote.chainId === chain.id),
        isCustomToken: false,
        isUnconfirmed: false,
    }
})).flat()

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