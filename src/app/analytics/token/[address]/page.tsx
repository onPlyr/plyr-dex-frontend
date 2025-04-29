'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { fetchTokenData, fetchTokenPairs, fetchTokenPriceData } from '@/app/analytics/components/UniswapInfoFetcher'
import Pagination from '@/app/analytics/components/Pagination'
import { Loader2 } from 'lucide-react'
import PriceChart from '../../components/PriceChart'
import { loadTokenList } from '@/app/loadTokenList'

const ITEMS_PER_PAGE = 10

export default function TokenPage() {
    const { address } = useParams()
    const [tokenList, setTokenList] = useState<any[]>([])
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
                // Load Token List //
                const tokenList = await loadTokenList(true);
                setTokenList(tokenList)

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
            <div className="container mx-auto px-0 py-8 space-y-8">
                <Card className="bg-[#ffffff0d] border-none rounded-[12px]">
                    <CardHeader>
                        <CardTitle className="text-xl md:text-2xl lg:text-5xl text-white font-thin leading-none" style={{ fontFamily: 'var(--font-bold-finger)' }}>Price History</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <PriceChart data={priceData} tokenSymbol={tokenData.symbol} />
                    </CardContent>
                </Card>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Card className="bg-[#ffffff0d] border-none rounded-[12px]">
                        <CardHeader>
                            <CardTitle className="text-xl md:text-2xl lg:text-5xl text-white font-thin leading-none flex flex-row items-center gap-2" style={{ fontFamily: 'var(--font-bold-finger)' }}>
                                <img src={tokenList.find(t => t.address.toLowerCase() === tokenData.id.toLowerCase())?.logoURI} alt={tokenData.symbol} width={28} height={28} className="rounded-full md:w-10 md:h-10 w-8 h-8" />
                                {tokenData.symbol === 'WPLYR' ? 'PLYR' : tokenData.symbol}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-4 md:px-6">
                            <div className="grid grid-cols-1 gap-4">
                                <div className="bg-[#3A3935] p-4 rounded-[12px] text-white">
                                    <h3 className="text-lg font-medium md:mb-2">Price (PLYR)</h3>
                                    <p className="text-2xl font-bold">{parseFloat(tokenData.derivedETH).toLocaleString(undefined, { maximumFractionDigits: 4 })} PLYR</p>
                                    <p className="text-sm text-gray-500">≈ ${(parseFloat(tokenData.derivedETH) * ethPrice).toLocaleString(undefined, { maximumFractionDigits: 4 })} USD</p>
                                </div>
                                <div className="bg-[#3A3935] p-4 rounded-[12px] text-white">
                                    <h3 className="text-lg font-medium md:mb-2">Trade Volume (USD)</h3>
                                    <p className="text-2xl font-bold">${parseFloat(tokenData.untrackedVolumeUSD).toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                                </div>
                                <div className="bg-[#3A3935] p-4 rounded-[12px] text-white">
                                    <h3 className="text-lg font-medium md:mb-2">Total Liquidity</h3>
                                    <p className="text-2xl font-bold">{parseFloat(tokenData.totalLiquidity).toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                                    <p className="text-sm text-gray-500">≈ ${(parseFloat(tokenData.totalLiquidity) * tokenData.derivedETH * ethPrice).toFixed(2)} USD</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-[#ffffff0d] border-none rounded-[12px]">
                        <CardHeader>
                            <CardTitle className="text-xl md:text-2xl lg:text-5xl text-white font-thin leading-none" style={{ fontFamily: 'var(--font-bold-finger)' }}>Related Pairs</CardTitle>
                        </CardHeader>
                        <CardContent className="px-4 md:px-6">
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead>
                                        <tr className="bg-[#3A393580] text-white">
                                            <th className="px-4 py-4 text-left rounded-l-2xl">Pair</th>
                                            <th className="px-4 py-4 text-right rounded-r-2xl whitespace-nowrap">Liquidity (USD)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {relatedPairs
                                            .filter((pair: any) => 
                                                pair.token0.symbol !== 'USDC' && 
                                                pair.token1.symbol !== 'USDC'
                                            )
                                            .slice(pairStart, pairStart + ITEMS_PER_PAGE)
                                            .map((pair: any) => (
                                            <tr key={pair.id} className="hover:border-transparent hover:bg-[#ffffff0d] transition-all duration-300 text-white">
                                                <td className="px-4 py-4 rounded-l-2xl">
                                                    <Link href={`/analytics/pair/${pair.id}`} className="text-white flex flex-row items-center gap-2">
                                                        <img src={tokenList.find(t => t.address.toLowerCase() === pair.token0.id.toLowerCase())?.logoURI} alt={pair.token0.symbol} width={28} height={28} className="rounded-full w-7 h-7" />
                                                        <img src={tokenList.find(t => t.address.toLowerCase() === pair.token1.id.toLowerCase())?.logoURI} alt={pair.token1.symbol} width={28} height={28} className="rounded-full w-7 h-7 ml-[-10px]" />
                                                        {pair.token0.symbol === 'WPLYR' ? 'PLYR' : pair.token0.symbol}/{pair.token1.symbol === 'WPLYR' ? 'PLYR' : pair.token1.symbol}
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

