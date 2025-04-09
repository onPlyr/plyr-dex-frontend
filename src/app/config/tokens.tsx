import { getAddress, zeroAddress } from "viem"
import { avalanche, avalancheFuji } from "wagmi/chains"

import { coqnet, coqnetFuji, plyrTau, SupportedChains, teschain } from "@/app/config/chains"
import { getTokenAddress, getTokenFilterData, getTokenUid } from "@/app/lib/tokens"
import { ApiProvider } from "@/app/types/apis"
import { BridgePath, BridgeProvider, BridgeType } from "@/app/types/bridges"
import { BaseToken, Token, TokenId } from "@/app/types/tokens"

const baseTokens: BaseToken[] = [
    {
        id: "aave",
        symbol: "AAVE.e",
        name: "Aave",
        decimals: 18,
        icon: "aave.svg",
        chains: {
            [avalanche.id]: {
                address: "0x63a72806098Bd3D9520cC43356dD78afe5D386D9",
            },
        },
    },
    {
        id: "abcphar",
        symbol: "abcPHAR",
        name: "abcPHAR",
        decimals: 18,
        icon: "abcphar.png",
        chains: {
            [avalanche.id]: {
                address: "0xd5d0A9b3f2C264b955Ae7161cfA6D38A7aEa60a7",
            },
        },
    },
    {
        id: "alot",
        priceId: "alot",
        symbol: "ALOT",
        name: "Dexalot ",
        decimals: 18,
        icon: "alot.png",
        chains: {
            [avalanche.id]: {
                address: "0x093783055F9047C2BfF99c4e414501F8A147bC69",
                apiData: {
                    [ApiProvider.Dexalot]: {
                        id: "ALOT",
                    },
                },
            },
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
        name: "APEX",
        decimals: 18,
        icon: "apex.png",
        chains: {
            [avalanche.id]: {
                address: "0x98B172A09102869adD73116FC92A0A60BFF4778F",
            },
            [avalancheFuji.id]: {
                address: "0x2468a9B0fD297CA7411aF891b5C86A212fD2a519",
            },
        },
    },
    {
        id: "arena",
        symbol: "ARENA",
        name: "Arena",
        decimals: 18,
        icon: "arena.png",
        chains: {
            [avalanche.id]: {
                address: "0xB8d7710f7d8349A506b75dD184F05777c82dAd0C",
            },
        },
    },
    {
        id: "art",
        symbol: "ART",
        name: "Salvor ART",
        decimals: 18,
        icon: "art.png",
        chains: {
            [avalanche.id]: {
                address: "0xF99516BC189AF00FF8EfFD5A1f2295B67d70a90e",
            },
        },
    },
    {
        id: "ausd",
        symbol: "AUSD",
        name: "Agora AUSD",
        decimals: 6,
        icon: "ausd.png",
        chains: {
            [avalanche.id]: {
                address: "0x00000000eFE302BEAA2b3e6e1b18d08D69a9012a",
            },
        },
    },
    {
        id: "ausd-sj",
        symbol: "aUSD",
        name: "StableJack aUSD",
        decimals: 18,
        icon: "ausd-sj.png",
        chains: {
            [avalanche.id]: {
                address: "0xaBe7a9dFDA35230ff60D1590a929aE0644c47DC1",
            },
        },
    },
    {
        id: "avax",
        priceId: "avax",
        symbol: "AVAX",
        name: "Native AVAX",
        decimals: 18,
        icon: "avax.svg",
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
        id: "avusd",
        symbol: "avUSD",
        name: "avUSD",
        decimals: 18,
        icon: "avusd.svg",
        chains: {
            [avalanche.id]: {
                address: "0x24dE8771bC5DdB3362Db529Fc3358F2df3A0E346",
            },
        },
    },
    {
        id: "beam",
        symbol: "BEAM",
        name: "Beam",
        decimals: 18,
        icon: "beam.svg",
        chains: {
            [avalanche.id]: {
                address: "0x62d0a8458ed7719fdaf978fe5929c6d342b0bfce",
            },
        },
    },
    {
        id: "blub",
        symbol: "BLUB",
        name: "Blub",
        decimals: 18,
        icon: "blub.png",
        chains: {
            [avalanche.id]: {
                address: "0x0f669808d88B2b0b3D23214DCD2a1cc6A8B1B5cd",
            },
        },
    },
    {
        id: "btcb",
        priceId: "btc.avax",
        symbol: "BTC.b",
        name: "Bitcoin",
        decimals: 8,
        icon: "btcb.png",
        chains: {
            [avalanche.id]: {
                address: "0x152b9d0FdC40C096757F570A51E494bd4b943E50",
                apiData: {
                    [ApiProvider.Dexalot]: {
                        id: "BTC.b",
                    },
                },
            },
        },
    },
    {
        id: "cai",
        symbol: "CAI",
        name: "CAI",
        decimals: 18,
        icon: "cai.svg",
        chains: {
            [avalanche.id]: {
                address: "0x48f88A3fE843ccb0b5003e70B4192c1d7448bEf0",
            },
        },
    },
    {
        id: "cly",
        symbol: "CLY",
        name: "Colony",
        decimals: 18,
        icon: "cly.svg",
        chains: {
            [avalanche.id]: {
                address: "0xec3492a2508DDf4FDc0cD76F31f340b30d1793e6",
            },
        },
    },
    {
        id: "coq",
        priceId: "coq",
        symbol: "COQ",
        name: "COQ",
        decimals: 18,
        icon: "coq.png",
        chains: {
            [avalanche.id]: {
                address: "0x420FcA0121DC28039145009570975747295f2329",
                apiData: {
                    [ApiProvider.Dexalot]: {
                        id: "COQ",
                    },
                },
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
        id: "dai",
        priceId: "dai.avax",
        symbol: "DAI.e",
        name: "DAI",
        decimals: 18,
        icon: "dai.svg",
        chains: {
            [avalanche.id]: {
                address: "0xd586E7F844cEa2F87f50152665BCbc2C279D8d70",
            },
        },
    },
    {
        id: "dexalot-btcb",
        priceId: "dexalot-btcb",
        symbol: "BTC.b",
        name: "Dexalot BTC.b",
        decimals: 8,
        icon: "btcb.png",
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
        priceId: "dexalot-usdc",
        symbol: "USDC",
        name: "Dexalot USDC",
        decimals: 6,
        icon: "usdc.svg",
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
        priceId: "dexalot-usdt",
        symbol: "USDt",
        name: "Dexalot USDt",
        decimals: 6,
        icon: "usdt.svg",
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
        id: "eurc",
        symbol: "EURC",
        name: "Euro Coin",
        decimals: 6,
        icon: "eurc.svg",
        chains: {
            [avalanche.id]: {
                address: "0xC891EB4cbdEFf6e073e859e987815Ed1505c2ACD",
                apiData: {
                    [ApiProvider.Dexalot]: {
                        id: "EURC",
                    },
                },
            },
        },
    },
    {
        id: "frax",
        symbol: "FRAX",
        name: "Frax",
        decimals: 18,
        icon: "frax.svg",
        chains: {
            [avalanche.id]: {
                address: "0xd24c2ad096400b6fbcd2ad8b24e7acbc21a1da64",
            },
        },
    },
    {
        id: "fxs",
        symbol: "FXS",
        name: "Frax Share",
        decimals: 18,
        icon: "fxs.svg",
        chains: {
            [avalanche.id]: {
                address: "0x214db107654ff987ad859f34125307783fc8e387",
            },
        },
    },
    {
        id: "gamr",
        symbol: "GAMR",
        name: "GAMR",
        decimals: 18,
        icon: "gamr.png",
        chains: {
            [plyrTau.id]: {
                address: "0xa875625fe8A955406523E52E485f351b92908ce1",
            },
        },
    },
    {
        id: "ggavax",
        symbol: "ggAVAX",
        name: "ggAVAX",
        decimals: 18,
        icon: "ggavax.svg",
        chains: {
            [avalanche.id]: {
                address: "0xA25EaF2906FA1a3a13EdAc9B9657108Af7B703e3",
            },
        },
    },
    {
        id: "ggp",
        symbol: "GGP",
        name: "GoGoPool",
        decimals: 18,
        icon: "ggp.svg",
        chains: {
            [avalanche.id]: {
                address: "0x69260B9483F9871ca57f81A90D91E2F96c2Cd11d",
            },
        },
    },
    {
        id: "gmtes",
        symbol: "gmTES",
        name: "gmTES",
        decimals: 18,
        icon: "tes.png",
        chains: {
            [teschain.id]: {
                address: "0x54CE76b0839BF362aA04073321932d06c2Bf91dA",
            },
        },
    },
    {
        id: "gmx",
        symbol: "GMX",
        name: "GMX",
        decimals: 18,
        icon: "gmx.svg",
        chains: {
            [avalanche.id]: {
                address: "0x62edc0692BD897D2295872a9FFCac5425011c661",
            },
        },
    },
    {
        id: "gun",
        symbol: "GUN",
        name: "GUNZ",
        decimals: 18,
        icon: "gun.png",
        chains: {
            [avalanche.id]: {
                address: "0x26deBD39D5eD069770406FCa10A0E4f8d2c743eB",
            },
        },
    },
    {
        id: "gyd",
        symbol: "GYD",
        name: "Gyro Dollar",
        decimals: 18,
        icon: "gyd.svg",
        chains: {
            [avalanche.id]: {
                address: "0xCA5d8F8a8d49439357d3CF46Ca2e720702F132b8",
            },
        },
    },
    {
        id: "husky",
        symbol: "HUSKY",
        name: "Husky",
        decimals: 18,
        icon: "husky.png",
        chains: {
            [avalanche.id]: {
                address: "0x65378b697853568da9ff8eab60c13e1ee9f4a654",
            },
        },
    },
    {
        id: "juicy",
        symbol: "JUICY",
        name: "Juicy",
        decimals: 18,
        icon: "juicy.png",
        chains: {
            [avalanche.id]: {
                address: "0xC654721fBf1F374fd9FfA3385Bba2F4932A6af55",
            },
        },
    },
    {
        id: "joe",
        symbol: "JOE",
        name: "JOE",
        decimals: 18,
        icon: "joe.png",
        chains: {
            [avalanche.id]: {
                address: "0x6e84a6216eA6dACC71eE8E6b0a5B7322EEbC0fDd",
            },
        },
    },
    {
        id: "ket",
        symbol: "KET",
        name: "yellow ket",
        decimals: 18,
        icon: "ket.png",
        chains: {
            [avalanche.id]: {
                address: "0xFFFF003a6BAD9b743d658048742935fFFE2b6ED7",
            },
        },
    },
    {
        id: "link",
        priceId: "link.avax",
        symbol: "LINK.e",
        name: "Chainlink",
        decimals: 18,
        icon: "link.svg",
        chains: {
            [avalanche.id]: {
                address: "0x5947BB275c521040051D82396192181b413227A3",
            },
        },
    },
    {
        id: "mim",
        symbol: "MIM",
        name: "Magic Internet Money",
        decimals: 18,
        icon: "mim.svg",
        chains: {
            [avalanche.id]: {
                address: "0x130966628846BFd36ff31a822705796e8cb8C18D",
            },
        },
    },
    {
        id: "nochill",
        symbol: "NOCHILL",
        name: "NOCHILL",
        decimals: 18,
        icon: "nochill.png",
        chains: {
            [avalanche.id]: {
                address: "0xAcFb898Cff266E53278cC0124fC2C7C94C8cB9a5",
            },
        },
    },
    {
        id: "phar",
        symbol: "PHAR",
        name: "Pharaoh",
        decimals: 18,
        icon: "phar.png",
        chains: {
            [avalanche.id]: {
                address: "0xAAAB9D12A30504559b0C5a9A5977fEE4A6081c6b",
            },
        },
    },
    {
        id: "plyr",
        symbol: "PLYR",
        name: "Native PLYR",
        decimals: 18,
        icon: "plyr.png",
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
        id: "png",
        symbol: "PNG",
        name: "Pangolin",
        decimals: 18,
        icon: "png.svg",
        chains: {
            [avalanche.id]: {
                address: "0x60781C2586D68229fde47564546784ab3fACA982",
            },
        },
    },
    {
        id: "prime",
        symbol: "PRIME",
        name: "DeltaPrime",
        decimals: 18,
        icon: "prime.svg",
        chains: {
            [avalanche.id]: {
                address: "0x33C8036E99082B0C395374832FECF70c42C7F298",
            },
        },
    },
    {
        id: "qi",
        symbol: "QI",
        name: "BENQI",
        decimals: 18,
        icon: "qi.svg",
        chains: {
            [avalanche.id]: {
                address: "0x8729438EB15e2C8B576fCc6AeCdA6A148776C0F5",
                apiData: {
                    [ApiProvider.Dexalot]: {
                        id: "QI",
                    },
                },
            },
        },
    },
    {
        id: "rbtcb",
        symbol: "rBTC.b",
        name: "Restaked BTC.b",
        decimals: 18,
        icon: "rbtcb.svg",
        chains: {
            [avalanche.id]: {
                address: "0xe684F692bdf5B3B0DB7E8e31a276DE8A2E9F0025",
            },
        },
    },
    {
        id: "rsavax",
        symbol: "rsAVAX",
        name: "Restaked sAVAX",
        decimals: 18,
        icon: "rsavax.svg",
        chains: {
            [avalanche.id]: {
                address: "0xDf788AD40181894dA035B827cDF55C523bf52F67",
            },
        },
    },
    {
        id: "savax",
        symbol: "sAVAX",
        name: "Staked AVAX",
        decimals: 18,
        icon: "savax.svg",
        chains: {
            [avalanche.id]: {
                address: "0x2b2C81e08f1Af8835a78Bb2A90AE924ACE0eA4bE",
                apiData: {
                    [ApiProvider.Dexalot]: {
                        id: "sAVAX",
                    },
                },
            },
        },
    },
    {
        id: "savusd",
        symbol: "savUSD",
        name: "Staked avUSD",
        decimals: 18,
        icon: "savusd.svg",
        chains: {
            [avalanche.id]: {
                address: "0x06d47F3fb376649c3A9Dafe069B3D6E35572219E",
            },
        },
    },
    {
        id: "shrap",
        symbol: "SHRAP",
        name: "Shrapnel",
        decimals: 18,
        icon: "shrap.png",
        chains: {
            [avalanche.id]: {
                address: "0xd402298a793948698b9a63311404fbbee944eafd",
                apiData: {
                    [ApiProvider.Dexalot]: {
                        id: "SHRAP",
                    },
                },
            },
        },
    },
    {
        id: "solvbtc",
        symbol: "SolvBTC",
        name: "Solv BTC",
        decimals: 18,
        icon: "solvbtc.png",
        chains: {
            [avalanche.id]: {
                address: "0xbc78D84Ba0c46dFe32cf2895a19939c86b81a777",
            },
        },
    },
    {
        id: "steak",
        symbol: "STEAK",
        name: "STEAK",
        decimals: 18,
        icon: "steak.svg",
        chains: {
            [avalanche.id]: {
                address: "0xb279f8DD152B99Ec1D84A489D32c35bC0C7F5674",
            },
        },
    },
    {
        id: "stg",
        symbol: "STG",
        name: "Stargate",
        decimals: 18,
        icon: "stg.svg",
        chains: {
            [avalanche.id]: {
                address: "0x2f6f07cdcf3588944bf4c42ac74ff24bf56e7590",
            },
        },
    },
    {
        id: "tes",
        symbol: "TES",
        name: "Native TES",
        decimals: 18,
        icon: "tes.png",
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
    {
        id: "usdc.e",
        symbol: "USDC.e",
        name: "Avalanche Bridge USDC",
        decimals: 6,
        icon: "usdc.svg",
        chains: {
            [avalanche.id]: {
                address: "0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664",
            },
        },
    },
    {
        id: "usdt",
        priceId: "usdt.avax",
        symbol: "USDT",
        name: "Native USDT",
        decimals: 6,
        icon: "usdt.svg",
        chains: {
            [avalanche.id]: {
                address: "0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7",
                apiData: {
                    [ApiProvider.Dexalot]: {
                        id: "USDt",
                    },
                },
            },
        },
    },
    {
        id: "usdt.e",
        symbol: "USDT.e",
        name: "Avalanche Bridge USDT",
        decimals: 6,
        icon: "usdt.svg",
        chains: {
            [avalanche.id]: {
                address: "0xc7198437980c041c805A1EDcbA50c1Ce5db95118",
            },
        },
    },
    {
        id: "waifu",
        symbol: "WAIFU",
        name: "Waifu",
        decimals: 18,
        icon: "waifu.png",
        chains: {
            [avalanche.id]: {
                address: "0xFF24003428Fb2E969C39EdEe4e9F464b0b78313d",
            },
        },
    },
    {
        id: "wbtce",
        symbol: "WBTC.e",
        name: "Avalanche Bridge Wrapped BTC",
        decimals: 8,
        icon: "wbtce.png",
        chains: {
            [avalanche.id]: {
                address: "0x50b7545627a5162F82A992c33b87aDc75187B218",
            },
        },
    },
    {
        id: "wethe",
        priceId: "eth.avax",
        symbol: "WETH.e",
        name: "Avalanche Bridge ETH",
        decimals: 18,
        icon: "wethe.png",
        chains: {
            [avalanche.id]: {
                address: "0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB",
                apiData: {
                    [ApiProvider.Dexalot]: {
                        id: "WETH.e",
                    },
                },
            },
        },
    },
    {
        id: "wink",
        symbol: "WINK",
        name: "Wink",
        decimals: 18,
        icon: "wink.png",
        chains: {
            [avalanche.id]: {
                address: "0x7698A5311DA174A95253Ce86C21ca7272b9B05f8",
                apiData: {
                    [ApiProvider.Dexalot]: {
                        id: "WINK",
                    },
                },
            },
        },
    },
    {
        id: "woo",
        symbol: "WOO.e",
        name: "WOO",
        decimals: 18,
        icon: "woo.svg",
        chains: {
            [avalanche.id]: {
                address: "0xabc9547b534519ff73921b1fba6e672b5f58d083",
            },
        },
    },
    {
        id: "xava",
        symbol: "XAVA",
        name: "Avalaunch",
        decimals: 18,
        icon: "xava.svg",
        chains: {
            [avalanche.id]: {
                address: "0xd1c3f94DE7e5B45fa4eDBBA472491a9f4B166FC4",
            },
        },
    },
    {
        id: "xavax",
        symbol: "xAVAX",
        name: "xAVAX",
        decimals: 18,
        icon: "xavax.png",
        chains: {
            [avalanche.id]: {
                address: "0x698C34Bad17193AF7E1B4eb07d1309ff6C5e715e",
            },
        },
    },
    {
        id: "xsgd",
        symbol: "XSGD",
        name: "XSGD",
        decimals: 6,
        icon: "xsgd.png",
        chains: {
            [avalanche.id]: {
                address: "0xb2F85b7AB3c2b6f62DF06dE6aE7D09c010a5096E",
            },
        },
    },
    {
        id: "yak",
        symbol: "YAK",
        name: "YAK",
        decimals: 18,
        icon: "yak.svg",
        chains: {
            [avalanche.id]: {
                address: "0x59414b3089ce2AF0010e7523Dea7E2b35d776ec7",
            },
        },
    },
    {
        id: "zro",
        symbol: "ZRO",
        name: "LayerZero",
        decimals: 18,
        icon: "zro.svg",
        chains: {
            [avalanche.id]: {
                address: "0x6985884C4392D348587B19cb9eAAf157F13271cd",
            },
        },
    },
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