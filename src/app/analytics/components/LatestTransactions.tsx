'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { fetchLatestTransactions, fetchLatestTransactionsByPairAddress } from './UniswapInfoFetcher'
import Link from 'next/link'
import { ArrowRight, CircleChevronRight, CirclePlus, CircleX, Loader2, PaintBucket } from 'lucide-react'
import SwapIcon from '@/app/components/icons/SwapIcon'

interface Transaction {
    id: string
    timestamp: string
    type: 'swap' | 'add' | 'remove'
    token0Id: string
    token1Id: string
    token0Symbol: string
    token1Symbol: string
    amountUSD: string
    isToken0ToToken1?: boolean
    transaction: {
        id: string
    }
}

export default function LatestTransactions({ pairAddress, tokenList }: { pairAddress: string | undefined, tokenList: any[] }) {
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function loadTransactions() {
            if (pairAddress) {
                try {
                    const result = await fetchLatestTransactionsByPairAddress(pairAddress)

                    //console.log(result)
                    setTransactions(result)
                    setLoading(false)
                } catch (err) {
                    setError('Failed to fetch latest transactions')
                    setLoading(false)
                }
            }
            else {
                try {
                    const result = await fetchLatestTransactions()
                    setTransactions(result)
                    setLoading(false)
                } catch (err) {
                    setError('Failed to fetch latest transactions')
                    setLoading(false)
                }
            }
        }

        loadTransactions()
        const interval = setInterval(loadTransactions, 60000) // Fetch every minute

        return () => clearInterval(interval)
    }, [])

    if (loading) return <div className="flex w-full px-6 flex-col items-center justify-center pt-[6.5rem] pb-24 lg:pb-12"><div className="text-center"><Loader2 className="w-24 h-24 animate-spin text-[#daff00]" /></div></div>
    if (error) return <div className="text-center text-red-500">{error}</div>


    function formatTimestamp(timestamp: string): string {
        const txTime = new Date(parseInt(timestamp) * 1000);
        const now = new Date();
        const diff = Math.floor((now.getTime() - txTime.getTime()) / 1000);

        if (diff < 60) {
            return `${diff} second${diff !== 1 ? 's' : ''} ago`;
        } else if (diff < 3600) {
            const minutes = Math.floor(diff / 60);
            return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
        } else if (diff < 86400) {
            const hours = Math.floor(diff / 3600);
            return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
        } else {
            return txTime.toLocaleString();
        }
    }

    return (
        <Card className="bg-[#ffffff0d] rounded-[12px] p-2 pr-0 border-0">
            <CardHeader>
                <CardTitle className="text-white text-5xl font-thin leading-none" style={{ fontFamily: 'var(--font-bold-finger)' }}>Latest Txs</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                    {transactions.map((tx) => (
                        <div key={tx.id} className="bg-[#3A3935] p-4 rounded-2xl text-white">
                            <div className="flex justify-between items-center">
                                <span className="font-medium text-[#daff00] text-[9px] uppercase flex flex-row items-center gap-1">
                                    {tx.type === 'swap' ? <SwapIcon className='w-4 h-4' style={{strokeWidth: 1.5}}/> : tx.type === 'add' ? <PaintBucket className='w-4 h-4' style={{strokeWidth: 1.5}}/> : <CircleX className='w-4 h-4' style={{strokeWidth: 1.5}}/>}
                                    {tx.type === 'swap' ? 'Swap' : tx.type === 'add' ? 'Liquidity Added' : 'Liquidity Removed'}
                                </span>
                                <span className="text-[9px] text-[#808080] text-right">
                                    {formatTimestamp(tx.timestamp)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <div>
                                    <div className="mt-2">
                                        <span className="text-sm">
                                            {tx.type === 'swap' ? (
                                                // Add Token 0 and Token 1 Logo //
                                                tx.isToken0ToToken1 ?
                                                    <div className="flex items-center gap-2">
                                                        <img src={tokenList.find(t => t.address.toLowerCase() === tx.token0Id.toLowerCase())?.logoURI} alt={tx.token0Symbol} width={28} height={28} className="rounded-full w-7 h-7" />
                                                        {tx.token0Symbol === 'WPLYR' ? 'PLYR' : tx.token0Symbol}
                                                        <ArrowRight className="w-4 h-4" />
                                                        <img src={tokenList.find(t => t.address.toLowerCase() === tx.token1Id.toLowerCase())?.logoURI} alt={tx.token1Symbol} width={28} height={28} className="rounded-full w-7 h-7" />
                                                        {tx.token1Symbol === 'WPLYR' ? 'PLYR' : tx.token1Symbol}
                                                    </div>

                                                    :
                                                    <div className="flex items-center gap-2">
                                                        <img src={tokenList.find(t => t.address.toLowerCase() === tx.token1Id.toLowerCase())?.logoURI} alt={tx.token1Symbol} width={28} height={28} className="rounded-full w-7 h-7" />
                                                        {tx.token1Symbol === 'WPLYR' ? 'PLYR' : tx.token1Symbol}
                                                        <ArrowRight className="w-4 h-4" />
                                                        <img src={tokenList.find(t => t.address.toLowerCase() === tx.token0Id.toLowerCase())?.logoURI} alt={tx.token0Symbol} width={28} height={28} className="rounded-full w-7 h-7" />
                                                        {tx.token0Symbol === 'WPLYR' ? 'PLYR' : tx.token0Symbol}
                                                    </div>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <img src={tokenList.find(t => t.address.toLowerCase() === tx.token0Id.toLowerCase())?.logoURI} alt={tx.token0Symbol} width={28} height={28} className="rounded-full w-7 h-7" />
                                                    <img src={tokenList.find(t => t.address.toLowerCase() === tx.token1Id.toLowerCase())?.logoURI} alt={tx.token1Symbol} width={28} height={28} className="rounded-full w-7 h-7 ml-[-10px]" />
                                                    {tx.token0Symbol === 'WPLYR' ? 'PLYR' : tx.token0Symbol}/{tx.token1Symbol === 'WPLYR' ? 'PLYR' : tx.token1Symbol}
                                                </div>
                                                
                                            )}
                                        </span>
                                    </div>
                                    <div className="mt-1 text-sm font-medium">
                                        ${parseFloat(tx.amountUSD).toLocaleString()}
                                    </div>
                                </div>
                                <div>
                                    <Link href={`${process.env.NEXT_PUBLIC_EXPLORER_URL}/tx/${tx.transaction.id}`} className="text-white">
                                        <CircleChevronRight className="w-8 h-8" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}

