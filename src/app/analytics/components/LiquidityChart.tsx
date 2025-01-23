'use client'

import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { ChartTooltip } from '@/src/components/ui/chart'

interface LiquidityData {
    date: number
    reserveUSD: string
}

interface LiquidityChartProps {
    data: LiquidityData[]
}

export default function LiquidityChart({ data }: LiquidityChartProps) {
    const [chartData, setChartData] = useState<any[]>([])

    useEffect(() => {
        const formattedData = data.map(item => ({
            date: new Date(item.date * 1000).toLocaleDateString(),
            liquidity: parseFloat(item.reserveUSD)
        })).reverse()

        setChartData(formattedData)
    }, [data])

    function CustomTooltip({ active, payload, label }: any) {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-2 border border-gray-300 rounded shadow">
                    <p className="text-sm">{`Date: ${new Date(label).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                    })}`}</p>
                    <p className="text-sm font-bold">{`Liquidity: ${payload[0].value.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 4
                    })} USD`}</p>
                </div>
            )
        }
        return null
    }

    return (

        <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                    <XAxis
                        dataKey="date"
                        angle={-45}
                        textAnchor="end"
                        height={70}
                        interval={0}
                        tick={{ fontSize: 12 }}
                    />
                    <YAxis
                        tickFormatter={(value) => `$${value.toLocaleString()}`}
                    />
                    <ChartTooltip content={<CustomTooltip />} />
                    <Line  type="monotone" dataKey="liquidity" stroke="#daff00" dot={false} strokeWidth={2} />
                </LineChart>
            </ResponsiveContainer>
        </div>

    )
}

