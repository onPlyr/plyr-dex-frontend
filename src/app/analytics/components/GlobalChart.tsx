'use client'

import { useState, useEffect } from 'react'
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface ChartData {
  date: number
  dailyVolumeUSD: string
  totalLiquidityUSD: string
}

export default function GlobalChart({ data }: { data: ChartData[] }) {
  const [chartData, setChartData] = useState<any[]>([])

  useEffect(() => {
    const formattedData = data.map(item => ({
      date: new Date(item.date * 1000).toLocaleDateString(),
      volume: parseFloat(item.dailyVolumeUSD),
      liquidity: parseFloat(item.totalLiquidityUSD)
    })).reverse()

    setChartData(formattedData)
  }, [data])

  return (
    <ChartContainer
      config={{
        volume: {
          label: "Daily Volume",
          color: "hsl(var(--chart-1))",
        },
        liquidity: {
          label: "Total Liquidity",
          color: "hsl(var(--chart-2))",
        },
      }}
      className="h-[400px]"
    >
      <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="date" 
          tickFormatter={(value) => new Date(value).toLocaleDateString()} 
        />
        <YAxis yAxisId="left" orientation="left" stroke="hsl(var(--chart-1))" />
        <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--chart-2))" />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="volume"
          stroke="var(--color-volume)"
          name="Daily Volume (USD)"
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="liquidity"
          stroke="var(--color-liquidity)"
          name="Total Liquidity (USD)"
        />
      </LineChart>
    </ChartContainer>
  )
}

