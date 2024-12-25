'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchPairData, fetchPairTransactions } from '@/app/analytics/components/UniswapInfoFetcher'
import LatestTransactions from '@/app/analytics/components/LatestTransactions'
import { Loader2 } from 'lucide-react'

export default function PairPage() {
    const { address } = useParams()
    const [pairData, setPairData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function loadPairData() {
            try {
                const data = await fetchPairData(address as string)
                setPairData(data)
                setLoading(false)
            } catch (err) {
                setError('Failed to fetch pair data')
                setLoading(false)
            }
        }

        loadPairData()
    }, [address])

    if (loading) return <div className="flex w-full px-6 flex-col items-center justify-center pt-[6.5rem] pb-24 lg:pb-12"><div className="text-center"><Loader2 className="w-24 h-24 animate-spin text-[#daff00]" /></div></div>
    if (error) return <div className="flex w-full px-6 flex-col items-center justify-center pt-[6.5rem] pb-24 lg:pb-12"><div className="text-center text-red-500">{error}</div></div>


    return (
        <div className="flex w-full px-6 flex-col items-center justify-center pt-[6.5rem] pb-24 lg:pb-12">
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 gap-8">
                    <Card className="bg-[#ffffff0d] border-none rounded-2xl">
                        <CardHeader>
                            <CardTitle className="text-4xl text-white font-normal leading-none" style={{ fontFamily: 'var(--font-road-rage)' }}>{pairData.token0.symbol}/{pairData.token1.symbol}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 gap-4">
                                <div className="bg-[#3A3935] p-4 rounded-2xl text-white">
                                    <h3 className="text-lg font-medium mb-2">Liquidity (USD)</h3>
                                    <p className="text-2xl font-bold">${parseFloat(pairData.reserveUSD).toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                                </div>
                                <div className="bg-[#3A3935] p-4 rounded-2xl text-white">
                                    <h3 className="text-lg font-medium mb-2">Volume (USD)</h3>
                                    <p className="text-2xl font-bold">${parseFloat(pairData.volumeUSD).toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                                </div>
                                <div className="bg-[#3A3935] p-4 rounded-2xl text-white">
                                    <h3 className="text-lg font-medium mb-2">{pairData.token0.symbol} Reserves</h3>
                                    <p className="text-2xl font-bold">{parseFloat(pairData.reserve0).toLocaleString(undefined, { maximumFractionDigits: 6 })}</p>
                                </div>
                                <div className="bg-[#3A3935] p-4 rounded-2xl text-white">
                                    <h3 className="text-lg font-medium mb-2">{pairData.token1.symbol} Reserves</h3>
                                    <p className="text-2xl font-bold">{parseFloat(pairData.reserve1).toLocaleString(undefined, { maximumFractionDigits: 6 })}</p>
                                </div>
                               
                                <div className="bg-[#3A3935] p-4 rounded-2xl text-white">
                                    <h3 className="text-lg font-medium mb-2">Transaction Count</h3>
                                    <p className="text-2xl font-bold">{parseInt(pairData.txCount)}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <LatestTransactions pairAddress={address as string} />
                </div>
            </div>
        </div>
    )
}

