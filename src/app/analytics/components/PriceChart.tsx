'use client'

import { useState, useEffect } from 'react'
import { Line, LineChart, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { ChartTooltip } from '@/src/components/ui/chart'

interface PriceData {
    date: number
    priceUSD: string
}

interface PriceChartProps {
    data: PriceData[]
    tokenSymbol: string
}

export default function PriceChart({ data, tokenSymbol }: PriceChartProps) {
    const [chartData, setChartData] = useState<any[]>([])

    useEffect(() => {
        const formattedData = data.map(item => ({
            date: new Date(item.date * 1000).toLocaleDateString(),
            price: parseFloat(item.priceUSD)
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
                    <p className="text-sm font-bold">{`Price: ${payload[0].value.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 4
                    })} USD`}</p>
                </div>
            )
        }
        return null
    }

    return (

        <div className="h-[300px] my-auto">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 0, right: 0, left: -15, bottom: -15 }}>
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
                        tickFormatter={(value) => `$${value.toFixed(4)}`}
                    />
                    <ChartTooltip content={<CustomTooltip />} />
                    
                    <Line type="monotone" dataKey="price" stroke="#daff00" dot={false} strokeWidth={2} />
                </LineChart>
            </ResponsiveContainer>
        </div>

    )
}

