import { ChartBar, ChartBarHorizontal, ChartDonut, ChartLine, ChartLineDown, ChartLineUp, ChartPie, ChartPieSlice, ChartPolar, ChartScatter, TrendDown, TrendUp } from "@phosphor-icons/react"
import * as React from "react"

import { BaseIcon, BaseIconProps } from "@/app/components/icons/BaseIcon"

export enum ChartIconVariant {
    Bar = "bar",
    BarHorizontal = "barHorizontal",
    Donut = "donut",
    Line = "line",
    LineDown = "lineDown",
    LineUp = "lineUp",
    Pie = "pie",
    PieSlice = "pieSlice",
    Polar = "polar",
    Scatter = "scatter",
    TrendDown = "trendDown",
    TrendUp = "trnedUp",
}

const icons: Record<ChartIconVariant, React.ReactNode> = {
    [ChartIconVariant.Bar]: <ChartBar />,
    [ChartIconVariant.BarHorizontal]: <ChartBarHorizontal />,
    [ChartIconVariant.Donut]: <ChartDonut />,
    [ChartIconVariant.Line]: <ChartLine />,
    [ChartIconVariant.LineDown]: <ChartLineDown />,
    [ChartIconVariant.LineUp]: <ChartLineUp />,
    [ChartIconVariant.Pie]: <ChartPie />,
    [ChartIconVariant.PieSlice]: <ChartPieSlice />,
    [ChartIconVariant.Polar]: <ChartPolar />,
    [ChartIconVariant.Scatter]: <ChartScatter />,
    [ChartIconVariant.TrendDown]: <TrendDown />,
    [ChartIconVariant.TrendUp]: <TrendUp />,
}

interface ChartIconProps extends BaseIconProps {
    variant: ChartIconVariant,
}

export const ChartIcon = React.forwardRef<React.ElementRef<typeof BaseIcon>, ChartIconProps>(({
    children,
    variant,
    ...props
}, ref) => (
    <BaseIcon
        ref={ref}
        {...props}
    >
        {children ?? icons[variant]}
    </BaseIcon>
))
ChartIcon.displayName = "ChartIcon"
