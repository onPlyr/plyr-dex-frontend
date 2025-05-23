'use client'

import { useState, useEffect } from 'react'
import { Line, LineChart,  XAxis, YAxis, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { ChartContainer, ChartTooltip } from "@/src/components/ui/chart"

interface ChartData {
    date: number
    dailyVolumeUSD: string
    dailyVolumeETH: string
    totalLiquidityUSD: string
    dailyVolumeUntracked: string
    //totalLiquidityETH: string
}


function CustomTooltip({ active, payload, label }: any) {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-2 border border-gray-300 rounded shadow">
                <p className="text-sm">{`Date: ${new Date(label).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                })}`}</p>
                <p className="text-sm font-bold">{`${payload[0].name.includes('dailyVolumeUntracked') ? 'Volume' : 'Liquidity'}: ${payload[0].value.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                })} ${payload[0].name.includes('USD') ? 'USD' : 'USD'}`}</p>
            </div>
        )
    }
    return null
}

function ChartCard({ title, data, dataKey, color }: { title: string, data: any[], dataKey: string, color: string }) {
    return (
        <Card className="bg-[#ffffff0d] rounded-[12px] p-4 border-0">
            <CardHeader className="px-0 md:px-4 py-2">
                <CardTitle className="text-white text-xl md:text-2xl lg:text-5xl font-thin leading-none" style={{ fontFamily: 'var(--font-bold-finger)' }}>{title}</CardTitle>
            </CardHeader>
            <CardContent className="px-0 py-4">
                <div className="h-[300px] mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data.map(entry => ({...entry, [dataKey]: entry[dataKey]}))} margin={{ top: 0, right: 0, left: -10, bottom: -15 }}>
                            <XAxis
                                dataKey="date"
                                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                })}
                            
                                angle={-45}
                                textAnchor="end"
                                style={{ fontSize: '10px' }}
                                height={70}
                            />
                            <YAxis
                                style={{ fontSize: '10px' }}

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

    //console.log('chartData', chartData)

    useEffect(() => {
        const formattedData = data.map(item => ({
            date: new Date(item.date * 1000).toLocaleDateString(),
            volumeUSD: parseFloat(item.dailyVolumeUSD),
            volumeETH: parseFloat(item.dailyVolumeETH),
            liquidityUSD: parseFloat(item.totalLiquidityUSD),
            dailyVolumeUntracked: parseFloat(item.dailyVolumeUntracked),
            //liquidityETH: parseFloat(item.totalLiquidityETH)
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
                title="Daily Volume (USD)"
                data={chartData}
                dataKey="dailyVolumeUntracked"
                color="#daff00"
            />
            {/* <ChartCard 
        title="Total Liquidity (USD)" 
        data={chartData} 
        dataKey="liquidityUSD" 
        color="#daff00" 
      /> */}
            <ChartCard
                title="Total Liquidity (USD)"
                data={chartData}
                dataKey="liquidityUSD"
                color="#daff00"
            />
        </div>
    )
}

