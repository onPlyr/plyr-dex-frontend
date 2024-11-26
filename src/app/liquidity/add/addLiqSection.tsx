"use client";
import { useEffect, useState } from 'react'
// import { Token, Fetcher } from '@uniswap/sdk'
// import { Pair, } from 'custom-uniswap-v2-sdk'
import Image from 'next/image'
import { Token, Fetcher, Pair, Trade, Route, TokenAmount, Fraction } from '@plyrnetwork/plyrswap-sdk'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useActiveAccount, useActiveWallet, useWalletBalance } from 'thirdweb/react';
import { totalSupply } from "thirdweb/extensions/erc20";
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

//import { tokenList } from '@/config/tokenlist';

const CHAIN_ID = process.env.NEXT_PUBLIC_NETWORK_TYPE === 'mainnet' ? 16180 : 62831;
const CHAIN = process.env.NEXT_PUBLIC_NETWORK_TYPE === 'mainnet' ? phiChain : tauChain;



export default function addLiqSection({ tokenList }: { tokenList: any[] }) {

    const activeWallet = useActiveWallet();
    const activeAccount = useActiveAccount();

    const params = useSearchParams();
    const currencyA = params.get('currencyA');
    const currencyB = params.get('currencyB');

    const [token0, setToken0] = useState(currencyA ? tokenList?.find(t => t.symbol === currencyA || t.address.toLowerCase() === currencyA.toLowerCase()) || tokenList?.find(t => t.symbol === 'PLYR') : tokenList?.find(t => t.symbol === 'PLYR'))
    const [token1, setToken1] = useState(currencyB ? tokenList?.find(t => t.symbol === currencyB || t.address.toLowerCase() === currencyB.toLowerCase()) || tokenList?.find(t => t.symbol === 'GAMR') : tokenList?.find(t => t.symbol === 'GAMR'))

    console.log('token0', token0)
    console.log('token1', token1)


    const [pair, setPair] = useState<Pair | null>(null)
    const [poolShareInfo, setPoolShareInfo] = useState<any>({
        tokenatob: 0,
        tokenbtoa: 0,
        sharePercent: 0,
    })
    const [amount0, setAmount0] = useState('')
    const [amount1, setAmount1] = useState('')
    const [result, setResult] = useState<React.ReactNode | null>(null)
    const [error, setError] = useState('')
    const [info, setInfo] = useState('')

    const [isLoading, setIsLoading] = useState(false);
    const [isAddingLiquidity, setIsAddingLiquidity] = useState(false);

    // Get my balance //
    const { data: myBalance0, isLoading: isLoadingBalance0 } = useWalletBalance({
        chain: CHAIN,
        client: client,
        address: activeAccount?.address,
        tokenAddress: token0.address !== '0x0000000000000000000000000000000000000000' ? token0.address : undefined,
    }, {
        refetchInterval: 3000,
    })

    const { data: myBalance1, isLoading: isLoadingBalance1 } = useWalletBalance({
        chain: CHAIN,
        client: client,
        address: activeAccount?.address,
        tokenAddress: token1.address !== '0x0000000000000000000000000000000000000000' ? token1.address : undefined,
    }, {
        refetchInterval: 3000,

    })

    console.log('myBalance0', myBalance0)
    console.log('myBalance1', myBalance1)


    const handlePairData = async () => {

        if (token0.symbol === token1.symbol) {
            setError('Tokens cannot be the same')
            return
        }

        setIsLoading(true);
        // if (allPairs.length === 0) {
        //     return
        // }

        setError('')
        setInfo('')


        const Token0 = token0.symbol === 'PLYR'
            ? new Token(CHAIN_ID, process.env.NEXT_PUBLIC_UNISWAP_WPLYR || '', 18, 'WPLYR')
            : new Token(CHAIN_ID, token0.address, token0.decimals, token0.symbol);

        const Token1 = token1.symbol === 'PLYR'
            ? new Token(CHAIN_ID, process.env.NEXT_PUBLIC_UNISWAP_WPLYR || '', 18, 'WPLYR')
            : new Token(CHAIN_ID, token1.address, token1.decimals, token1.symbol);

        try {
            const provider = await ethers5Adapter.provider.toEthers({ client: client, chain: CHAIN });
            const pair = await Fetcher.fetchPairData(Token0, Token1, provider);
            const price0 = pair.priceOf(Token0)
            const price1 = pair.priceOf(Token1)
            const poolShareInfo = {
                tokenatob: price0.toSignificant(6),
                tokenbtoa: price1.toSignificant(6),
                sharePercent: 0,
            }
            console.log('poolShareInfo', poolShareInfo)
            setPoolShareInfo(poolShareInfo)
            setPair(pair);
            setInfo('');
        }
        catch (error: any) {
            setPoolShareInfo({
                tokenatob: 0,
                tokenbtoa: 0,
                sharePercent: 100,
            })
            setPair(null);
            setInfo(`You're the first to add liquidity to this pair!`)
        }
        finally {
            setIsLoading(false);
            setAmount0('');
            setAmount1('');
        }
    }

    useEffect(() => {
        if (!token0.address || !token1.address) {
            return;
        }

        handlePairData();

    }, [token0, token1]) // allPairs

    const handleAmountChange = async (input: number, value: string) => {
        if (value === '' || Number(value) <= 0) {
            //setAmount0('');
            //setAmount1('');
            setError('Invalid amount')
            return;
        }

        if (!token0.address || !token1.address) {
            return;
        }

        // Can enter any amount if pair is not found
        if (!pair) {
            return;
        }

        // Parse to Token object
        const Token0 = token0.symbol === 'PLYR'
            ? new Token(CHAIN_ID, process.env.NEXT_PUBLIC_UNISWAP_WPLYR || '', 18, 'WPLYR')
            : new Token(CHAIN_ID, token0.address, token0.decimals, token0.symbol);

        const Token1 = token1.symbol === 'PLYR'
            ? new Token(CHAIN_ID, process.env.NEXT_PUBLIC_UNISWAP_WPLYR || '', 18, 'WPLYR')
            : new Token(CHAIN_ID, token1.address, token1.decimals, token1.symbol);


        try {
            const inputAmount = new TokenAmount(input === 0 ? Token0 : Token1, ethers.utils.parseUnits(value, input === 0 ? token0.decimals : token1.decimals).toString());
            const price = pair.priceOf(input === 0 ? Token0 : Token1);
            const outputAmount = inputAmount.multiply(price);

            const newAmount0 = input === 0 ? inputAmount.toExact() : outputAmount.toSignificant(99);
            const newAmount1 = input === 1 ? inputAmount.toExact() : outputAmount.toSignificant(99);
            setAmount0(newAmount0);
            setAmount1(newAmount1);


            /// Calculate share of pool in percent
            const reserve0 = pair.reserve0;
            const reserve1 = pair.reserve1;

            const newReserve = inputAmount.token.symbol === reserve0.token.symbol ? reserve0.add(inputAmount) : reserve1.add(inputAmount);

            let sharePercent = inputAmount.divide(newReserve).multiply(BigInt(100)).toSignificant(4);

            setPoolShareInfo((prevInfo: any) => ({
                ...prevInfo,
                sharePercent: Number(sharePercent),
            }));


            if (Number(newAmount0) > Number(myBalance0?.displayValue || 0) || Number(newAmount1) > Number(myBalance1?.displayValue || 0)) {
                setError('Insufficient balance')
            }
            else {
                setError('');
            }
        }
        catch (error: any) {

            setError(error.message)
        }

    }

    const handleAddLiquidity = async (e: React.FormEvent) => {

        e.preventDefault()
        e.stopPropagation()

        if (isAddingLiquidity) return;

        if (!activeAccount || !activeWallet) {
            setError('Please connect your wallet first')
            return
        }



        setResult(null)
        setError('')

        if (token0.address === undefined || token1.address === undefined) {
            setError('Invalid token address');
            return
        }

        setIsAddingLiquidity(true);

        const Token0 = new Token(CHAIN_ID, token0.address, token0.decimals, token0.symbol)
        const Token1 = new Token(CHAIN_ID, token1.address, token1.decimals, token1.symbol)

        // Use the SDK provider to get the reserves
        const pairAddress = Pair.getAddress(Token0 as any, Token1 as any)

        console.log(Token0, Token1, process.env.NEXT_PUBLIC_UNISWAP_FACTORY, process.env.NEXT_PUBLIC_UNISWAP_INIT_CODE_HASH)

        console.log(pairAddress)


        try {
            const isEthPair = token0.symbol === 'PLYR' || token1.symbol === 'PLYR'
            const ethToken = token0.symbol === 'PLYR' ? token0 : token1
            const otherToken = token0.symbol === 'PLYR' ? token1 : token0

            const amount0Desired = ethers.utils.parseUnits(amount0, token0.decimals)
            console.log(amount0Desired.toString())
            const amount1Desired = ethers.utils.parseUnits(amount1, token1.decimals)
            console.log(amount1Desired.toString())
            const deadline = Math.floor(Date.now() / 1000) + 60 * 20 // 20 minutes from now

            const slippageTolerance = 0.005 // 0.5%

            let tx;
            if (isEthPair) {
                const ethAmount = ethToken === token0 ? amount0Desired : amount1Desired
                const tokenAmount = ethToken === token0 ? amount1Desired : amount0Desired
                const tokenAmountMin = tokenAmount.mul(1000 - Math.floor(slippageTolerance * 1000)).div(1000)
                const ethAmountMin = ethAmount.mul(1000 - Math.floor(slippageTolerance * 1000)).div(1000)

                // Approve other erc20 token //
                if (!otherToken.address) {
                    setError('Invalid token address')
                    return
                }
                const erc20Contract = getContract({
                    chain: CHAIN,
                    address: otherToken.address,
                    client: client
                });
                const result = await allowance({
                    contract: erc20Contract,
                    owner: activeAccount?.address || '',
                    spender: process.env.NEXT_PUBLIC_UNISWAP_ROUTER as string,
                })

                console.log('result', result);

                console.log('allowance', Number(toTokens(result, otherToken.decimals)), Number(toTokens(tokenAmount.toBigInt(), otherToken.decimals)));

                if (Number(toTokens(result, otherToken.decimals)) < Number(toTokens(tokenAmount.toBigInt(), otherToken.decimals))) {
                    const approveTx = approve({
                        contract: erc20Contract,
                        spender: process.env.NEXT_PUBLIC_UNISWAP_ROUTER as string,
                        amount: toTokens(tokenAmount.toBigInt(), otherToken.decimals),
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
                console.log('addLiquidityETH', {
                    value: ethAmount.toBigInt(),
                    token: otherToken.address,
                    amountTokenDesired: tokenAmount.toBigInt(),
                    amountTokenMin: tokenAmountMin.toBigInt(),
                    amountETHMin: ethAmountMin.toBigInt(),
                    to: activeAccount?.address,
                    deadline: deadline,
                })
                const transaction = prepareContractCall<any, any, any>({
                    contract: uniswapRouterContract,
                    method: 'function addLiquidityETH(address token, uint amountTokenDesired, uint amountTokenMin, uint amountETHMin, address to, uint deadline) external payable returns (uint amountToken, uint amountETH, uint liquidity)',
                    params: [otherToken.address, tokenAmount.toBigInt(), tokenAmountMin.toBigInt(), ethAmountMin.toBigInt(), activeAccount?.address, deadline.toString()],
                    value: ethAmount.toBigInt(),
                })

                const transactionResult = await sendAndConfirmTransaction({
                    transaction,
                    account: activeAccount,
                })

                const txHash = transactionResult.transactionHash;
                const truncatedTxHash = txHash.slice(5, -5);

                setResult(<>
                    Liquidity added successfully!
                    <br /><a href={`${process.env.NEXT_PUBLIC_EXPLORER_URL}/tx/${txHash}`} target="_blank">{truncatedTxHash}</a></>)
            }
            else {
                const amount0Min = amount0Desired.mul(1000 - Math.floor(slippageTolerance * 1000)).div(1000);
                const amount1Min = amount1Desired.mul(1000 - Math.floor(slippageTolerance * 1000)).div(1000);

                // Approve token0
                const token0Contract = getContract({
                    chain: CHAIN,
                    address: token0.address,
                    client: client,
                });
                const token0Allowance = await allowance({
                    contract: token0Contract,
                    owner: activeAccount?.address || '',
                    spender: process.env.NEXT_PUBLIC_UNISWAP_ROUTER as string,
                });

                if (Number(toTokens(token0Allowance, token0.decimals)) < Number(toTokens(amount0Desired.toBigInt(), token0.decimals))) {
                    const approveTx0 = approve({
                        contract: token0Contract,
                        spender: process.env.NEXT_PUBLIC_UNISWAP_ROUTER as string,
                        amount: toTokens(amount0Desired.toBigInt(), token0.decimals),
                    });

                    await sendAndConfirmTransaction({
                        transaction: approveTx0,
                        account: activeAccount,
                    });
                }

                // Approve token1
                const token1Contract = getContract({
                    chain: CHAIN,
                    address: token1.address,
                    client: client,
                });
                const token1Allowance = await allowance({
                    contract: token1Contract,
                    owner: activeAccount?.address || '',
                    spender: process.env.NEXT_PUBLIC_UNISWAP_ROUTER as string,
                });

                if (Number(toTokens(token1Allowance, token1.decimals)) < Number(toTokens(amount1Desired.toBigInt(), token1.decimals))) {
                    const approveTx1 = approve({
                        contract: token1Contract,
                        spender: process.env.NEXT_PUBLIC_UNISWAP_ROUTER as string,
                        amount: toTokens(amount1Desired.toBigInt(), token1.decimals),
                    });

                    await sendAndConfirmTransaction({
                        transaction: approveTx1,
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
                    method: 'function addLiquidity(address tokenA, address tokenB, uint amountADesired, uint amountBDesired, uint amountAMin, uint amountBMin, address to, uint deadline) external returns (uint amountA, uint amountB, uint liquidity)',
                    params: [token0.address, token1.address, amount0Desired.toBigInt(), amount1Desired.toBigInt(), amount0Min.toBigInt(), amount1Min.toBigInt(), activeAccount?.address, deadline.toString()],
                });

                const transactionResult = await sendAndConfirmTransaction({
                    transaction,
                    account: activeAccount,
                });

                const txHash = transactionResult.transactionHash;
                const truncatedTxHash = txHash.slice(5, -5);

                setResult(<>
                    Liquidity added successfully!
                    <br /><a href={`${process.env.NEXT_PUBLIC_EXPLORER_URL}/tx/${txHash}`} target="_blank">{truncatedTxHash}</a></>)
            }

        } catch (error: any) {
            setError(`${error.message}`)
        }
        finally {
            setIsAddingLiquidity(false);
        }
    }

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle>Add Liquidity</CardTitle>
                <CardDescription>Select tokens and enter amounts to add liquidity. New pairs will be created automatically if they don't exist.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleAddLiquidity} className="flex flex-col gap-4">
                    <div className="flex flex-col">
                        <div className="flex flex-row justify-between">
                            <div className="text-sm uppercase">Token A</div>
                            <button onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                setAmount0(myBalance0?.displayValue || '');
                                handleAmountChange(0, myBalance0?.displayValue || '');
                            }} className="text-xs uppercase">Balance: {myBalance0 ? <NumericFormat
                                value={toTokens(myBalance0.value, token0.decimals)}
                                displayType={"text"}
                                thousandSeparator={true}
                                decimalScale={4}
                                className="leading-none"
                            /> : '0'}
                            </button>
                        </div>
                        <div className="flex flex-row gap-2">
                            <Select value={token0.symbol} onValueChange={(value) => {
                                if (token1.symbol === value) {
                                    setToken1(token0)
                                }
                                setToken0(tokenList.find(t => t.symbol === value)!)
                            }}>
                                <SelectTrigger className="w-48" id="token0">
                                    <SelectValue placeholder="Select token" />
                                </SelectTrigger>
                                <SelectContent>
                                    {tokenList?.map((token: any) => (
                                        <SelectItem key={token.address} value={token.symbol}>
                                            <div className="flex flex-row gap-2 items-center">
                                                <Image src={token.logoURI} alt={token.symbol} width={20} height={20} className="rounded-full w-5 h-5" />
                                                {token.symbol}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Input
                                id="amount0"
                                type="text"
                                value={amount0}
                                disabled={token0.symbol === token1.symbol || isLoading}
                                onChange={(e) => {
                                    setAmount0(e.target.value);
                                    handleAmountChange(0, e.target.value);
                                }}
                                //onBlur={(e) => handleAmountChange(0, e.target.value)}
                                placeholder="0.0"
                                required
                            />
                        </div>
                    </div>

                    <div className="flex flex-col">
                        <div className="flex flex-row gap-2 justify-between">
                            <div className="text-sm uppercase">Token B</div>
                            <button onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                setAmount1(myBalance1?.displayValue || '');
                                handleAmountChange(1, myBalance1?.displayValue || '');
                            }} className="text-xs uppercase">Balance: {myBalance1 ? <NumericFormat
                                value={toTokens(myBalance1.value, token1.decimals)}
                                displayType={"text"}
                                thousandSeparator={true}
                                decimalScale={4}
                                className="leading-none"
                            /> : '0'}
                            </button>
                        </div>
                        <div className="flex flex-row gap-2">
                            <Select value={token1.symbol} onValueChange={(value) => {
                                if (token0.symbol === value) {
                                    setToken0(token1)
                                }
                                setToken1(tokenList.find(t => t.symbol === value)!)
                            }}>
                                <SelectTrigger className="w-48" id="token1">
                                    <SelectValue placeholder="Select token" />
                                </SelectTrigger>
                                <SelectContent>
                                    {tokenList?.map((token: any) => (
                                        <SelectItem key={token.address} value={token.symbol}>
                                            <div className="flex flex-row gap-2 items-center">
                                                <Image src={token.logoURI} alt={token.symbol} width={20} height={20} className="rounded-full w-5 h-5" />
                                                {token.symbol}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Input
                                id="amount1"
                                type="text"
                                value={amount1}
                                disabled={token0.symbol === token1.symbol || isLoading}
                                onChange={(e) => {
                                    setAmount1(e.target.value);
                                    handleAmountChange(1, e.target.value);
                                }}
                                placeholder="0.0"
                                required
                            />
                        </div>
                    </div>
                    {

                        (token0 && token1) &&
                        <>
                            <div className="mt-4 text-sm uppercase">Price and Share</div>
                            <div className="flex flex-row gap-2 w-full">
                                <div className="flex flex-1 flex-col font-bold">
                                    {poolShareInfo.tokenatob}
                                    <div className="text-xs">{token1.symbol} per {token0.symbol}</div>
                                </div>
                                <div className="flex flex-1 flex-col font-bold">
                                    {poolShareInfo.tokenbtoa}
                                    <div className="text-xs">{token0.symbol} per {token1.symbol}</div>
                                </div>
                                <div className="flex flex-1 flex-col font-bold">
                                    {poolShareInfo.sharePercent}
                                    <div className="text-xs">Share %</div>
                                </div>
                            </div>
                        </>
                    }

                    <Button type="submit" className="w-full mt-4" disabled={isLoading || isAddingLiquidity || token0.symbol === token1.symbol || amount0 === '' || amount1 === '' || Number(amount0) > Number(myBalance0?.displayValue || 0) || Number(amount1) > Number(myBalance1?.displayValue || 0)}>{isAddingLiquidity ? 'Adding Liquidity...' : 'Add Liquidity'}</Button>
                </form>

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

                {info && (
                    <div className="mt-4 p-4 bg-blue-100 text-blue-800 rounded-md">
                        <p className="text-sm">{info}</p>
                    </div>
                )}

                <div className="mt-4 w-full mx-auto">
                    <WalletButton />
                </div>

            </CardContent>
        </Card>

    )
}