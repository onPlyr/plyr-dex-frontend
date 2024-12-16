
"use client";
import { use, useEffect, useState } from 'react'
import Link from 'next/link';
// import { Token, Fetcher } from '@uniswap/sdk'
// import { Pair, } from 'custom-uniswap-v2-sdk'

import { Token, Fetcher, Pair, Trade, Route, TokenAmount, Fraction } from '@plyrnetwork/plyrswap-sdk'
import Image from 'next/image';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useActiveAccount, useActiveWallet, useActiveWalletChain, useConnect, useConnectModal, useSetActiveWallet, useSwitchActiveWalletChain, useWalletBalance } from 'thirdweb/react';
import { balanceOf, totalSupply } from "thirdweb/extensions/erc20";
import WalletButton from '@/components/walletButton';
import { client, tauChain, phiChain } from '@/lib/thirdweb_client';

import { AlertCircle, Loader2 } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

import { NumericFormat } from "react-number-format";

import { ethers } from "ethers";
import { defineChain, getContract, prepareContractCall, readContract, sendAndConfirmTransaction, toEther, toTokens, toUnits, toWei } from 'thirdweb';
import { allowance, approve, transfer } from "thirdweb/extensions/erc20";

import { ethers5Adapter } from "thirdweb/adapters/ethers5";
import { useSearchParams } from 'next/navigation';

import { createWallet, getWalletBalance } from 'thirdweb/wallets';


import RemoveLiq from './components/removeLiq';
import { Skeleton } from '@/components/ui/skeleton';
import { usePreviousActiveWallet } from '@/store/previousActiveWallet';
import { wallets } from '@/config/wallet';
import { useAccount, useDisconnect, useSwitchChain, useWalletClient } from 'wagmi';
import { viemAdapter } from "thirdweb/adapters/viem";
import { createWalletAdapter, Wallet, WalletId } from "thirdweb/wallets";

const CHAIN_ID = process.env.NEXT_PUBLIC_NETWORK_TYPE === 'mainnet' ? 16180 : 62831;
const CHAIN = process.env.NEXT_PUBLIC_NETWORK_TYPE === 'mainnet' ? phiChain : tauChain;

