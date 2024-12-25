'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchTokenData, fetchTokenPairs, fetchTokenPriceData } from '@/app/analytics/components/UniswapInfoFetcher'
import Pagination from '@/app/analytics/components/Pagination'
import { Loader2 } from 'lucide-react'
import PriceChart from '../../components/PriceChart'

const ITEMS_PER_PAGE = 10

export default function TokenPage() {
    const { address } = useParams()
    const [tokenData, setTokenData] = useState<any>(null)
    const [ethPrice, setEthPrice] = useState<any>(null)
    const [relatedPairs, setRelatedPairs] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [pairPage, setPairPage] = useState(1)
    const [priceData, setPriceData] = useState<any>(null)

    useEffect(() => {
        async function loadTokenData() {
            try {
                const data = await fetchTokenData(address as string)
                setTokenData(data.token)
                setEthPrice(data.ethPrice)
                const pairs = await fetchTokenPairs(address as string)
                setRelatedPairs(pairs)
                const priceHistory = await fetchTokenPriceData(address as string)
                setPriceData(priceHistory)
                setLoading(false)
            } catch (err) {
                setError('Failed to fetch token data')
                setLoading(false)
            }
        }

        loadTokenData()
    }, [address])

    if (loading) return <div className="flex w-full px-6 flex-col items-center justify-center pt-[6.5rem] pb-24 lg:pb-12"><div className="text-center"><Loader2 className="w-24 h-24 animate-spin text-[#daff00]" /></div></div>
    if (error) return <div className="flex w-full px-6 flex-col items-center justify-center pt-[6.5rem] pb-24 lg:pb-12"><div className="text-center text-red-500">{error}</div></div>

    const pairStart = (pairPage - 1) * ITEMS_PER_PAGE

    return (
        <div className="flex w-full px-6 flex-col items-center justify-center pt-[6.5rem] pb-24 lg:pb-12">
            <div className="container mx-auto px-4 py-8 space-y-8">
                <Card className="bg-[#ffffff0d] border-none rounded-2xl">
                    <CardHeader>
                        <CardTitle className="text-4xl text-white font-normal leading-none" style={{ fontFamily: 'var(--font-road-rage)' }}>Price History</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-8">
                        <PriceChart data={priceData} tokenSymbol={tokenData.symbol} />
                    </CardContent>
                </Card>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Card className="bg-[#ffffff0d] border-none rounded-2xl">
                        <CardHeader>
                            <CardTitle className="text-4xl text-white font-normal leading-none" style={{ fontFamily: 'var(--font-road-rage)' }}>{tokenData.name} ({tokenData.symbol})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 gap-4">
                                <div className="bg-[#3A3935] p-4 rounded-2xl text-white">
                                    <h3 className="text-lg font-medium mb-2">Price (PLYR)</h3>
                                    <p className="text-2xl font-bold">{parseFloat(tokenData.derivedETH).toFixed(6)} PLYR</p>
                                    <p className="text-sm text-gray-500">≈ ${(parseFloat(tokenData.derivedETH) * ethPrice).toFixed(2)} USD</p>
                                </div>
                                <div className="bg-[#3A3935] p-4 rounded-2xl text-white">
                                    <h3 className="text-lg font-medium mb-2">Trade Volume (USD)</h3>
                                    <p className="text-2xl font-bold">${parseFloat(tokenData.untrackedVolumeUSD).toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                                </div>
                                <div className="bg-[#3A3935] p-4 rounded-2xl text-white">
                                    <h3 className="text-lg font-medium mb-2">Total Liquidity</h3>
                                    <p className="text-2xl font-bold">{parseFloat(tokenData.totalLiquidity).toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                                    <p className="text-sm text-gray-500">≈ ${(parseFloat(tokenData.totalLiquidity) * tokenData.derivedETH * ethPrice).toFixed(2)} USD</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-[#ffffff0d] border-none rounded-2xl">
                        <CardHeader>
                            <CardTitle className="text-4xl text-white font-normal leading-none" style={{ fontFamily: 'var(--font-road-rage)' }}>Related Pairs</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead>
                                        <tr className="bg-[#3A3935] text-white">
                                            <th className="px-4 py-2 text-left">Pair</th>
                                            <th className="px-4 py-2 text-right">Liquidity (USD)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {relatedPairs.slice(pairStart, pairStart + ITEMS_PER_PAGE).map((pair: any) => (
                                            <tr key={pair.id} className="border-b text-white">
                                                <td className="px-4 py-2">
                                                    <Link href={`/analytics/pair/${pair.id}`} className="text-white hover:underline">
                                                        {pair.token0.symbol}/{pair.token1.symbol}
                                                    </Link>
                                                </td>
                                                <td className="px-4 py-2 text-right">${parseFloat(pair.reserveUSD).toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <Pagination
                                currentPage={pairPage}
                                totalPages={Math.ceil(relatedPairs.length / ITEMS_PER_PAGE)}
                                onPageChange={setPairPage}
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>


        </div>
    )
}

