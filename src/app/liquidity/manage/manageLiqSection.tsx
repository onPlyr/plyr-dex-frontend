
"use client";
import { useEffect, useState } from 'react'
import Link from 'next/link';

import Image from 'next/image';
import { Button } from "@/src/components/ui/button"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { Card } from "@/src/components/ui/card"
import { useActiveAccount, useActiveWallet, useActiveWalletChain, useSwitchActiveWalletChain } from 'thirdweb/react';
import { balanceOf, totalSupply } from "thirdweb/extensions/erc20";

import { client, tauChain, phiChain } from '@/src/lib/thirdweb_client';

import { NumericFormat } from "react-number-format";

import { getContract, readContract, toTokens } from 'thirdweb';


import RemoveLiq from './components/removeLiq';
import { Skeleton } from '@/src/components/ui/skeleton';


const CHAIN_ID = process.env.NEXT_PUBLIC_NETWORK_TYPE === 'mainnet' ? 16180 : 62831;
const CHAIN = process.env.NEXT_PUBLIC_NETWORK_TYPE === 'mainnet' ? phiChain : tauChain;

export default function manageLiqSection({ tokenList }: { tokenList: any[] }) {

    const activeWallet = useActiveWallet();
    const activeAccount = useActiveAccount();
    const activeChain = useActiveWalletChain();
    const switchChain = useSwitchActiveWalletChain()

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

            <Card className="w-full max-w-3xl mx-auto rounded-[12px] border-none p-8" style={{ background: "url('/liquidity/my.png') no-repeat 80% center", backgroundSize: "cover" }}>
                    <div className="flex flex-col items-start justify-center">
                        <div className="text-white text-5xl font-thin leading-none" style={{ fontFamily: 'var(--font-bold-finger)' }}>MY LP</div>
                        <div className="text-[#daff00] text-5xl font-thin leading-none" style={{ fontFamily: 'var(--font-bold-finger)' }}>POSITIONS</div>
                        <div className="flex flex-row gap-2 mt-4">
                            <a className="flex flex-row items-center justify-center text-white text-[10px] leading-none uppercase px-3 py-1.5 rounded-full shadow-grow-gray bg-black hover:scale-105 transition-transform duration-300" href="/liquidity/manage">Read DOC</a>
                        </div>
                    </div>
                    {/* <div className="flex flex-col flex-1 items-center justify-center">
                        <Link href={`/liquidity/add/`}>
                            <Button className="relative w-full rounded-xl font-light uppercase text-white bg-black hover:bg-black shadow-grow-gray hover:scale-105 transition-transform duration-300">
                                CREATE A NEW LIQUIDITY
                            </Button>
                        </Link>
                    </div> */}
                </Card>

                {
                    isLoading && <div className="w-full flex items-center justify-center">
                        <div className="w-full flex md:flex-row flex-col gap-2 max-w-3xl mx-auto">
                            <Skeleton className="md:w-3/5 w-full h-80 bg-[#ffffff0d] rounded-[12px] border-none p-6" />
                            <Skeleton className="md:w-2/5 w-full h-80 bg-[#ffffff0d] rounded-[12px] border-none p-6" />
                        </div>
                    </div>
                }
                {
                    !isLoading && myLpTokens.length === 0 && activeAccount && activeWallet && activeChain?.id === CHAIN_ID && <div className="w-full flex md:flex-row flex-col gap-2 max-w-3xl mx-auto">
                        <Card className="w-full bg-[#ffffff0d] h-80 rounded-[12px] border-none p-6 flex flex-col items-center justify-center">
                            <div className="text-white text-center text-2xl font-black leading-none">NO LIQUIDITY POSITIONS</div>
                            <Link href={`/liquidity/add/`} className="relative w-fit px-6 py-2 mx-auto rounded-xl font-light mt-6 uppercase text-white bg-black hover:bg-black shadow-grow-gray hover:scale-105 transition-transform duration-300">
                                ADD LIQUIDITY
                            </Link>
                        </Card>
                    </div>
                }
                {
                    !isLoading && (!activeAccount || !activeWallet || activeChain?.id !== CHAIN_ID) && <div className="w-full flex md:flex-row flex-col gap-2 max-w-3xl mx-auto">
                        <Card className="w-full bg-[#ffffff0d] h-80 rounded-[12px] border-none p-6 flex flex-col items-center justify-center">
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
                        <Card className="md:w-3/5 flex flex-col justify-between w-full bg-[#ffffff0d] rounded-[12px] border-none p-6">
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
                                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-center bg-[#1e1d1b] rounded-full h-[108px] w-[108px] flex flex-col items-center justify-center">
                                            <div className="text-xl font-bold">{Number(selectedLpTokenInfo.poolShare * 100).toFixed(1)}%</div>
                                            <div className="text-[10px]">Pool Share</div>
                                        </div>

                                    </div>
                                }

                                {
                                    selectedLpTokenInfo && <div className="flex flex-1 flex-col items-center justify-center gap-1">
                                        <div className="bg-[#1e1d1b] w-full rounded-[12px] p-2 gap-2 flex flex-row items-center justify-start">
                                            <Image src={selectedLpTokenInfo.token0.logoURI} alt={selectedLpTokenInfo.token0.symbol} width={28} height={28} className="rounded-full w-7 h-7" />
                                            <NumericFormat value={Number(toTokens(selectedLpTokenInfo.reserves[0], selectedLpTokenInfo.token0.decimals))} displayType={"text"} thousandSeparator={true} decimalScale={4} className="text-white text-lg font-bold" />
                                        </div>
                                        <div className="bg-[#1e1d1b] w-full rounded-[12px] p-2 gap-2 flex flex-row items-center justify-start">
                                            <Image src={selectedLpTokenInfo.token1.logoURI} alt={selectedLpTokenInfo.token1.symbol} width={28} height={28} className="rounded-full w-7 h-7" />
                                            <NumericFormat value={Number(toTokens(selectedLpTokenInfo.reserves[1], selectedLpTokenInfo.token1.decimals))} displayType={"text"} thousandSeparator={true} decimalScale={4} className="text-white text-lg font-bold" />
                                        </div>
                                        <div className="bg-[#1e1d1b] w-full rounded-[12px] p-2 gap-2 flex flex-row items-center justify-start">
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
                        <Card className="md:w-2/5 w-full bg-[#ffffff0d] rounded-[12px] border-none p-6 flex flex-col">
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
