'use client'

import { useState, useEffect } from 'react'
import { Line, LineChart, Bar, BarChart, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"

interface ChartData {
    date: number
    dailyVolumeUSD: string
    dailyVolumeETH: string
    totalLiquidityUSD: string
    totalLiquidityETH: string
}

function CustomTooltip({ active, payload, label }: any) {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-2 border border-gray-300 rounded shadow">
                <p className="text-sm">{`Date: ${new Date(label).toLocaleDateString()}`}</p>
                <p className="text-sm font-bold">{`${payload[0].name.includes('volume') ? 'Volume' : 'Liquidity'}: ${payload[0].value.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                })} ${payload[0].name.includes('USD') ? 'USD' : 'WAN'}`}</p>
            </div>
        )
    }
    return null
}

function ChartCard({ title, data, dataKey, color }: { title: string, data: any[], dataKey: string, color: string }) {
    return (
        <Card className="bg-[#ffffff0d] rounded-3xl p-4 border-0">
            <CardHeader>
                <CardTitle className="text-white text-4xl font-normal leading-none" style={{ fontFamily: 'var(--font-road-rage)' }}>{title}</CardTitle>
            </CardHeader>
            <CardContent className="px-2 py-2">
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                            <XAxis
                                dataKey="date"
                                tickFormatter={(value) => new Date(value).toLocaleDateString()}
                                tick={{fill: '#fff'}}
                                angle={-45}
                                textAnchor="end"
                                style={{ fontSize: '11px' }}
                                height={70}
                            />
                            <YAxis
                                style={{ fontSize: '11px' }}
                                tick={{fill: '#fff'}}
                                tickFormatter={(value) => {
                                    const units = ['', 'K', 'M', 'B'];
                                    let unitIndex = 0;
                                    let scaledValue = value;
                                    while (scaledValue >= 1000 && unitIndex < units.length - 1) {
                                        unitIndex++;
                                        scaledValue = scaledValue / 1000;
                                    }
                                    return `${scaledValue.toFixed(2)}${units[unitIndex]}`;
                                }}
                            />
                            <ChartTooltip content={<CustomTooltip />} />
                            <Line
                                type="monotone"
                                dataKey={dataKey}
                                stroke={color}
                                strokeWidth={2}
                                dot={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}

export default function GlobalCharts({ data }: { data: ChartData[] }) {
    const [chartData, setChartData] = useState<any[]>([])

    useEffect(() => {
        const formattedData = data.map(item => ({
            date: new Date(item.date * 1000).toLocaleDateString(),
            volumeUSD: parseFloat(item.dailyVolumeUSD),
            volumeETH: parseFloat(item.dailyVolumeETH),
            liquidityUSD: parseFloat(item.totalLiquidityUSD),
            liquidityETH: parseFloat(item.totalLiquidityETH)
        })).reverse()

        setChartData(formattedData)
    }, [data])

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* <ChartCard 
        title="Daily Volume (USD)" 
        data={chartData} 
        dataKey="volumeUSD" 
        color="#daff00" 
      /> */}
            <ChartCard
                title="Daily Volume (WAN)"
                data={chartData}
                dataKey="volumeETH"
                color="#daff00"
            />
            {/* <ChartCard 
        title="Total Liquidity (USD)" 
        data={chartData} 
        dataKey="liquidityUSD" 
        color="#daff00" 
      /> */}
            <ChartCard
                title="Total Liquidity (WAN)"
                data={chartData}
                dataKey="liquidityETH"
                
                color="#daff00"
            />
        </div>
    )
}