export default function manageLiqSection({ tokenList }: { tokenList: any[] }) {

    const activeWallet = useActiveWallet();
    const activeAccount = useActiveAccount();
    const activeChain = useActiveWalletChain();
    const switchChain = useSwitchActiveWalletChain()
    const setActiveWallet = useSetActiveWallet();
    

    const wagmiAccount = useAccount();
    const { disconnectAsync } = useDisconnect();
    // This is how to set a wagmi account in the thirdweb context to use with all the thirdweb components including Pay
    const { data: walletClient } = useWalletClient();
    const { switchChainAsync } = useSwitchChain();

    // handle disconnecting from wagmi
    const thirdwebWallet = useActiveWallet();

    useEffect(() => {

        const setActive = async () => {

            if (walletClient) {
                // Store the current active wallet before setting the new one

                const adaptedAccount = viemAdapter.walletClient.fromViem({
                    walletClient: walletClient as any, // accounts for wagmi/viem version mismatches
                });
                const w = createWalletAdapter({
                    adaptedAccount,
                    chain: defineChain(await walletClient.getChainId()),
                    client: client,
                    onDisconnect: async () => {
                        await disconnectAsync();
                    },
                    switchChain: async (chain) => {
                        await switchChainAsync({ chainId: chain.id as any });
                    },
                });

                setActiveWallet(w);

            }
        };
        setActive();
    }, [walletClient, disconnectAsync, switchChainAsync, setActiveWallet]);


    useEffect(() => {
        const disconnectIfNeeded = async () => {
            if (thirdwebWallet && wagmiAccount.status === "disconnected") {
                //alert('disconnecting')
                await thirdwebWallet?.disconnect();
            }
        };
        disconnectIfNeeded();
    }, [wagmiAccount, thirdwebWallet]);


    const [allPairs, setAllPairs] = useState<string[]>([])
    const [myLpTokens, setMyLpTokens] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(false)

    const [selectedLpToken, setSelectedLpToken] = useState<string | null>(null)
    const [selectedLpTokenInfo, setSelectedLpTokenInfo] = useState<any | null>(null)

    const getAllPairs = async () => {

        if (!activeAccount) {
            return;
        }

        setIsLoading(true);

        try {
            const factoryContract = getContract({
                client: client,
                address: process.env.NEXT_PUBLIC_UNISWAP_FACTORY as string,
                chain: CHAIN,
            });

            const pairsLength = await readContract({
                contract: factoryContract,
                method: 'function allPairsLength() external view returns (uint)',
                params: [],
            });



            // read from local storage
            let pairs = localStorage.getItem('allPairs');

            if (pairs && JSON.parse(pairs).length !== pairsLength) {
                localStorage.removeItem('allPairs');
                pairs = null;
            }


            if (pairs) {
                setAllPairs(JSON.parse(pairs));
                return;
            }
            else {
                const pairs = [];

                for (let i = 0; i < pairsLength; i++) {
                    const pairAddress = await readContract({
                        contract: factoryContract,
                        method: 'function allPairs(uint) external view returns (address pair)',
                        params: [BigInt(i)],
                    });

                    pairs.push(pairAddress);
                }

                if (pairs.length > 0) {
                    localStorage.setItem('allPairs', JSON.stringify(pairs));
                    setAllPairs(pairs);
                }
                else {
                    setAllPairs([]);
                    setIsLoading(false);
                }


            }
        } catch (error) {
            console.error('Error fetching pairs:', error);
            setAllPairs([])
            setIsLoading(false);
        }
    };

    const getMyLpTokens = async () => {
        if (!activeAccount) {
            return;
        }

        const promises = allPairs.map(async (pairAddress) => {
            // Pair Contract //
            const pairContract = getContract({
                client: client,
                address: pairAddress,
                chain: CHAIN,
            });

            // Get Token info //
            const [reserves, lpTokens, lpSupply] = await Promise.all([
                readContract({ contract: pairContract, method: 'function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)', params: [] }),
                balanceOf({ contract: pairContract, address: activeAccount?.address }),
                totalSupply({ contract: pairContract }),
            ]);



            // Check if token0 and token1 are already cached for this pair
            const cachedPairInfo = localStorage.getItem('pair-tokens-' + pairAddress);
            let token0, token1;

            if (cachedPairInfo) {
                const { token0: cachedToken0, token1: cachedToken1 } = JSON.parse(cachedPairInfo);
                token0 = cachedToken0;
                token1 = cachedToken1;
            } else {
                // If not cached, fetch token0 and token1 and cache them
                [token0, token1] = await Promise.all([
                    readContract({ contract: pairContract, method: 'function token0() external view returns (address)', params: [] }),
                    readContract({ contract: pairContract, method: 'function token1() external view returns (address)', params: [] }),
                ]);
                localStorage.setItem('pair-tokens-' + pairAddress, JSON.stringify({ token0, token1 }));
            }

            if (Number(lpTokens) <= 0) {
                return null;
            }

            // get Pool Share //
            const poolShare = Number(toTokens(lpTokens, tokenList.find(t => t.address.toLowerCase() === token0.toLowerCase())?.decimals ?? 0)) / Number((toTokens(lpSupply, tokenList.find(t => t.address.toLowerCase() === token0.toLowerCase())?.decimals ?? 0)));

            // @ts-ignore
            const token0Info = token0.toLowerCase() === process.env.NEXT_PUBLIC_UNISWAP_WPLYR?.toLowerCase() ? tokenList.find(t => t.symbol === 'PLYR') : tokenList.find(t => t.address.toLowerCase() === token0.toLowerCase());
            // @ts-ignore
            const token1Info = token1.toLowerCase() === process.env.NEXT_PUBLIC_UNISWAP_WPLYR?.toLowerCase() ? tokenList.find(t => t.symbol === 'PLYR') : tokenList.find(t => t.address.toLowerCase() === token1.toLowerCase());

            return {
                pairAddress: pairAddress,
                lpTokens: lpTokens,
                poolShare: poolShare,
                reserves: reserves,
                token0: token0Info,
                token1: token1Info,
                lpSupply: lpSupply,
            };
        });

        const results = await Promise.all(promises);
        let myLpTokens = results.filter(token => token !== null);

        console.log('myLpTokens', myLpTokens)

        setMyLpTokens(myLpTokens);
        if (myLpTokens.length > 0) {
            setSelectedLpToken(myLpTokens[0].pairAddress);
        }

        setIsLoading(false);
    };



    useEffect(() => {

        if (allPairs.length > 0) {
            getMyLpTokens();
        }

    }, [allPairs]);

    useEffect(() => {

        if (activeAccount && activeWallet && activeChain?.id === CHAIN_ID) {
            getAllPairs();
        }
        else {
            setAllPairs([]);
            setIsLoading(false);
            setMyLpTokens([]);
            setSelectedLpToken(null);
            setSelectedLpTokenInfo(null);
        }
    }, [activeAccount, activeWallet, activeChain]);

    useEffect(() => {
        if (selectedLpToken && myLpTokens.length > 0) {
            const selectedObject = myLpTokens.find(token => token.pairAddress === selectedLpToken);
            console.log('selectedObject', selectedObject)
            setSelectedLpTokenInfo(selectedObject);
        }
        else {
            setSelectedLpTokenInfo(null);
        }
    }, [myLpTokens, selectedLpToken]);

    return (
        <>
            <section className="w-full flex flex-col items-center justify-center py-8 space-y-2 ">

                <Card className="w-full max-w-3xl mx-auto bg-[#ffffff0d] rounded-3xl border-none p-8">
                    <div className="flex flex-col items-start justify-center">
                        <div className="text-white text-4xl font-black leading-none" style={{ fontFamily: 'var(--font-road-rage)' }}>MY LP</div>
                        <div className="text-white text-4xl font-black leading-none" style={{ fontFamily: 'var(--font-road-rage)' }}>POSITIONS</div>
                        <div className="flex flex-row gap-2 mt-4">
                            <a className="flex flex-row items-center justify-center text-white text-[10px] leading-none uppercase px-3 py-1.5 rounded-full shadow-grow-gray bg-black hover:scale-105 transition-transform duration-300" href="/liquidity/manage">Read DOC</a>

                        </div>
                    </div>
                </Card>

                {
                    isLoading && <div className="w-full flex items-center justify-center">
                        <div className="w-full flex md:flex-row flex-col gap-2 max-w-3xl mx-auto">
                            <Skeleton className="md:w-3/5 w-full h-80 bg-[#ffffff0d] rounded-3xl border-none p-6" />
                            <Skeleton className="md:w-2/5 w-full h-80 bg-[#ffffff0d] rounded-3xl border-none p-6" />
                        </div>
                    </div>
                }
                {
                    !isLoading && myLpTokens.length === 0 && activeAccount && activeWallet && activeChain?.id === CHAIN_ID && <div className="w-full flex md:flex-row flex-col gap-2 max-w-3xl mx-auto">
                        <Card className="w-full bg-[#ffffff0d] h-80 rounded-3xl border-none p-6 flex flex-col items-center justify-center">
                            <div className="text-white text-center text-2xl font-black leading-none">NO LIQUIDITY POSITIONS</div>
                            <Link href={`/liquidity/add/`} className="relative w-fit px-6 py-2 mx-auto rounded-xl font-light mt-6 uppercase text-white bg-black hover:bg-black shadow-grow-gray hover:scale-105 transition-transform duration-300">
                                ADD LIQUIDITY
                            </Link>
                        </Card>
                    </div>
                }
                {
                    !isLoading && (!activeAccount || !activeWallet || activeChain?.id !== CHAIN_ID) && <div className="w-full flex md:flex-row flex-col gap-2 max-w-3xl mx-auto">
                        <Card className="w-full bg-[#ffffff0d] h-80 rounded-3xl border-none p-6 flex flex-col items-center justify-center">
                            <div className="text-white flex flex-col gap-2 items-center justify-center text-center text-2xl font-black leading-none">{activeChain?.id !== CHAIN_ID && activeAccount ? <>

                                PLEASE SWITCH TO PLYR NETWORK
                                <Button className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-10 px-4 py-2 relative w-full rounded-xl font-light mt-6 uppercase text-white bg-black hover:bg-black shadow-grow-gray hover:scale-105 transition-transform duration-300" onClick={() => switchChain(CHAIN)}>SWITCH TO PLYR NETWORK</Button>

                            </> : 'PLEASE CONNECT YOUR WALLET'}</div>
                        </Card>
                    </div>
                }
                {
                    !isLoading && myLpTokens.length > 0 && activeAccount && activeWallet && activeChain?.id === CHAIN_ID && <div className="w-full flex md:flex-row flex-col gap-2 max-w-3xl mx-auto">
                        {/* My Liquidity */}
                        <Card className="md:w-3/5 w-full bg-[#ffffff0d] rounded-3xl border-none p-6">
                            {/* Dropdown */}
                            <Select value={selectedLpToken ?? ''} onValueChange={(value) => {
                                setSelectedLpToken(value);
                            }}>
                                <SelectTrigger className="w-full bg-[#3A3935] text-white border-none h-16 rounded-2xl" id="token0">
                                    <SelectValue placeholder="SELECT MY LP" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#3A3935] text-white border-none">
                                    {myLpTokens?.map((token: any) => (
                                        <SelectItem key={token.pairAddress} value={token.pairAddress}>
                                            <div className="flex flex-row gap-2 items-center font-bold">
                                                <div className="flex flex-row gap-2 items-center">
                                                    <Image src={token.token0.logoURI} alt={token.token0.symbol} width={28} height={28} className="rounded-full w-7 h-7" />
                                                    <Image src={token.token1.logoURI} alt={token.token1.symbol} width={28} height={28} className="rounded-full w-7 h-7 relative ml-[-10px]" />
                                                </div>
                                                {token.token0.symbol}+{token.token1.symbol}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {/* Summarize */}
                            <div className="w-full flex flex-row gap-2 mt-4 md:px-2">
                                {
                                    selectedLpTokenInfo && <div className="relative min-w-36 w-36 h-36 -ml-2 md:-ml-0">
                                        <svg className="w-full h-full transform -rotate-90">
                                            <circle
                                                cx="72"
                                                cy="72"
                                                r="54"
                                                strokeWidth="18"
                                                stroke="#ffffff30"
                                                fill="transparent"
                                            />
                                            <circle
                                                cx="72"
                                                cy="72"
                                                r="54"
                                                strokeWidth="18"
                                                stroke="#ffffff"
                                                fill="transparent"
                                                strokeDasharray={`${(selectedLpTokenInfo.poolShare * 100) * 3.375}, 337.5`}
                                            />
                                        </svg>
                                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-center bg-[#1e1d1b] rounded-full h-[81px] w-[81px] flex flex-col items-center justify-center">
                                            <div className="text-xl font-bold">{Number(selectedLpTokenInfo.poolShare * 100).toFixed(1)}%</div>
                                            <div className="text-[10px]">Pool Share</div>
                                        </div>

                                    </div>
                                }

                                {
                                    selectedLpTokenInfo && <div className="flex flex-1 flex-col items-center justify-center gap-1">
                                        <div className="bg-[#1e1d1b] w-full rounded-3xl p-2 gap-2 flex flex-row items-center justify-start">
                                            <Image src={selectedLpTokenInfo.token0.logoURI} alt={selectedLpTokenInfo.token0.symbol} width={28} height={28} className="rounded-full w-7 h-7" />
                                            <NumericFormat value={Number(toTokens(selectedLpTokenInfo.reserves[0], selectedLpTokenInfo.token0.decimals))} displayType={"text"} thousandSeparator={true} decimalScale={4} className="text-white text-lg font-bold" />
                                        </div>
                                        <div className="bg-[#1e1d1b] w-full rounded-3xl p-2 gap-2 flex flex-row items-center justify-start">
                                            <Image src={selectedLpTokenInfo.token1.logoURI} alt={selectedLpTokenInfo.token1.symbol} width={28} height={28} className="rounded-full w-7 h-7" />
                                            <NumericFormat value={Number(toTokens(selectedLpTokenInfo.reserves[1], selectedLpTokenInfo.token1.decimals))} displayType={"text"} thousandSeparator={true} decimalScale={4} className="text-white text-lg font-bold" />
                                        </div>
                                        <div className="bg-[#1e1d1b] w-full rounded-3xl p-2 gap-2 flex flex-row items-center justify-start">
                                            <div className="h-7 w-7 bg-white rounded-full font-bold flex flex-row items-center justify-center text-black">
                                                LP
                                            </div>
                                            <NumericFormat value={Number(toTokens(selectedLpTokenInfo.lpTokens, 18))} displayType={"text"} thousandSeparator={true} decimalScale={4} className="text-white text-lg font-bold" />
                                        </div>
                                    </div>
                                }
                            </div>
                            {/* Add more liquidity */}
                            {
                                selectedLpTokenInfo && <Link href={`/liquidity/add/?currencyA=${selectedLpTokenInfo.token0.symbol}&currencyB=${selectedLpTokenInfo.token1.symbol}`}>
                                    <Button className="relative w-full rounded-xl font-light mt-6 uppercase text-white bg-black hover:bg-black shadow-grow-gray hover:scale-105 transition-transform duration-300">ADD MORE <span className="font-bold">{selectedLpTokenInfo.token0.symbol}+{selectedLpTokenInfo.token1.symbol}</span> LIQUIDITY</Button>
                                </Link>
                            }
                        </Card>


                        {/* Remove Liquidity */}
                        <Card className="md:w-2/5 w-full bg-[#ffffff0d] rounded-3xl border-none p-6 flex flex-col">
                            <div className="text-xl text-white font-bold">REMOVE LIQUIDITY</div>
                            {
                                selectedLpTokenInfo && <RemoveLiq mySelectedLpToken={selectedLpTokenInfo} getMyLpToken={getMyLpTokens} />
                            }
                        </Card>
                    </div>
                }
            </section>
        </>
    )
}
