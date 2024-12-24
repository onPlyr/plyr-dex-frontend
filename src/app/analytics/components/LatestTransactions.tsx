'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchLatestTransactions, fetchLatestTransactionsByPairAddress } from './UniswapInfoFetcher'

interface Transaction {
    id: string
    timestamp: string
    type: 'swap' | 'add' | 'remove'
    token0Symbol: string
    token1Symbol: string
    amountUSD: string
    isToken0ToToken1?: boolean
}

export default function LatestTransactions({ pairAddress }: { pairAddress: string | undefined }) {
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

    if (loading) return <div className="text-center">Loading transactions...</div>
    if (error) return <div className="text-center text-red-500">{error}</div>

    return (
        <Card className="bg-[#ffffff0d] rounded-3xl p-4 border-0">
            <CardHeader>
                <CardTitle className="text-white text-4xl font-normal leading-none" style={{ fontFamily: 'var(--font-road-rage)' }}>Latest Txs</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                    {transactions.map((tx) => (
                        <div key={tx.id} className="bg-[#3A3935] p-4 rounded-2xl text-white">
                            <div className="flex justify-between items-center">
                                <span className="font-medium">
                                    {tx.type === 'swap' ? 'Swap' : tx.type === 'add' ? 'Add Liquidity' : 'Remove Liquidity'}
                                </span>
                                <span className="text-sm text-gray-500">
                                    {new Date(parseInt(tx.timestamp) * 1000).toLocaleString()}
                                </span>
                            </div>
                            <div className="mt-2">
                                <span className="text-sm">
                                    {tx.type === 'swap' ? (
                                        tx.isToken0ToToken1 ?
                                            `${tx.token0Symbol} → ${tx.token1Symbol}` :
                                            `${tx.token1Symbol} → ${tx.token0Symbol}`
                                    ) : (
                                        `${tx.token0Symbol} ⇄ ${tx.token1Symbol}`
                                    )}
                                </span>
                            </div>
                            <div className="mt-1 text-sm font-medium">
                                ${parseFloat(tx.amountUSD).toLocaleString()}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}

