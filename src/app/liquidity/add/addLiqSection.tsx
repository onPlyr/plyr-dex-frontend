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
import { useActiveAccount, useActiveWallet, useActiveWalletChain, useConnectModal, useSetActiveWallet, useSwitchActiveWalletChain, useWalletBalance } from 'thirdweb/react';
import { totalSupply } from "thirdweb/extensions/erc20";

import { client, tauChain, phiChain } from '@/lib/thirdweb_client';

import { AlertCircle, Info, PiggyBank, SquarePlus } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

import { NumericFormat } from "react-number-format";

import { ethers } from "ethers";
import { defineChain, getContract, prepareContractCall, readContract, sendAndConfirmTransaction, toEther, toTokens, toUnits, toWei } from 'thirdweb';
import { allowance, approve, transfer } from "thirdweb/extensions/erc20";

import { ethers5Adapter } from "thirdweb/adapters/ethers5";
import { useSearchParams } from 'next/navigation';

import { BigNumber } from 'bignumber.js';

import { useAccount, useDisconnect, useSwitchChain, useWalletClient } from 'wagmi';
import { viemAdapter } from "thirdweb/adapters/viem";
import { createWalletAdapter, Wallet, WalletId } from "thirdweb/wallets";

//import { tokenList } from '@/config/tokenlist';

const CHAIN_ID = process.env.NEXT_PUBLIC_NETWORK_TYPE === 'mainnet' ? 16180 : 62831;
const CHAIN = process.env.NEXT_PUBLIC_NETWORK_TYPE === 'mainnet' ? phiChain : tauChain;

import { FastAverageColor } from 'fast-average-color';
import { useToast } from '@/components/ui/use-toast';
import { usePreviousActiveWallet } from '@/store/previousActiveWallet';
import { wallets } from '@/config/wallet';

