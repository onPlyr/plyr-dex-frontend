
"use client";
import { useEffect, useState } from 'react'
// import { Token, Fetcher } from '@uniswap/sdk'
// import { Pair, } from 'custom-uniswap-v2-sdk'

import { Token, Fetcher, Pair, Trade, Route, TokenAmount, Fraction } from '@plyrnetwork/plyrswap-sdk'
import Image from 'next/image';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useActiveAccount, useActiveWallet, useWalletBalance } from 'thirdweb/react';
import { balanceOf, totalSupply } from "thirdweb/extensions/erc20";
import WalletButton from '@/app/walletButton';
import { client, tauChain, phiChain } from '@/lib/thirdweb_client';

import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

import { NumericFormat } from "react-number-format";

import { ethers } from "ethers";
import { getContract, prepareContractCall, readContract, sendAndConfirmTransaction, toEther, toTokens, toUnits, toWei } from 'thirdweb';
import { allowance, approve, transfer } from "thirdweb/extensions/erc20";

import { ethers5Adapter } from "thirdweb/adapters/ethers5";
import { useSearchParams } from 'next/navigation';

import { getWalletBalance } from 'thirdweb/wallets';
import Link from 'next/link';

import { FastAverageColor } from 'fast-average-color';


const CHAIN_ID = process.env.NEXT_PUBLIC_NETWORK_TYPE === 'mainnet' ? 16180 : 62831;
const CHAIN = process.env.NEXT_PUBLIC_NETWORK_TYPE === 'mainnet' ? phiChain : tauChain;

export default function manageLiqSection({ tokenList }: { tokenList: any[] }) {

    const activeWallet = useActiveWallet();
    const activeAccount = useActiveAccount();

    const [allPairs, setAllPairs] = useState<string[]>([])
    const [myLpTokens, setMyLpTokens] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    // Gradient color //
    const [gradientColors, setGradientColors] = useState<{ [key: string]: string }>({});
    useEffect(() => {
        const fetchGradientColors = async () => {
            const fac = new FastAverageColor();
            const colors: { [key: string]: string } = {};
            for (const token of myLpTokens) {
                const color0 = await fac.getColorAsync(token.token0.logoURI);
                const color1 = await fac.getColorAsync(token.token1.logoURI);
                colors[token.pairAddress] = `linear-gradient(to right, ${color0.hex}, ${color1.hex})`;
            }
            setGradientColors(colors);
        };
        fetchGradientColors();
    }, [myLpTokens]);

    const getAllPairs = async () => {

        if (!activeAccount) {
            return;
        }

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

            console.log('myLpTokens', reserves, lpTokens, lpSupply)

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

        setMyLpTokens(myLpTokens);
        setIsLoading(false);
    };

    useEffect(() => {

        if (allPairs.length > 0) {
            getMyLpTokens();
        }

    }, [allPairs]);

    useEffect(() => {
        if (activeAccount && activeWallet) {
            getAllPairs();
        }
    }, [activeAccount, activeWallet]);


    return (
        // list all pairs
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle>Manage Liquidity</CardTitle>
                <CardDescription>You can click to add more liquidity or remove liquidity from your wallet.</CardDescription>
            </CardHeader>
            <CardContent>

                <div className="flex flex-row justify-end mb-4">
                    <Link href={`/liquidity/add/`}>
                        <Button>ADD LIQUIDITY</Button>
                    </Link>
                </div>

                {
                    isLoading && (
                        <div>Loading...</div>
                    )
                }

                {
                    !isLoading && myLpTokens.length === 0 && (
                        <div>No LP tokens found</div>
                    )
                }

                {
                    !isLoading && myLpTokens.length > 0 && (
                        <div className="flex flex-col gap-4">
                            {myLpTokens.map((token) => (
                                <div key={token.pair} 
                                className="flex flex-row justify-between  border-2 border-gray-200 rounded-lg p-4"
                                style={{ background: gradientColors[token.pairAddress] }}
                                >
                                    <div className="text-lg font-bold">
                                        <div className="flex flex-row gap-2 items-center">
                                            <Image src={token.token0.logoURI} alt={token.token0.symbol} width={20} height={20} className="rounded-full w-5 h-5" />
                                            {token.token0.symbol} - {Number(toTokens(token.reserves[0], token.token0.decimals)) * token.poolShare}
                                        </div>
                                        <div className="flex flex-row gap-2 items-center">
                                            <Image src={token.token1.logoURI} alt={token.token1.symbol} width={20} height={20} className="rounded-full w-5 h-5" />
                                            {token.token1.symbol} - {Number(toTokens(token.reserves[1], token.token1.decimals)) * token.poolShare}
                                        </div>
                                        <div className="text-sm text-gray-500 mt-4">LP TOKENS: {toTokens(token.lpTokens, 18)}</div>
                                        <div className="text-sm text-gray-500">POOL SHARE: {token.poolShare * 100}%</div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <Link className='w-full' href={`/liquidity/add/?currencyA=${token.token0.symbol}&currencyB=${token.token1.symbol}`}>
                                            <Button className='w-full'>ADD</Button>
                                        </Link>
                                        <Link href={`/liquidity/remove/?pair=${token.pairAddress}`}>
                                            <Button className="bg-red-500 hover:bg-red-600">REMOVE</Button>
                                        </Link>
                                    </div>

                                </div>
                            ))}
                        </div>
                    )
                }

                <div className="mt-4 w-full mx-auto">
                    <WalletButton />
                </div>
            </CardContent>
        </Card>
    )
}
