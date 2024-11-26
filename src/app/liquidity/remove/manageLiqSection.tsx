
"use client";
import { useEffect, useState } from 'react'
// import { Token, Fetcher } from '@uniswap/sdk'
// import { Pair, } from 'custom-uniswap-v2-sdk'

import { Token, Fetcher, Pair, Trade, Route, TokenAmount, Fraction } from '@plyrnetwork/plyrswap-sdk'

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
import { Slider } from "@/components/ui/slider"
const CHAIN_ID = process.env.NEXT_PUBLIC_NETWORK_TYPE === 'mainnet' ? 16180 : 62831;
const CHAIN = process.env.NEXT_PUBLIC_NETWORK_TYPE === 'mainnet' ? phiChain : tauChain;

export default function manageLiqSection({ tokenList }: { tokenList: any[] }) {

    const activeWallet = useActiveWallet();
    const activeAccount = useActiveAccount();

    const params = useSearchParams();
    const pairAddress = params.get('pair');

    const [sliderValue, setSliderValue] = useState([50])

    const [allPairs, setAllPairs] = useState<string[]>([])
    const [myLpToken, setMyLpToken] = useState<any>({})
    const [isLoading, setIsLoading] = useState(true)

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
            const pairs = localStorage.getItem('allPairs');
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

    const getMyLpToken = async () => {
        if (!activeAccount || !pairAddress) {
            return;
        }
        try {
            // Pair Contract //
            const pairContract = getContract({
                client: client,
                address: pairAddress,
                chain: CHAIN,
            });
            // Get Token info //
            const [reserves, lpTokens, lpSupply, token0, token1] = await Promise.all([
                readContract({ contract: pairContract, method: 'function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)', params: [] }),
                balanceOf({ contract: pairContract, address: activeAccount?.address }),
                totalSupply({ contract: pairContract }),
                readContract({ contract: pairContract, method: 'function token0() external view returns (address)', params: [] }),
                readContract({ contract: pairContract, method: 'function token1() external view returns (address)', params: [] }),
            ]);
            if (Number(lpTokens) <= 0) {
                setMyLpToken({});
                setIsLoading(false);
                return;
            }
            // get Pool Share //
            const poolShare = Number(toTokens(lpTokens, tokenList.find(t => t.address.toLowerCase() === token0.toLowerCase())?.decimals ?? 0)) / Number((toTokens(lpSupply, tokenList.find(t => t.address.toLowerCase() === token0.toLowerCase())?.decimals ?? 0)));
            // @ts-ignore
            const token0Info = token0.toLowerCase() === process.env.NEXT_PUBLIC_UNISWAP_WPLYR?.toLowerCase() ? { symbol: 'PLYR', address: process.env.NEXT_PUBLIC_UNISWAP_WPLYR.toLowerCase(), decimals: 18 } : tokenList.find(t => t.address.toLowerCase() === token0.toLowerCase());
            // @ts-ignore
            const token1Info = token1.toLowerCase() === process.env.NEXT_PUBLIC_UNISWAP_WPLYR?.toLowerCase() ? { symbol: 'PLYR', address: process.env.NEXT_PUBLIC_UNISWAP_WPLYR.toLowerCase(), decimals: 18 } : tokenList.find(t => t.address.toLowerCase() === token1.toLowerCase());
            setMyLpToken({
                pairAddress: pairAddress,
                lpTokens: lpTokens,
                poolShare: poolShare,
                reserves: reserves,
                token0: token0Info,
                token1: token1Info,
                lpSupply: lpSupply,
            });
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching LP token:', error);
            setMyLpToken({});
            setIsLoading(false);
        }
    }

    useEffect(() => {

        if (allPairs.length > 0) {
            getMyLpToken();
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
                <CardTitle>Remove Liquidity</CardTitle>
                <CardDescription>You can click to add more liquidity or remove liquidity from your wallet.</CardDescription>
            </CardHeader>
            <CardContent>
                {
                    isLoading && (
                        <div>Loading...</div>
                    )
                }

                {
                    !isLoading && Object.keys(myLpToken).length === 0 && (
                        <div>No LP tokens found</div>
                    )
                }

                {
                    !isLoading && Object.keys(myLpToken).length > 0 && (
                        <div className="flex flex-col gap-4">

                            <div className="flex flex-row justify-between">
                                <Slider defaultValue={sliderValue} max={100} step={1} value={sliderValue} onValueChange={setSliderValue} />
                            </div>

                            {/* button to toggle on slider 10% 25% 50% 75% max*/}
                            <div className="flex flex-row justify-between">
                                <Button onClick={() => setSliderValue([10])} variant="outline">10%</Button>
                                <Button onClick={() => setSliderValue([25])} variant="outline">25%</Button>
                                <Button onClick={() => setSliderValue([50])} variant="outline">50%</Button>
                                <Button onClick={() => setSliderValue([75])} variant="outline">75%</Button>
                                <Button onClick={() => setSliderValue([100])} variant="outline">Max</Button>
                            </div>

                            <div key={myLpToken.pair} className="flex flex-row justify-between  border-2 border-gray-200 rounded-lg p-4">
                                <div className="text-lg font-bold">
                                    <div className="text-xl font-bold">
                                        You will receive:
                                    </div>
                                    <div className="flex flex-row gap-2">
                                        {myLpToken.token0.symbol} - {Number(toTokens(myLpToken.reserves[0], myLpToken.token0.decimals)) * myLpToken.poolShare * sliderValue[0] / 100}
                                    </div>
                                    <div className="flex flex-row gap-2">
                                        {myLpToken.token1.symbol} - {Number(toTokens(myLpToken.reserves[1], myLpToken.token1.decimals)) * myLpToken.poolShare * sliderValue[0] / 100}
                                    </div>

                                    <div className="text-xl font-bold">
                                        Position decreases to:
                                    </div>
                                    <div className="text-sm text-gray-500">LP TOKENS: {Number(toTokens(myLpToken.lpTokens, 18)) - Number(toTokens(myLpToken.lpTokens, 18)) * sliderValue[0] / 100}</div>
                                    <div className="text-sm text-gray-500">POOL SHARE: {myLpToken.poolShare * 100 - (myLpToken.poolShare * 100 * sliderValue[0] / 100)}%</div>
                                </div>

                            </div>

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