export default function addLiqSection({ tokenList }: { tokenList: any[] }) {

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
                    walletClient: walletClient,
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
    }, [walletClient]);


    useEffect(() => {
        const disconnectIfNeeded = async () => {
            if (thirdwebWallet && wagmiAccount.status === "disconnected") {
                //alert('disconnecting')
                await thirdwebWallet?.disconnect();
            }
        };
        disconnectIfNeeded();
    }, [wagmiAccount, thirdwebWallet]);

    const { toast } = useToast();

    const params = useSearchParams();
    const currencyA = params.get('currencyA');
    const currencyB = params.get('currencyB');

    const [token0, setToken0] = useState(currencyA ? tokenList?.find(t => t.symbol === currencyA || t.address.toLowerCase() === currencyA.toLowerCase()) || tokenList?.find(t => t.symbol === 'PLYR') : tokenList?.find(t => t.symbol === 'PLYR'))
    const [token1, setToken1] = useState(currencyB ? tokenList?.find(t => t.symbol === currencyB || t.address.toLowerCase() === currencyB.toLowerCase()) || tokenList?.find(t => t.symbol === 'GAMR') : tokenList?.find(t => t.symbol === 'GAMR'))


    const [token0Color, setToken0Color] = useState<string | null>(null)
    const [token1Color, setToken1Color] = useState<string | null>(null)

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

    useEffect(() => {
        if (!token0.address || !token1.address) {
            return;
        }
        handlePairData();
        // Set token colors
        const fac = new FastAverageColor();
        fac.getColorAsync(token0.logoURI)
            .then(color => {
                setToken0Color(color.hex);
            })
            .catch(e => {
                console.log(e);
            });
        fac.getColorAsync(token1.logoURI)
            .then(color => {
                setToken1Color(color.hex);
            })
            .catch(e => {
                console.log(e);
            });
    }, [token0, token1])

    const handlePairData = async () => {

        setIsLoading(true);
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

        if (token0.symbol === token1.symbol) {
            toast({
                title: 'Tokens cannot be the same',
                description: 'Please select different tokens',
                variant: 'destructive',
            })
            return
        }

        handlePairData();

    }, [token0, token1]) // allPairs

    const handleAmountChange = async (input: number, value: string) => {

        if (!activeAccount || !activeWallet) {
            setError('Please connect your wallet')
            return;
        }



        if (value[value.length - 1] !== '.') {
            if (value === '' || Number(value) <= 0) {
                setError('Invalid amount')
                if (input === 0) {
                    setAmount1('')
                }
                else {
                    setAmount0('')
                }
                return;
            }
        }

        setError('')

        //alert(value)

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

            const newAmount0 = input === 0 ? inputAmount.toExact() : outputAmount.toSignificant(token0.decimals);
            const newAmount1 = input === 1 ? inputAmount.toExact() : outputAmount.toSignificant(token1.decimals);

            if (input === 0) {
                setAmount1(newAmount1);
            }
            else {
                setAmount0(newAmount0);
            }


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

        }
        catch (error: any) {
            setError('Unknown Error')
        }

    }

    const handleAddLiquidity = async (e: React.FormEvent) => {

        e.preventDefault()
        e.stopPropagation()

        if (isAddingLiquidity) return;

        if (!activeAccount || !activeWallet) {
            return
        }

        if (activeChain?.id !== CHAIN_ID) {
            return
        }

        setResult(null)

        if (token0.address === undefined || token1.address === undefined) {
            toast({
                title: 'Error',
                description: 'Invalid token address',
                variant: 'destructive',
            })
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

            const amount0Desired = BigNumber(amount0)
            const amount1Desired = BigNumber(amount1)

            console.log('amount0Desired', amount0Desired.toString())
            console.log('amount1Desired', amount1Desired.toString())
            const deadline = Math.floor(Date.now() / 1000) + 60 * 20 // 20 minutes from now

            const slippageTolerance = 0.005 // 0.5%

            let tx;
            if (isEthPair) {
                const ethAmount = ethToken === token0 ? amount0Desired : amount1Desired
                const tokenAmount = ethToken === token0 ? amount1Desired : amount0Desired
                const tokenAmountDecimals = ethToken === token0 ? token1.decimals : token0.decimals
                const tokenAmountMin = tokenAmount.multipliedBy(1000 - Math.floor(slippageTolerance * 1000)).dividedBy(1000)
                const ethAmountMin = ethAmount.multipliedBy(1000 - Math.floor(slippageTolerance * 1000)).dividedBy(1000)

                // Approve other erc20 token //
                if (!otherToken.address) {
                    toast({
                        title: 'Error',
                        description: 'Invalid token address',
                        variant: 'destructive',
                    })
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

                console.log('tokenAmount', tokenAmount.toString())

                if (BigNumber(toTokens(result, otherToken.decimals)).lt(tokenAmount)) {
                    const approveTx = approve({
                        contract: erc20Contract,
                        spender: process.env.NEXT_PUBLIC_UNISWAP_ROUTER as string,
                        amount: tokenAmount.toString(),
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
                    value: ethAmount.toString(),
                    token: otherToken.address,
                    amountTokenDesired: tokenAmount.toString(),
                    amountTokenMin: tokenAmountMin.toString(),
                    amountETHMin: ethAmountMin.toString(),
                    to: activeAccount?.address,
                    deadline: deadline,
                })
                const transaction = prepareContractCall<any, any, any>({
                    contract: uniswapRouterContract,
                    method: 'function addLiquidityETH(address token, uint amountTokenDesired, uint amountTokenMin, uint amountETHMin, address to, uint deadline) external payable returns (uint amountToken, uint amountETH, uint liquidity)',
                    params: [otherToken.address, toUnits(tokenAmount.toString(), tokenAmountDecimals), toUnits(tokenAmountMin.toString(), tokenAmountDecimals), toUnits(ethAmountMin.toString(), 18), activeAccount?.address, deadline.toString()],
                    value: toUnits(ethAmount.toString(), 18),
                })

                const transactionResult = await sendAndConfirmTransaction({
                    transaction,
                    account: activeAccount,
                })

                const txHash = transactionResult.transactionHash;
                const truncatedTxHash = `${txHash.slice(0, 5)}...${txHash.slice(-5)}`;


                toast({
                    title: 'Liquidity added successfully!',
                    description:
                        <>
                            <strong>Added:</strong> {amount0} {token0.symbol} and {amount1} {token1.symbol}
                            <br />
                            <strong>TxHash:</strong> <a href={`${process.env.NEXT_PUBLIC_EXPLORER_URL}/tx/${txHash}`} target="_blank">{truncatedTxHash}</a>
                        </>
                })

                setAmount0('')
                setAmount1('')

            }
            else {
                const amount0Min = amount0Desired.multipliedBy(1000 - Math.floor(slippageTolerance * 1000)).dividedBy(1000);
                const amount1Min = amount1Desired.multipliedBy(1000 - Math.floor(slippageTolerance * 1000)).dividedBy(1000);

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


                if (BigNumber(toTokens(token0Allowance, otherToken.decimals)).lt(amount0Desired)) {
                    const approveTx0 = approve({
                        contract: token0Contract,
                        spender: process.env.NEXT_PUBLIC_UNISWAP_ROUTER as string,
                        amount: amount0Desired.toString(),
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

                if (BigNumber(toTokens(token1Allowance, otherToken.decimals)).lt(amount1Desired)) {
                    const approveTx1 = approve({
                        contract: token1Contract,
                        spender: process.env.NEXT_PUBLIC_UNISWAP_ROUTER as string,
                        amount: amount1Desired.toString(),
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
                    params: [token0.address, token1.address, toUnits(amount0Desired.toString(), token0.decimals), toUnits(amount1Desired.toString(), token1.decimals), toUnits(amount0Min.toString(), token0.decimals), toUnits(amount1Min.toString(), token1.decimals), activeAccount?.address, deadline.toString()],
                });

                const transactionResult = await sendAndConfirmTransaction({
                    transaction,
                    account: activeAccount,
                });

                const txHash = transactionResult.transactionHash;
                const truncatedTxHash = txHash.slice(5, -5);


                toast({
                    title: 'Liquidity added successfully!',
                    description: <a href={`${process.env.NEXT_PUBLIC_EXPLORER_URL}/tx/${txHash}`} target="_blank">{truncatedTxHash}</a>,
                })
            }

        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message,
                variant: 'destructive',
            })
        }
        finally {
            setIsAddingLiquidity(false);
        }
    }

    return (
        <>
            <section className="w-full flex flex-col items-center justify-center py-8 space-y-2 ">

                <Card className="w-full max-w-3xl mx-auto bg-[#ffffff0d] rounded-3xl border-none p-8">
                    <div className="flex flex-col items-start justify-center">
                        <div className="text-white text-4xl font-black leading-none" style={{ fontFamily: 'var(--font-road-rage)' }}>LIQUIDITY</div>
                        <div className="text-white text-4xl font-black leading-none" style={{ fontFamily: 'var(--font-road-rage)' }}>BUILDER</div>
                        <div className="flex flex-row gap-2 mt-4">
                            <a className="flex flex-row items-center justify-center text-white text-[10px] leading-none uppercase px-3 py-1.5 rounded-full shadow-grow-gray bg-black hover:scale-105 transition-transform duration-300" href="/liquidity/manage">Read DOC</a>
                            <a className="flex flex-row items-center justify-center text-white text-[10px] leading-none uppercase px-3 py-1.5 rounded-full shadow-grow-gray bg-black hover:scale-105 transition-transform duration-300" href="/liquidity/manage">My Positions</a>
                        </div>
                    </div>
                </Card>
                {info && (<Card className="w-full flex flex-row items-center gap-2 max-w-3xl mx-auto bg-[#ffffff0d] rounded-3xl border-none p-6">
                    <Info className="min-w-8 min-h-8 text-[#daff00]" />
                    <div className="text-lg text-white">{info}</div>
                </Card>
                )}
                <div className="w-full flex md:flex-row flex-col gap-2 max-w-3xl mx-auto">
                    {/* Add Liquidity */}
                    <Card className="w-full bg-[#ffffff0d] rounded-3xl border-none p-6">
                        <div className="flex flex-col">
                            <div className="text-lg font-bold leading-none text-white">CREATE YOUR LIQUIDITY PAIR</div>
                            <div className="text-xs text-[#9B9A98]">Select tokens and enter amounts to add liquidity. New pairs will be created automatically if they don't exist.</div>
                        </div>
                        <div className="flex flex-col mt-4 gap-4">
                            <form onSubmit={handleAddLiquidity} className="flex flex-col gap-4">
                                {/* Token A */}
                                <div className="flex flex-col">
                                    <div className="flex flex-row justify-between">
                                        <div className="text-sm uppercase text-[#9B9A98] ml-3">Token A</div>

                                    </div>
                                    <div className="flex flex-row gap-2 items-center">
                                        <Select value={token0.symbol} onValueChange={(value) => {
                                            if (token1.symbol === value) {
                                                setToken1(token0)
                                            }
                                            setToken0(tokenList.find(t => t.symbol === value)!)
                                        }}>
                                            <SelectTrigger className="w-48 bg-[#3A3935] text-white border-none h-12 rounded-xl" id="token0">
                                                <SelectValue placeholder="SELECT TOKEN" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-[#3A3935] text-white border-none">
                                                {tokenList?.map((token: any) => (
                                                    <SelectItem key={token.address} value={token.symbol}>
                                                        <div className="flex flex-row gap-2 items-center">
                                                            <Image src={token.logoURI} alt={token.symbol} width={28} height={28} className="rounded-full w-7 h-7" />
                                                            {token.symbol}
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <div className="w-full flex flex-col gap-1 justify-center items-start">
                                            <Input
                                                id="amount0"
                                                type="text"
                                                value={amount0}
                                                disabled={token0.symbol === token1.symbol || isLoading}
                                                onChange={(e) => {
                                                    setAmount0(e.target.value);
                                                    handleAmountChange(0, e.target.value);
                                                }}
                                                placeholder="0.0"
                                                required
                                                className={`bg-transparent text-xl rounded-none border-[#9B9A98] border-b-1 border-t-0 border-r-0 border-l-0  !ring-offset-0 focus:!ring-offset-0 focus-visible:!ring-0 focus-visible:!outline-none h-6 px-0 !outline-none !ring-0 placeholder:text-[#9B9A98] ${token0.symbol === token1.symbol || Number(amount0) > Number(myBalance0?.displayValue || 0) ? 'text-red-500' : 'text-white'}`}
                                            />
                                            <button onClick={(e) => {
                                                e.preventDefault()
                                                e.stopPropagation()
                                                setAmount0(myBalance0?.displayValue || '');
                                                handleAmountChange(0, myBalance0?.displayValue || '');
                                            }} className="text-[10px] uppercase text-white font-bold">
                                                <span className="font-light">Balance:</span> {myBalance0 ? <NumericFormat
                                                    value={toTokens(myBalance0.value, token0.decimals)}
                                                    displayType={"text"}
                                                    thousandSeparator={true}
                                                    decimalScale={4}
                                                    suffix={' ' + token0.symbol}
                                                    className="leading-none"
                                                /> : '0 ' + token0.symbol}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Token B */}
                                <div className="flex flex-col">
                                    <div className="flex flex-row justify-between">
                                        <div className="text-sm uppercase text-[#9B9A98] ml-3">Token B</div>
                                    </div>
                                    <div className="flex flex-row gap-2 items-center">
                                        <Select value={token1.symbol} onValueChange={(value) => {
                                            if (token0.symbol === value) {
                                                setToken0(token1)
                                            }
                                            setToken1(tokenList.find(t => t.symbol === value)!)
                                        }}>
                                            <SelectTrigger className="w-48 bg-[#3A3935] text-white border-none h-12 rounded-xl" id="token1">
                                                <SelectValue placeholder="SELECT TOKEN" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {tokenList?.map((token: any) => (
                                                    <SelectItem key={token.address} value={token.symbol}>
                                                        <div className="flex flex-row gap-2 items-center">
                                                            <Image src={token.logoURI} alt={token.symbol} width={28} height={28} className="rounded-full w-7 h-7" />
                                                            {token.symbol}
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <div className="w-full flex flex-col gap-1 justify-center items-start">
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
                                                className={`bg-transparent text-xl rounded-none border-[#9B9A98] border-b-1 border-t-0 border-r-0 border-l-0  !ring-offset-0 focus:!ring-offset-0 focus-visible:!ring-0 focus-visible:!outline-none h-6 px-0 !outline-none !ring-0 placeholder:text-[#9B9A98] ${token0.symbol === token1.symbol || Number(amount1) > Number(myBalance1?.displayValue || 0) ? 'text-red-500' : 'text-white'}`}
                                            />
                                            <button onClick={(e) => {
                                                e.preventDefault()
                                                e.stopPropagation()
                                                setAmount1(myBalance1?.displayValue || '');
                                                handleAmountChange(1, myBalance1?.displayValue || '');
                                            }} className="text-[10px] uppercase text-white font-bold">
                                                <span className="font-light">Balance:</span> {myBalance1 ? <NumericFormat
                                                    value={toTokens(myBalance1.value, token1.decimals)}
                                                    displayType={"text"}
                                                    thousandSeparator={true}
                                                    decimalScale={4}
                                                    suffix={' ' + token1.symbol}
                                                    className="leading-none "
                                                /> : '0 ' + token1.symbol}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/*Disclaimer*/}
                                <div className="text-xs text-[#9B9A98]">
                                    <div className="font-bold uppercase">Disclaimer</div>
                                    <div className="text-[10px] leading-none">This is a demo app. Liquidity will not be added to the pool. The tokens will be displayed in the pool.</div>
                                </div>

                                {
                                    activeChain?.id === CHAIN_ID && activeWallet ? <Button type="submit" className="relative w-full rounded-xl font-bold mt-4 uppercase text-white bg-black hover:bg-black shadow-grow-gray hover:scale-105 transition-transform duration-300" disabled={isLoading || isAddingLiquidity || token0.symbol === token1.symbol || amount0 === '' || amount1 === '' || Number(amount0) > Number(myBalance0?.displayValue || 0) || Number(amount1) > Number(myBalance1?.displayValue || 0)}>
                                        {
                                            (!isAddingLiquidity && !error) && <SquarePlus className="min-w-8 min-h-8 absolute left-2 top-1/2 transform -translate-y-1/2 text-[#daff00]" />
                                        }
                                        {isAddingLiquidity ? 'Providing Liquidity...' : error ? error : 'Provide Liquidity'}
                                    </Button> :
                                        !activeWallet ?
                                            <Button disabled className="relative w-full rounded-xl font-bold mt-4 uppercase text-white bg-black hover:bg-black shadow-grow-gray hover:scale-105 transition-transform duration-300">PLEASE CONNECT WALLET</Button>

                                            :
                                            <Button onClick={(e) => {
                                                e.preventDefault()
                                                e.stopPropagation()
                                                switchChain(CHAIN);
                                            }} className="relative w-full rounded-xl font-bold mt-4 uppercase text-white bg-black hover:bg-black shadow-grow-gray hover:scale-105 transition-transform duration-300">SWITCH TO PLYR NETWORK</Button>
                                }
                            </form>



                            {result && (
                                <div className="mt-4 p-4 bg-green-100 text-green-800 rounded-md">
                                    <p className="text-sm">{result}</p>
                                </div>
                            )}

                        </div>
                    </Card>
                    {/* Summarize */}
                    <Card className="relative w-full flex flex-row h-96 md:h-auto bg-[#ffffff0d] rounded-3xl border-none">
                        {/*LEFT RIGTH BG*/}
                        <div className="flex-1 h-full rounded-l-3xl flex flex-col items-center justify-between" style={{ background: token0Color || '#000000' }}>
                        </div>
                        <div className="flex-1 h-full rounded-r-3xl flex flex-col items-center justify-between" style={{ background: token1Color || '#000000' }}>
                        </div>

                        <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-between py-6">
                            <div className="flex-1 flex flex-row w-full">
                                {/*Token A*/}
                                <div className="w-1/2  flex flex-col items-center justify-between">
                                    {/* token0 logo */}
                                    <Image src={token0.logoURI} alt={token0.symbol} width={80} height={80} className="rounded-full w-20 h-20 border-8 border-white bg-white" />
                                </div>
                                {/*Token B*/}
                                <div className="w-1/2  flex flex-col items-center justify-between">
                                    {/* token1 logo */}
                                    <Image src={token1.logoURI} alt={token1.symbol} width={80} height={80} className="rounded-full w-20 h-2204 border-8 border-white bg-white" />
                                </div>
                            </div>

                            {/*Middle Info */}
                            <div className="flex-1 flex flex-row w-full px-2">
                                <div className="w-full bg-[#1e1d1b] text-white rounded-2xl p-4 h-24 flex flex-row items-center justify-between">
                                    {/* tokenatob */}
                                    <div className="flex flex-col">
                                        <NumericFormat
                                            value={poolShareInfo.tokenatob}
                                            displayType={"text"}
                                            thousandSeparator={true}
                                            decimalScale={4}
                                            className="leading-none font-bold text-2xl"
                                        />
                                        <div className="text-xs font-bold">{token1.symbol} per {token0.symbol}</div>
                                    </div>

                                    {/*Separator*/}
                                    <div className="h-12 rounded-xl font-bold p-2 text-center border border-[#9B9A98] text-[10px] flex flex-col items-center justify-center">
                                        Liquidity<br />
                                        Price
                                    </div>

                                    {/* tokenbtoa */}
                                    <div className="flex flex-col">
                                        <NumericFormat
                                            value={poolShareInfo.tokenbtoa}
                                            displayType={"text"}
                                            thousandSeparator={true}
                                            decimalScale={4}
                                            className="leading-none font-bold text-2xl text-right"
                                        />
                                        <div className="text-xs font-bold text-right">{token0.symbol} per {token1.symbol}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 flex flex-row w-full items-center">
                                <div className="w-1/2  flex flex-col items-center justify-between">
                                    {/*Circle gauge by percentage of pool share*/}
                                    <div className="relative w-32 h-32">
                                        <svg className="w-full h-full transform -rotate-90">
                                            <circle
                                                cx="64"
                                                cy="64"
                                                r="48"
                                                strokeWidth="16"
                                                stroke="#ffffff30"
                                                fill="transparent"
                                            />
                                            <circle
                                                cx="64"
                                                cy="64"
                                                r="48"
                                                strokeWidth="16"
                                                stroke="#ffffff"
                                                fill="transparent"
                                                strokeDasharray={`${poolShareInfo.sharePercent * 3}, 300`}
                                            />
                                        </svg>
                                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-center bg-[#1e1d1b] rounded-full h-[72px] w-[72px] flex flex-col items-center justify-center">
                                            <div className="text-xl font-bold">{Number(poolShareInfo.sharePercent).toFixed(1)}%</div>
                                            <div className="text-[10px]">Share</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="w-1/2 flex flex-col items-center justify-between px-4">
                                    <div className="w-full h-32 bg-[#1e1d1b] rounded-2xl p-4 flex flex-col items-start justify-center">
                                        <PiggyBank className="min-w-8 min-h-8 text-[#daff00]" />
                                        <div className="text-white text-xs font-bold mt-1">
                                            {/* SharePercent of 3% */}
                                            <NumericFormat
                                                value={((Number(poolShareInfo.sharePercent) / 100) * (0.03))}
                                                displayType={"text"}
                                                thousandSeparator={true}
                                                decimalScale={3}
                                                className="leading-none font-bold text-xl"
                                            /> %
                                            <div className="text-[10px] leading-none">EARNED</div>
                                            <div className="text-[10px] leading-none">TO EACH TRADE</div>
                                        </div>
                                        <div className="text-[#9B9A98] text-[10px] font-light mt-1 leading-none">
                                            3% distributed through all {token0.symbol}/{token1.symbol} LPs.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </Card>
                </div >
            </section >
        </>
    )
}