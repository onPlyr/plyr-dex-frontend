'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { fetchFactoryData, fetchTopPairsTokensData } from './UniswapInfoFetcher'
import Pagination from './Pagination'
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Loader2 } from 'lucide-react'

const ITEMS_PER_PAGE = 10

export default function UniswapInfo({ tokenList }: { tokenList: any[] }) {
    const [factory, setFactory] = useState<any>(null);
    const [topPairsTokens, setTopPairsTokens] = useState<any>(null);
    const [factoryLoading, setFactoryLoading] = useState(true);
    const [topPairsTokensLoading, setTopPairsTokensLoading] = useState(true);
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [pairPage, setPairPage] = useState(1)
    const [tokenPage, setTokenPage] = useState(1)

    useEffect(() => {
        async function loadFactoryData() {
            try {
                const factoryData = await fetchFactoryData();
                setFactory(factoryData);
            } catch (err) {
                setError('Failed to fetch factory data');
            } finally {
                setFactoryLoading(false);
            }
        }
        loadFactoryData();
    }, []);

    useEffect(() => {
        async function loadTopPairsTokensData() {
            try {
                const topPairsTokensData = await fetchTopPairsTokensData();
                setTopPairsTokens(topPairsTokensData);
            } catch (err) {
                setError('Failed to fetch top pairs and tokens data');
            } finally {
                setTopPairsTokensLoading(false);
            }
        }
        loadTopPairsTokensData();
    }, []);

    //if (factoryLoading && topPairsTokensLoading) return <div className="text-center text-white w-full flex justify-center items-center"><Loader2 className="w-24 h-24 animate-spin text-[#daff00]" /></div>;
    //if (error) return <div className="text-center text-red-500">{error}</div>

    const pairStart = (pairPage - 1) * ITEMS_PER_PAGE
    const tokenStart = (tokenPage - 1) * ITEMS_PER_PAGE

    const pairPages = Math.ceil((topPairsTokens?.topPairs?.length || 0) / ITEMS_PER_PAGE);
    const tokenPages = Math.ceil((topPairsTokens?.topTokens?.length || 0) / ITEMS_PER_PAGE);

    return (
        <>
            <div className="space-y-8">
                {factory && (
                    <Card className="bg-[#ffffff0d] rounded-3xl p-4 border-0">
                        <CardHeader>
                            <CardTitle className="text-white text-4xl font-normal leading-none" style={{ fontFamily: 'var(--font-road-rage)' }}>Overall Statistics</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-[#3A3935] p-4 rounded-2xl text-white">
                                    <h3 className="text-lg font-medium mb-2">Total Volume (USD)</h3>
                                    <p className="text-2xl font-bold">${parseFloat(factory.untrackedVolumeUSD).toLocaleString()}</p>
                                </div>
                                <div className="bg-[#3A3935] p-4 rounded-2xl text-white">
                                    <h3 className="text-lg font-medium mb-2">Total Liquidity (USD)</h3>
                                    <p className="text-2xl font-bold">${parseFloat(factory.totalLiquidityUSD).toLocaleString()}</p>
                                </div>
                                <div className="bg-[#3A3935] p-4 rounded-2xl text-white">
                                    <h3 className="text-lg font-medium mb-2">Pair Count</h3>
                                    <p className="text-2xl font-bold">{parseInt(factory.pairCount).toLocaleString()}</p>
                                </div>
                                <div className="bg-[#3A3935] p-4 rounded-2xl text-white">
                                    <h3 className="text-lg font-medium mb-2">Transaction Count</h3>
                                    <p className="text-2xl font-bold">{parseInt(factory.txCount).toLocaleString()}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {topPairsTokens?.topPairs && (
                    <Card className="bg-[#ffffff0d] rounded-3xl p-4 border-0">
                        <CardHeader>
                            <CardTitle className="text-white text-4xl font-normal leading-none" style={{ fontFamily: 'var(--font-road-rage)' }}>Top Pairs</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead>
                                        <tr className="bg-[#3A393580] text-white">
                                            <th className="px-4 py-4 text-left rounded-l-2xl">Pair</th>
                                            <th className="px-4 py-4 text-right rounded-r-2xl">Liquidity (USD)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {topPairsTokens.topPairs.slice(pairStart, pairStart + ITEMS_PER_PAGE).map((pair: any) => (
                                            <tr key={pair.id} className="hover:border-transparent hover:bg-[#ffffff0d] transition-all duration-300 text-white">
                                                <td className="px-4 py-4 rounded-l-2xl">
                                                    <Link href={`/analytics/pair/${pair.id}`} className="text-white flex flex-row items-center gap-2">
                                                        <img src={tokenList.find(t => t.address.toLowerCase() === pair.token0.id.toLowerCase())?.logoURI} alt={pair.token0.symbol} width={28} height={28} className="rounded-full w-7 h-7" />
                                                        <img src={tokenList.find(t => t.address.toLowerCase() === pair.token1.id.toLowerCase())?.logoURI} alt={pair.token1.symbol} width={28} height={28} className="rounded-full w-7 h-7 ml-[-10px]" />
                                                        {pair.token0.symbol}/{pair.token1.symbol}
                                                    </Link>
                                                </td>
                                                <td className="px-4 py-4 text-right rounded-r-2xl">${parseFloat(pair.reserveUSD).toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <Pagination
                                currentPage={pairPage}
                                totalPages={pairPages}
                                onPageChange={setPairPage}
                            />
                        </CardContent>
                    </Card>
                )}

                {topPairsTokens?.topTokens && (
                    <Card className="bg-[#ffffff0d] rounded-3xl p-4 border-0">
                        <CardHeader>
                            <CardTitle className="text-white text-4xl font-normal leading-none" style={{ fontFamily: 'var(--font-road-rage)' }}>Top Tokens</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead>
                                        <tr className="bg-[#3A393580] text-white">
                                            <th className="px-4 py-4 text-left rounded-l-2xl">Token</th>
                                            <th className="px-4 py-4 text-right">Volume (USD)</th>
                                            <th className="px-4 py-4 text-right rounded-r-2xl">Price (USD)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {topPairsTokens.topTokens.slice(tokenStart, tokenStart + ITEMS_PER_PAGE).map((token: any) => (
                                            <tr key={token.id} className="hover:border-transparent hover:bg-[#ffffff0d] transition-all duration-300 text-white">
                                                <td className="px-4 py-4 rounded-l-2xl">
                                                    <Link href={`/analytics/token/${token.id}`} className="text-white flex flex-row items-center gap-2">
                                                        <img src={tokenList.find(t => t.address.toLowerCase() === token.id.toLowerCase())?.logoURI} alt={token.symbol} width={28} height={28} className="rounded-full w-7 h-7" />
                                                        
                                                        {token.symbol} 
                                                        {/* ({token.name}) */}
                                                    </Link>
                                                </td>
                                                <td className="px-4 py-4 text-right rounded-r-2xl">${parseFloat(token.untrackedVolumeUSD).toLocaleString()}</td>
                                                <td className="px-4 py-4 text-right rounded-r-2xl">${(parseFloat(token.derivedETH) * topPairsTokens.ethPrice).toFixed(4)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <Pagination
                                currentPage={tokenPage}
                                totalPages={tokenPages}
                                onPageChange={setTokenPage}
                            />
                        </CardContent>
                    </Card>
                )}
            </div>

            {
                factoryLoading || topPairsTokensLoading && (
                    <div className="text-center text-white w-full flex justify-center items-center mt-6">
                        <Loader2 className="w-24 h-24 animate-spin text-[#daff00]" />
                    </div>
                )
            }

            {
                error && (
                    <div className="text-center text-red-500">{error}</div>
                )
            }
        </>
    )
}

