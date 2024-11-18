"use client";
import { useState } from 'react'
import { Token, Pair, Fetcher, Route, Trade, TokenAmount, TradeType, Percent, WETH } from '@uniswap/sdk'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useActiveAccount, useActiveWallet } from 'thirdweb/react';
import WalletButton from './walletButton';
import { client, tauChain } from '@/lib/thirdweb_client';

import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"


import { ethers } from "ethers";
import { getContract, prepareContractCall, sendAndConfirmTransaction, toTokens, toWei } from 'thirdweb';
import { allowance, approve, transfer } from "thirdweb/extensions/erc20";

// Token list (for demonstration purposes)
const tokenList = [
    { symbol: 'PLYR', address: '0x0000000000000000000000000000000000000000', decimals: 18 },
    { symbol: 'WPLYR', address: process.env.NEXT_PUBLIC_UNISWAP_WPLYR, decimals: 18 },
    { symbol: 'GAMR', address: '0xa875625fe8A955406523E52E485f351b92908ce1', decimals: 18 },
]

const CHAIN_ID = 62831

// Custom Token class to work with our chain ID
class CustomToken extends Token {
    constructor(address: string, decimals: number, symbol: string) {
        super(CHAIN_ID as any, address, decimals, symbol)
    }
}

export default function addLiqSection() {

    const activeWallet = useActiveWallet();
    const activeAccount = useActiveAccount();


    const [token0, setToken0] = useState(tokenList[0])
    const [token1, setToken1] = useState(tokenList[1])
    const [amount0, setAmount0] = useState('')
    const [amount1, setAmount1] = useState('')
    const [result, setResult] = useState('')
    const [error, setError] = useState('')
    const handleAddLiquidity = async (e: React.FormEvent) => {
        if (!activeAccount || !activeWallet) {
            setError('Please connect your wallet first')
            return
        }
        e.preventDefault()
        setResult('')
        setError('')

        if (token0.address === undefined || token1.address === undefined) {
            setError('Invalid token address')
            return
        }

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
                    chain: tauChain,
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
                    chain: tauChain,
                });
                console.log(BigInt(ethAmount.toString()), otherToken.address, tokenAmount.toString(), tokenAmountMin.toString(), ethAmountMin.toString(), activeAccount?.address, deadline)
                const transaction = prepareContractCall<any, any, any>({
                    contract: uniswapRouterContract,
                    method: 'function addLiquidityETH(address token, uint amountTokenDesired, uint amountTokenMin, uint amountETHMin, address to, uint deadline) external payable returns (uint amountToken, uint amountETH, uint liquidity)',
                    params: [otherToken.address, tokenAmount, tokenAmountMin, ethAmountMin, activeAccount?.address, deadline],
                    value: BigInt(ethAmount.toString()),
                })

                const transactionResult = await sendAndConfirmTransaction({
                    transaction,
                    account: activeAccount,
                })
            }


        } catch (error) {
            console.log(error)
            setResult(`Error: ${error.message}`)
        }
    }

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle>Auto Add Liquidity to Uniswap V2</CardTitle>
                <CardDescription>Select tokens and enter amounts to add liquidity. New pairs will be created automatically if they don't exist.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleAddLiquidity} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="token0">Token 1</Label>
                        <Select onValueChange={(value) => setToken0(tokenList.find(t => t.symbol === value)!)}>
                            <SelectTrigger id="token0">
                                <SelectValue placeholder="Select token" />
                            </SelectTrigger>
                            <SelectContent>
                                {tokenList.map((token) => (
                                    <SelectItem key={token.address} value={token.symbol}>{token.symbol}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="amount0">Amount 1</Label>
                        <Input
                            id="amount0"
                            type="text"
                            value={amount0}
                            onChange={(e) => setAmount0(e.target.value)}
                            placeholder="0.0"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="token1">Token 2</Label>
                        <Select onValueChange={(value) => setToken1(tokenList.find(t => t.symbol === value)!)}>
                            <SelectTrigger id="token1">
                                <SelectValue placeholder="Select token" />
                            </SelectTrigger>
                            <SelectContent>
                                {tokenList.map((token) => (
                                    <SelectItem key={token.address} value={token.symbol}>{token.symbol}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="amount1">Amount 2</Label>
                        <Input
                            id="amount1"
                            type="text"
                            value={amount1}
                            onChange={(e) => setAmount1(e.target.value)}
                            placeholder="0.0"
                            required
                        />
                    </div>

                    <Button type="submit" className="w-full">Add Liquidity</Button>
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

                <CardContent>
                    <p>Connect your wallet to add liquidity</p>
                    <WalletButton />
                </CardContent>
            </CardContent>
        </Card>

    )
}