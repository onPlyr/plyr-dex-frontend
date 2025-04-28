
"use client";
import { useState } from 'react'

import Image from 'next/image'
import { Button } from "@/src/components/ui/button"

import { useActiveAccount, useActiveWallet, useWalletBalance } from 'thirdweb/react';

import { client, tauChain, phiChain } from '@/src/lib/thirdweb_client';

import { AlertCircle, CircleX, SquareMinus } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from "@/src/components/ui/alert"

import { NumericFormat } from "react-number-format";

import { getContract, prepareContractCall, sendAndConfirmTransaction, toTokens, toUnits } from 'thirdweb';
import { allowance, approve } from "thirdweb/extensions/erc20";


import { BigNumber } from 'bignumber.js';

import { Slider } from "@/src/components/ui/slider"
import { toast } from 'sonner';
import { useToast } from '@/src/components/ui/use-toast';
const CHAIN_ID = process.env.NEXT_PUBLIC_NETWORK_TYPE === 'mainnet' ? 16180 : 62831;
const CHAIN = process.env.NEXT_PUBLIC_NETWORK_TYPE === 'mainnet' ? phiChain : tauChain;

export default function removeLiqSection({ mySelectedLpToken, getMyLpToken }: { mySelectedLpToken: any, getMyLpToken: () => void }) {

    const activeWallet = useActiveWallet();
    const activeAccount = useActiveAccount();

    const { toast } = useToast();

    const [sliderValue, setSliderValue] = useState([0])

    const [isLoading, setIsLoading] = useState(false)
    const [isRemovingLiquidity, setIsRemovingLiquidity] = useState(false)

    const [result, setResult] = useState<React.ReactNode | null>(null)


    const handleRemoveLiquidity = async (e: React.FormEvent) => {

        e.preventDefault()
        e.stopPropagation()

        if (!activeAccount || !activeWallet) {
            return
        }

        if (isRemovingLiquidity) return;

        setResult(null)

        setIsRemovingLiquidity(true);

        try {

            const liquidity = BigNumber(toTokens(mySelectedLpToken.lpTokens, 18)).multipliedBy(sliderValue[0]).dividedBy(100).toString();
            const amount0Min = BigNumber(toTokens(mySelectedLpToken.reserves[0], mySelectedLpToken.token0.decimals)).multipliedBy(mySelectedLpToken.poolShare).multipliedBy(sliderValue[0]).dividedBy(100).multipliedBy(95).dividedBy(100).toString(); // 5% slippage
            const amount1Min = BigNumber(toTokens(mySelectedLpToken.reserves[1], mySelectedLpToken.token1.decimals)).multipliedBy(mySelectedLpToken.poolShare).multipliedBy(sliderValue[0]).dividedBy(100).multipliedBy(95).dividedBy(100).toString(); // 5% slippage
            const deadline = Math.floor(Date.now() / 1000) + 60 * 20 // 20 minutes from now

            console.log(liquidity, amount0Min, amount1Min)

            // To convert to ETH //
            //console.log(mySelectedLpToken.token0.symbol, mySelectedLpToken.token1.symbol)
            if (mySelectedLpToken.token0.symbol === 'PLYR' || mySelectedLpToken.token1.symbol === 'PLYR') {

                // Get LP Contract //
                const erc20Contract = getContract({
                    chain: CHAIN,
                    address: mySelectedLpToken.pairAddress,
                    client: client
                });

                console.log('CHAIN', CHAIN)
                console.log('pairAddress', mySelectedLpToken.pairAddress)
                console.log('erc20Contract', erc20Contract)

                const result = await allowance({
                    contract: erc20Contract,
                    owner: activeAccount?.address || '',
                    spender: process.env.NEXT_PUBLIC_UNISWAP_ROUTER as string,
                })

                console.log('result', Number(toTokens(result, 18)), liquidity)

                if (Number(toTokens(result, 18)) < Number(liquidity)) {
                    const approveTx = approve({
                        contract: erc20Contract,
                        spender: process.env.NEXT_PUBLIC_UNISWAP_ROUTER as string,
                        amount: liquidity,
                    });

                    await sendAndConfirmTransaction({
                        transaction: approveTx,
                        account: activeAccount,
                    });
                }

                // Do the remove liquidity
                const uniswapRouterContract = getContract({
                    client: client,
                    address: process.env.NEXT_PUBLIC_UNISWAP_ROUTER as string,
                    chain: CHAIN,
                });

                const tokenAddress = mySelectedLpToken.token0.address === process.env.NEXT_PUBLIC_UNISWAP_WPLYR ? mySelectedLpToken.token1.address : mySelectedLpToken.token0.address

                console.log('removeLiquidityETH',
                    {
                        tokenAddress: tokenAddress,
                        liquidity: toUnits(liquidity.toString(), 18),
                        amount0Min: toUnits(amount0Min.toString(), mySelectedLpToken.token0.decimals),
                        amount1Min: toUnits(amount1Min.toString(), mySelectedLpToken.token1.decimals),
                        to: activeAccount?.address,
                        deadline: deadline.toString(),
                    })

                const transaction = prepareContractCall<any, any, any>({
                    contract: uniswapRouterContract,
                    method: 'function removeLiquidityETH(address token, uint liquidity, uint amountTokenMin, uint amountETHMin, address to, uint deadline) external returns (uint amountToken, uint amountETH)',
                    params: [tokenAddress, toUnits(liquidity.toString(), 18), toUnits(amount0Min.toString(), mySelectedLpToken.token0.decimals), toUnits(amount1Min.toString(), mySelectedLpToken.token1.decimals), activeAccount?.address, deadline.toString()],
                })

                console.log('transaction', transaction)

                const transactionResult = await sendAndConfirmTransaction({
                    transaction,
                    account: activeAccount,
                })



                getMyLpToken();

                const txHash = transactionResult.transactionHash;
                const truncatedTxHash = `${txHash.slice(0, 5)}...${txHash.slice(-5)}`;
                toast({
                    title: 'Liquidity removed successfully!',
                    description:
                        <>
                            <strong>Removed:</strong> {liquidity} LPs of <strong>{mySelectedLpToken.token0.symbol}+{mySelectedLpToken.token1.symbol}</strong>
                            <br />
                            <strong>TxHash:</strong> <a href={`${process.env.NEXT_PUBLIC_EXPLORER_URL}/tx/${txHash}`} target="_blank">{truncatedTxHash}</a>
                        </>
                })
            }
            else {
                // Remove liquidity for token pair
                const erc20Contract = getContract({
                    chain: CHAIN,
                    address: mySelectedLpToken.pairAddress,
                    client: client,
                });
                const result = await allowance({
                    contract: erc20Contract,
                    owner: activeAccount?.address || '',
                    spender: process.env.NEXT_PUBLIC_UNISWAP_ROUTER as string,
                });
                if (Number(toTokens(result, 18)) < Number(liquidity)) {
                    const approveTx = approve({
                        contract: erc20Contract,
                        spender: process.env.NEXT_PUBLIC_UNISWAP_ROUTER as string,
                        amount: liquidity,
                    });
                    await sendAndConfirmTransaction({
                        transaction: approveTx,
                        account: activeAccount,
                    });
                }
                const uniswapRouterContract = getContract({
                    client: client,
                    address: process.env.NEXT_PUBLIC_UNISWAP_ROUTER as string,
                    chain: CHAIN,
                });
                const transaction = prepareContractCall<any, any, any>({
                    contract: uniswapRouterContract,
                    method: 'function removeLiquidity(address tokenA, address tokenB, uint liquidity, uint amountAMin, uint amountBMin, address to, uint deadline) external returns (uint amountA, uint amountB)',
                    params: [
                        mySelectedLpToken.token0.address,
                        mySelectedLpToken.token1.address,
                        toUnits(liquidity.toString(), 18),
                        toUnits(amount0Min.toString(), mySelectedLpToken.token0.decimals),
                        toUnits(amount1Min.toString(), mySelectedLpToken.token1.decimals),
                        activeAccount?.address,
                        deadline.toString(),
                    ],
                });
                const transactionResult = await sendAndConfirmTransaction({
                    transaction,
                    account: activeAccount,
                });

                getMyLpToken();

                const txHash = transactionResult.transactionHash;
                const truncatedTxHash = `${txHash.slice(0, 5)}...${txHash.slice(-5)}`;
                toast({
                    title: 'Liquidity removed successfully!',
                    description:
                        <>
                            <strong>Removed:</strong> {liquidity} LPs of <strong>{mySelectedLpToken.token0.symbol}+{mySelectedLpToken.token1.symbol}</strong>
                            <br />
                            <strong>TxHash:</strong> <a href={`${process.env.NEXT_PUBLIC_EXPLORER_URL}/tx/${txHash}`} target="_blank">{truncatedTxHash}</a>
                        </>
                })
            }
        } catch (error: any) {
            if (error.message.includes('User rejected the request')) {
                toast({
                    title: 'Error',
                    description: 'User rejected the request',
                    variant: 'destructive',
                })
            } else {
                toast({
                    title: 'Error',
                    description: error.message,
                    variant: 'destructive',
                })
            }
        }
        finally {
            setIsRemovingLiquidity(false);
        }
    }


    return (

        <>
            {
                isLoading && (
                    <div>Loading...</div>
                )
            }

            {
                !isLoading && Object.keys(mySelectedLpToken).length === 0 && (
                    <div>No LP tokens found</div>
                )
            }

            {
                !isLoading && Object.keys(mySelectedLpToken).length > 0 && (
                    <div className="flex h-full flex-col gap-4 justify-between">

                        <div className="flex flex-row justify-between">
                            <div className="flex flex-col gap-2">
                                <NumericFormat
                                    id="amount0"
                                    value={sliderValue[0]}
                                    onValueChange={(values) => {
                                        const { value } = values;
                                        if (value === '') {
                                            setSliderValue([0]);
                                        } else if (Number(value) < 0) {
                                            setSliderValue([0]);
                                        } else if (Number(value) > 100) {
                                            setSliderValue([100]);
                                        } else {
                                            setSliderValue([Number(value)]);
                                        }
                                    }}
                                    suffix="%"
                                    disabled={mySelectedLpToken.token0?.symbol === mySelectedLpToken.token1?.symbol || isLoading}
                                    placeholder="0"
                                    className={`text-white w-full h-10 font-bold bg-transparent text-3xl rounded-none border-[#9B9A98] border-b border-t-0 border-r-0 border-l-0 !ring-offset-0 focus:!ring-offset-0 focus-visible:!ring-0 focus-visible:!outline-none px-0 !outline-none !ring-0 placeholder:text-[#9B9A98]`}
                                    allowNegative={false}
                                    allowLeadingZeros={false}
                                    decimalScale={0}
                                    isAllowed={(values) => {
                                        const { value } = values;
                                        return value === '' || (Number(value) >= 0 && Number(value) <= 100);
                                    }}
                                />
                                <div className="flex flex-row gap-2 items-center text-white text-[10px]">
                                    <span className="font-light">BALANCE:</span>
                                    <NumericFormat
                                        value={Number(toTokens(mySelectedLpToken.lpTokens, 18))}
                                        displayType={"text"}
                                        thousandSeparator={true}
                                        decimalScale={8}
                                        suffix={' LPs'}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4">

                            <div className="flex flex-row justify-between">
                                <Slider defaultValue={sliderValue} max={100} step={1} value={sliderValue} onValueChange={setSliderValue} />
                            </div>

                            {/* button to toggle on slider 10% 25% 50% 75% max*/}
                            <div className="flex flex-row justify-between gap-2">
                                <button onClick={() => setSliderValue([10])} className={`${sliderValue[0] === 10 ? 'bg-white text-black' : 'text-white'} border flex-1 transition-colors duration-300 border-gray-200 text-xs rounded-[12px] p-2`}>10%</button>
                                <button onClick={() => setSliderValue([25])} className={`${sliderValue[0] === 25 ? 'bg-white text-black' : 'text-white'} border flex-1 transition-colors duration-300 border-gray-200 text-xs rounded-[12px] p-2`}>25%</button>
                                <button onClick={() => setSliderValue([50])} className={`${sliderValue[0] === 50 ? 'bg-white text-black' : 'text-white'} border flex-1 transition-colors duration-300 border-gray-200 text-xs rounded-[12px] p-2`}>50%</button>
                                <button onClick={() => setSliderValue([75])} className={`${sliderValue[0] === 75 ? 'bg-white text-black' : 'text-white'} border flex-1 transition-colors duration-300 border-gray-200 text-xs rounded-[12px] p-2`}>75%</button>
                                <button onClick={() => setSliderValue([100])} className={`${sliderValue[0] === 100 ? 'bg-white text-black' : 'text-white'} border flex-1 transition-colors duration-300 border-gray-200 text-xs rounded-[12px] p-2`}>MAX</button>
                            </div>
                        </div>

                        <div className="flex flex-col justify-between gap-2 mt-2">
                            <div className="bg-black w-full rounded-[12px] p-2 gap-2 flex flex-row items-center justify-start overflow-hidden">
                                <Image src={mySelectedLpToken.token0?.logoURI} alt={mySelectedLpToken.token0?.symbol} width={28} height={28} className="rounded-full w-7 h-7" />
                                <NumericFormat value={BigNumber(toTokens(mySelectedLpToken.reserves[0], mySelectedLpToken.token0?.decimals ?? (mySelectedLpToken.token0Address === "0x63F551298862f306B689724519D95eDA3dCDE5b8" ? 6 : 18))).multipliedBy(mySelectedLpToken.poolShare).multipliedBy(sliderValue[0]).dividedBy(100).toString()} displayType={"text"} thousandSeparator={true} decimalScale={3} className="text-white text-lg font-bold" />
                            </div>
                            <div className="bg-black w-full rounded-[12px] p-2 gap-2 flex flex-row items-center justify-start overflow-hidden">
                                <Image src={mySelectedLpToken.token1?.logoURI} alt={mySelectedLpToken.token1?.symbol} width={28} height={28} className="rounded-full w-7 h-7" />
                                <NumericFormat value={BigNumber(toTokens(mySelectedLpToken.reserves[1], mySelectedLpToken.token1?.decimals ?? (mySelectedLpToken.token1Address === "0x63F551298862f306B689724519D95eDA3dCDE5b8" ? 6 : 18))).multipliedBy(mySelectedLpToken.poolShare).multipliedBy(sliderValue[0]).dividedBy(100).toString()} displayType={"text"} thousandSeparator={true} decimalScale={3} className="text-white text-lg font-bold" />
                            </div>
                        </div>


                        <Button onClick={handleRemoveLiquidity} disabled={isRemovingLiquidity || sliderValue[0] === 0} className="relative w-full text-xs sm:text-sm flex flex-row items-center justify-center rounded-xl font-light uppercase text-white bg-black hover:bg-black shadow-grow-gray hover:scale-105 transition-transform duration-300 !pl-12 sm:!pl-4">
                        <SquareMinus className="min-w-8 min-h-8 absolute left-2 top-1/2 transform -translate-y-1/2 text-red-500" />
                            REMOVE LIQUIDITY
                        </Button>
                    </div>
                )
            }

            {result && (
                <div className="mt-4 p-4 bg-green-100 text-green-800 rounded-md">
                    <p className="text-sm">{result}</p>
                </div>
            )}

        </>
    )
}
