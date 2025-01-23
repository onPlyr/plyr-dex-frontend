import * as React from "react"
import { twMerge } from "tailwind-merge"

import ApproxEqualIcon from "@/app/components/icons/ApproxEqualIcon"
import DurationIcon from "@/app/components/icons/DurationIcon"
import ExchangeRateIcon from "@/app/components/icons/ExchangeRateIcon"
import GasIcon from "@/app/components/icons/GasIcon"
import InfoIcon from "@/app/components/icons/InfoIcon"
import ReceiveIcon from "@/app/components/icons/ReceiveIcon"
import SendIcon from "@/app/components/icons/SendIcon"
import SlippageIcon from "@/app/components/icons/SlippageIcon"
import StepIcon from "@/app/components/icons/StepIcon"
import SwapParameter from "@/app/components/swap/SwapParameter"
import DecimalAmount from "@/app/components/ui/DecimalAmount"
import { NumberFormatType } from "@/app/config/numbers"
import { iconSizes } from "@/app/config/styling"
import { defaultSlippageBps } from "@/app/config/swaps"
import usePreferences from "@/app/hooks/preferences/usePreferences"
import useExchangeRate from "@/app/hooks/swap/useExchangeRate"
import { formatDuration } from "@/app/lib/datetime"
import { bpsToPercent } from "@/app/lib/numbers"
import { getNativeToken } from "@/app/lib/tokens"
import { PreferenceType } from "@/app/types/preferences"
import { Route } from "@/app/types/swaps"

interface SwapOverviewProps extends React.ComponentPropsWithoutRef<"div"> {
    route: Route,
    isSelected?: boolean,
}

const SwapOverview = React.forwardRef<HTMLDivElement, SwapOverviewProps>(({
    className,
    route,
    isSelected,
    ...props
}, ref) => {

    const nativeToken = getNativeToken(route.srcChain)
    const { preferences } = usePreferences()
    const exchangeRate = useExchangeRate({
        srcToken: route.srcToken,
        srcAmount: route.srcAmount,
        dstToken: route.dstToken,
        dstAmount: route.dstAmount,
    })

    return (
        <div
            ref={ref}
            className={twMerge("flex flex-col flex-1 p-4 gap-4", className)}
            data-selected={isSelected ? true : false}
            {...props}
        >
            <div className="flex flex-col flex-1 gap-1">
                <SwapParameter
                    icon=<SendIcon className={iconSizes.sm} />
                    label="To send"
                    value=<DecimalAmount
                        amountFormatted={route.srcAmountFormatted}
                        symbol={route.srcToken.symbol}
                        token={route.srcToken}
                        type={NumberFormatType.Precise}
                        className="font-mono text-base"
                    />
                />
                <SwapParameter
                    icon=<ReceiveIcon className={iconSizes.sm} />
                    label="Est. to receive"
                    value=<DecimalAmount
                        amountFormatted={route.dstAmountFormatted}
                        symbol={route.dstToken.symbol}
                        token={route.dstToken}
                        type={NumberFormatType.Precise}
                        className="font-mono text-base"
                    />
                />
                <SwapParameter
                    icon=<InfoIcon className={iconSizes.sm} />
                    label="Min. to receive"
                    value=<DecimalAmount
                        amountFormatted={route.minDstAmountFormatted}
                        symbol={route.dstToken.symbol}
                        token={route.dstToken}
                        type={NumberFormatType.Precise}
                        className="font-mono text-base text-muted-400"
                    />
                />
                <SwapParameter
                    icon=<ExchangeRateIcon className={iconSizes.sm} />
                    label="Exchange rate"
                    value=<div className="contents font-mono text-base">
                        {exchangeRate !== undefined ? (<>
                            1 {route.srcToken.symbol}&nbsp;
                            <ApproxEqualIcon className={iconSizes.xs} />&nbsp;
                            <DecimalAmount
                                amount={exchangeRate}
                                symbol={route.dstToken.symbol}
                                token={route.dstToken}
                                type={NumberFormatType.Precise}
                            />
                        </>) : "-"}
                    </div>
                />
                <SwapParameter
                    icon={<SlippageIcon className={iconSizes.sm} />}
                    label="Max. slippage"
                    value={`${bpsToPercent(preferences[PreferenceType.Slippage] ?? defaultSlippageBps)}%`}
                    valueClass="font-mono text-base"
                />
                <SwapParameter
                    icon=<GasIcon className={iconSizes.sm} />
                    label="Gas fees"
                    value=<DecimalAmount
                        amountFormatted={route.totalGasEstimateFormatted}
                        symbol={nativeToken?.symbol}
                        token={nativeToken}
                        type={NumberFormatType.Precise}
                        className="font-mono text-base"
                    />
                />
                <SwapParameter
                    icon=<DurationIcon className={iconSizes.sm} />
                    label="Est. duration"
                    value={formatDuration(route.durationEstimate)}
                    valueClass="font-mono text-base"
                />
                <SwapParameter
                    icon=<StepIcon className={iconSizes.sm} />
                    label="Num. steps"
                    value={route.quote.events.length}
                    valueClass="font-mono text-base"
                />
            </div>
        </div>
    )
})
SwapOverview.displayName = "SwapOverview"

export default SwapOverview
