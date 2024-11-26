
"use client";
import { useEffect, useState } from 'react'
// import { Token, Fetcher } from '@uniswap/sdk'
// import { Pair, } from 'custom-uniswap-v2-sdk'

import { Token, Fetcher, Pair, Trade, Route, TokenAmount, Fraction } from '@plyrnetwork/plyrswap-sdk'
import Image from 'next/image'
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

export default function removeLiqSection({ tokenList }: { tokenList: any[] }) {

    const activeWallet = useActiveWallet();
    const activeAccount = useActiveAccount();

    const params = useSearchParams();
    const pairAddress = params.get('pair');

    const [sliderValue, setSliderValue] = useState([50])

    const [allPairs, setAllPairs] = useState<string[]>([])
    const [myLpToken, setMyLpToken] = useState<any>({})
    const [isLoading, setIsLoading] = useState(true)
    const [isRemovingLiquidity, setIsRemovingLiquidity] = useState(false)
    const [error, setError] = useState('')
    const [result, setResult] = useState<React.ReactNode | null>(null)

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
            const token0Info = token0.toLowerCase() === process.env.NEXT_PUBLIC_UNISWAP_WPLYR?.toLowerCase() ? tokenList.find(t => t.symbol === 'PLYR') : tokenList.find(t => t.address.toLowerCase() === token0.toLowerCase());
            // @ts-ignore
            const token1Info = token1.toLowerCase() === process.env.NEXT_PUBLIC_UNISWAP_WPLYR?.toLowerCase() ? tokenList.find(t => t.symbol === 'PLYR') : tokenList.find(t => t.address.toLowerCase() === token1.toLowerCase());

            console.log(tokenList, token0Info, token1Info);
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


    const handleRemoveLiquidity = async (e: React.FormEvent) => {

        e.preventDefault()
        e.stopPropagation()

        if (isRemovingLiquidity) return;

        if (!activeAccount || !activeWallet) {
            setError('Please connect your wallet first')
            return
        }

        if (!pairAddress) {
            setError('Invalid pair address')
            return
        }

        setResult(null)
        setError('')

        if (myLpToken.token0.address === undefined || myLpToken.token1.address === undefined) {
            setError('Invalid token address');
            return
        }

        setIsRemovingLiquidity(true);

        const Token0 = new Token(CHAIN_ID, myLpToken.token0.address, myLpToken.token0.decimals, myLpToken.token0.symbol)
        const Token1 = new Token(CHAIN_ID, myLpToken.token1.address, myLpToken.token1.decimals, myLpToken.token1.symbol)

        // Use the SDK provider to get the reserves
        //const pairAddress = Pair.getAddress(Token0 as any, Token1 as any)

        console.log(Token0, Token1, process.env.NEXT_PUBLIC_UNISWAP_FACTORY, process.env.NEXT_PUBLIC_UNISWAP_INIT_CODE_HASH)

        //console.log(pairAddress)


        try {

            const liquidity = Number(toTokens(myLpToken.lpTokens, 18)) * sliderValue[0] / 100;
            const amount0Min = (Number(toTokens(myLpToken.reserves[0], myLpToken.token0.decimals)) * myLpToken.poolShare * sliderValue[0] / 100) * 95 / 100; // 5% slippage
            const amount1Min = (Number(toTokens(myLpToken.reserves[1], myLpToken.token1.decimals)) * myLpToken.poolShare * sliderValue[0] / 100) * 95 / 100; // 5% slippage
            const deadline = Math.floor(Date.now() / 1000) + 60 * 20 // 20 minutes from now

            console.log(liquidity, amount0Min, amount1Min)

            // To convert to ETH //
            //console.log(myLpToken.token0.symbol, myLpToken.token1.symbol)
            if (myLpToken.token0.symbol === 'PLYR' || myLpToken.token1.symbol === 'PLYR') {

                // Get LP Contract //
                const erc20Contract = getContract({
                    chain: CHAIN,
                    address: pairAddress,
                    client: client
                });

                console.log('CHAIN', CHAIN)
                console.log('pairAddress', pairAddress)
                console.log('erc20Contract', erc20Contract)

                const result = await allowance({
                    contract: erc20Contract,
                    owner: activeAccount?.address || '',
                    spender: process.env.NEXT_PUBLIC_UNISWAP_ROUTER as string,
                })

                console.log('result', Number(toTokens(result, 18)), liquidity)

                if (Number(toTokens(result, 18)) < liquidity) {
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

                const tokenAddress = myLpToken.token0.address === process.env.NEXT_PUBLIC_UNISWAP_WPLYR ? myLpToken.token1.address : myLpToken.token0.address

                console.log('removeLiquidityETH',
                    {
                        tokenAddress: tokenAddress,
                        liquidity: toUnits(liquidity.toString(), 18),
                        amount0Min: toUnits(amount0Min.toString(), myLpToken.token0.decimals),
                        amount1Min: toUnits(amount1Min.toString(), myLpToken.token1.decimals),
                        to: activeAccount?.address,
                        deadline: deadline.toString(),
                    })

                const transaction = prepareContractCall<any, any, any>({
                    contract: uniswapRouterContract,
                    method: 'function removeLiquidityETH(address token, uint liquidity, uint amountTokenMin, uint amountETHMin, address to, uint deadline) external returns (uint amountToken, uint amountETH)',
                    params: [tokenAddress, toUnits(liquidity.toString(), 18), toUnits(amount0Min.toString(), myLpToken.token0.decimals), toUnits(amount1Min.toString(), myLpToken.token1.decimals), activeAccount?.address, deadline.toString()],
                })

                console.log('transaction', transaction)

                const transactionResult = await sendAndConfirmTransaction({
                    transaction,
                    account: activeAccount,
                })

                const txHash = transactionResult.transactionHash;
                const truncatedTxHash = txHash.slice(5, -5);

                getMyLpToken();

                setResult(<>
                    Liquidity removed successfully!
                    <br /><a href={`${process.env.NEXT_PUBLIC_EXPLORER_URL}/tx/${txHash}`} target="_blank">{truncatedTxHash}</a></>)
            }
            else {
                // Token pair
            }

            // let tx;
            // if (isEthPair) {
            //     const ethAmount = ethToken === token0 ? amount0Desired : amount1Desired
            //     const tokenAmount = ethToken === token0 ? amount1Desired : amount0Desired
            //     const tokenAmountMin = tokenAmount.mul(1000 - Math.floor(slippageTolerance * 1000)).div(1000)
            //     const ethAmountMin = ethAmount.mul(1000 - Math.floor(slippageTolerance * 1000)).div(1000)

            //     // Approve other erc20 token //
            //     if (!otherToken.address) {
            //         setError('Invalid token address')
            //         return
            //     }
            //     const erc20Contract = getContract({
            //         chain: CHAIN,
            //         address: otherToken.address,
            //         client: client
            //     });
            //     const result = await allowance({
            //         contract: erc20Contract,
            //         owner: activeAccount?.address || '',
            //         spender: process.env.NEXT_PUBLIC_UNISWAP_ROUTER as string,
            //     })

            //     console.log('result', result);

            //     console.log('allowance', Number(toTokens(result, otherToken.decimals)), Number(toTokens(tokenAmount.toBigInt(), otherToken.decimals)));

            //     if (Number(toTokens(result, otherToken.decimals)) < Number(toTokens(tokenAmount.toBigInt(), otherToken.decimals))) {
            //         const approveTx = approve({
            //             contract: erc20Contract,
            //             spender: process.env.NEXT_PUBLIC_UNISWAP_ROUTER as string,
            //             amount: toTokens(tokenAmount.toBigInt(), otherToken.decimals),
            //         });

            //         await sendAndConfirmTransaction({
            //             transaction: approveTx,
            //             account: activeAccount,
            //         });
            //     }


            //     const uniswapRouterContract = getContract({
            //         client: client,
            //         address: process.env.NEXT_PUBLIC_UNISWAP_ROUTER as string,
            //         chain: CHAIN,
            //     });
            //     console.log({
            //         value: ethAmount.toBigInt(),
            //         token: otherToken.address,
            //         amountTokenDesired: tokenAmount.toBigInt(),
            //         amountTokenMin: tokenAmountMin.toBigInt(),
            //         amountETHMin: ethAmountMin.toBigInt(),
            //         to: activeAccount?.address,
            //         deadline: deadline,
            //     })
            //     const transaction = prepareContractCall<any, any, any>({
            //         contract: uniswapRouterContract,
            //         method: 'function addLiquidityETH(address token, uint amountTokenDesired, uint amountTokenMin, uint amountETHMin, address to, uint deadline) external payable returns (uint amountToken, uint amountETH, uint liquidity)',
            //         params: [otherToken.address, tokenAmount.toBigInt(), tokenAmountMin.toBigInt(), ethAmountMin.toBigInt(), activeAccount?.address, deadline.toString()],
            //         value: ethAmount.toBigInt(),
            //     })

            //     const transactionResult = await sendAndConfirmTransaction({
            //         transaction,
            //         account: activeAccount,
            //     })

            //     const txHash = transactionResult.transactionHash;
            //     const truncatedTxHash = txHash.slice(5, -5);

            //     setResult(<>
            //         Liquidity added successfully!
            //         <br /><a href={`https://subnets-test.avax.network/plyr/tx/${txHash}`} target="_blank">{truncatedTxHash}</a></>)
            // }
            // else {
            //     const amount0Min = amount0Desired.mul(1000 - Math.floor(slippageTolerance * 1000)).div(1000);
            //     const amount1Min = amount1Desired.mul(1000 - Math.floor(slippageTolerance * 1000)).div(1000);

            //     // Approve token0
            //     const token0Contract = getContract({
            //         chain: CHAIN,
            //         address: token0.address,
            //         client: client,
            //     });
            //     const token0Allowance = await allowance({
            //         contract: token0Contract,
            //         owner: activeAccount?.address || '',
            //         spender: process.env.NEXT_PUBLIC_UNISWAP_ROUTER as string,
            //     });

            //     if (Number(toTokens(token0Allowance, token0.decimals)) < Number(toTokens(amount0Desired.toBigInt(), token0.decimals))) {
            //         const approveTx0 = approve({
            //             contract: token0Contract,
            //             spender: process.env.NEXT_PUBLIC_UNISWAP_ROUTER as string,
            //             amount: toTokens(amount0Desired.toBigInt(), token0.decimals),
            //         });

            //         await sendAndConfirmTransaction({
            //             transaction: approveTx0,
            //             account: activeAccount,
            //         });
            //     }

            //     // Approve token1
            //     const token1Contract = getContract({
            //         chain: CHAIN,
            //         address: token1.address,
            //         client: client,
            //     });
            //     const token1Allowance = await allowance({
            //         contract: token1Contract,
            //         owner: activeAccount?.address || '',
            //         spender: process.env.NEXT_PUBLIC_UNISWAP_ROUTER as string,
            //     });

            //     if (Number(toTokens(token1Allowance, token1.decimals)) < Number(toTokens(amount1Desired.toBigInt(), token1.decimals))) {
            //         const approveTx1 = approve({
            //             contract: token1Contract,
            //             spender: process.env.NEXT_PUBLIC_UNISWAP_ROUTER as string,
            //             amount: toTokens(amount1Desired.toBigInt(), token1.decimals),
            //         });

            //         await sendAndConfirmTransaction({
            //             transaction: approveTx1,
            //             account: activeAccount,
            //         });
            //     }

            //     const uniswapRouterContract = getContract({
            //         client: client,
            //         address: process.env.NEXT_PUBLIC_UNISWAP_ROUTER as string,
            //         chain: CHAIN,
            //     });

            //     const transaction = prepareContractCall<any, any, any>({
            //         contract: uniswapRouterContract,
            //         method: 'function addLiquidity(address tokenA, address tokenB, uint amountADesired, uint amountBDesired, uint amountAMin, uint amountBMin, address to, uint deadline) external returns (uint amountA, uint amountB, uint liquidity)',
            //         params: [token0.address, token1.address, amount0Desired.toBigInt(), amount1Desired.toBigInt(), amount0Min.toBigInt(), amount1Min.toBigInt(), activeAccount?.address, deadline.toString()],
            //     });

            //     const transactionResult = await sendAndConfirmTransaction({
            //         transaction,
            //         account: activeAccount,
            //     });

            //     const txHash = transactionResult.transactionHash;
            //     const truncatedTxHash = txHash.slice(5, -5);

            //     setResult(<>
            //         Liquidity added successfully!
            //         <br /><a href={`https://subnets-test.avax.network/plyr/tx/${txHash}`} target="_blank">{truncatedTxHash}</a></>)
            // }

        } catch (error: any) {
            setError(`${error.message}`)
        }
        finally {
            setIsRemovingLiquidity(false);
        }
    }


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
                                    <div className="flex flex-row gap-2 items-center">
                                        <Image src={myLpToken.token0.logoURI} alt={myLpToken.token0.symbol} width={20} height={20} className="rounded-full w-5 h-5" />
                                        {myLpToken.token0.symbol} - {Number(toTokens(myLpToken.reserves[0], myLpToken.token0.decimals)) * myLpToken.poolShare * sliderValue[0] / 100}
                                    </div>
                                    <div className="flex flex-row gap-2 items-center">
                                        <Image src={myLpToken.token1.logoURI} alt={myLpToken.token1.symbol} width={20} height={20} className="rounded-full w-5 h-5" />
                                        {myLpToken.token1.symbol} - {Number(toTokens(myLpToken.reserves[1], myLpToken.token1.decimals)) * myLpToken.poolShare * sliderValue[0] / 100}
                                    </div>

                                    <div className="text-xl font-bold mt-4">
                                        Position decreases to:
                                    </div>
                                    <div className="text-sm text-gray-500">LP TOKENS: {Number(toTokens(myLpToken.lpTokens, 18)) - Number(toTokens(myLpToken.lpTokens, 18)) * sliderValue[0] / 100}</div>
                                    <div className="text-sm text-gray-500">POOL SHARE: {myLpToken.poolShare * 100 - (myLpToken.poolShare * 100 * sliderValue[0] / 100)}%</div>
                                </div>

                            </div>

                            <Button onClick={handleRemoveLiquidity} disabled={isRemovingLiquidity}>Remove Liquidity</Button>

                        </div>
                    )
                }

                {result && (
                    <div className="mt-4 p-4 bg-green-100 text-green-800 rounded-md">
                        <p className="text-sm">{result}</p>
                    </div>
                )}

                {error && (
                    <Alert variant="destructive" className="mt-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>
                            {error}
                        </AlertDescription>
                    </Alert>
                )}

                <div className="mt-4 w-full mx-auto">
                    <WalletButton />
                </div>
            </CardContent>
        </Card>
    )
}
