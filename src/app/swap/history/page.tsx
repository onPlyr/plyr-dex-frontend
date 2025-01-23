"use client"

import { useRouter } from "next/navigation"

import "@/app/styles/globals.css"

import SlideInOut from "@/app/components/animations/SlideInOut"
import SwapStatusIcon from "@/app/components/icons/SwapStatusIcon"
import RouteEventTokenDetail from "@/app/components/routes/RouteEventTokenDetail"
import ExternalLink from "@/app/components/ui/ExternalLink"
import { Page } from "@/app/components/ui/Page"
import RouteTypeIcon from "@/app/components/icons/RouteTypeIcon"
import { SelectItem } from "@/app/components/ui/SelectItem"
import { SwapTab } from "@/app/config/pages"
import { iconSizes } from "@/app/config/styling"
import { swapHistoryLocalStorageMsg } from "@/app/config/swaps"
import useSwapData from "@/app/hooks/swap/useSwapData"
import { getBlockExplorerLink } from "@/app/lib/chains"
import { timestampAgo } from "@/app/lib/datetime"
import { getRouteTypeLabel } from "@/app/lib/swaps"

const HistoryPage = () => {

    const { data: swapData } = useSwapData()
    const router = useRouter()

    const swapsPerPage = 10
    const pageSwaps = swapData.slice(0, swapsPerPage)

    return (
        <Page
            key={SwapTab.Transactions}
            header="Transactions"
            backUrl="/swap"
        >
            <div className="flex flex-col flex-none gap-4 w-full h-fit">
                {swapData.length > 0 ? pageSwaps.map((swap, i) => {

                    const initiateTxUrl = getBlockExplorerLink({
                        chain: swap.srcData.chain,
                        tx: swap.id,
                    })
                    const swapTimestamp = swap.timestamp ? timestampAgo(swap.timestamp) : undefined

                    return (
                        <SlideInOut
                            key={`${swap.srcData.chain.id}-${swap.id}`}
                            from="left"
                            to="right"
                            delays={{
                                animate: i * 0.1,
                                exit: (pageSwaps.length - 1 - i) * 0.1,
                            }}
                        >
                            <SelectItem
                                className="container flex flex-col flex-1 p-4 gap-4 cursor-pointer"
                                replaceClass={true}
                                onClick={() => router.push(`/swap/${swap.id}/${swap.srcData.chain.id}`)}
                            >
                                <div className="flex flex-row flex-1 gap-4 justify-between">
                                    <div className="flex flex-row flex-none gap-4 justify-start items-center">
                                        <RouteTypeIcon type={swap.type} className={iconSizes.sm} />
                                        <div className="font-bold">
                                            {swap.type ? getRouteTypeLabel(swap.type) : "Swap"}
                                        </div>
                                        <SwapStatusIcon
                                            status={swap.status}
                                            className={iconSizes.sm}
                                        />
                                    </div>
                                    <div className="flex flex-row flex-1 gap-2 justify-end items-center text-end text-muted-500">
                                        {initiateTxUrl ? (
                                            <ExternalLink
                                                href={initiateTxUrl}
                                                iconSize="xs"
                                            >
                                                {swapTimestamp ?? "View details"}
                                            </ExternalLink>
                                        ) : (swapTimestamp ?? "View details")}
                                    </div>
                                </div>
                                <div className="flex flex-col flex-1 w-full gap-1">
                                    <RouteEventTokenDetail
                                        label="From"
                                        chain={swap.srcData.chain}
                                        token={swap.srcData.token}
                                        amount={swap.srcData.amount}
                                    />
                                    {swap.dstData && (
                                        <RouteEventTokenDetail
                                            label="To"
                                            chain={swap.dstData.chain}
                                            token={swap.dstData.token}
                                            amount={swap.dstData.amount}
                                        />
                                    )}
                                </div>
                            </SelectItem>
                        </SlideInOut>
                    )
                }) : "todo: no swaps found"}
                <div className="flex flex-row flex-1 justify-center items-center font-bold text-muted-500 text-center">
                    {swapHistoryLocalStorageMsg}
                </div>
            </div>
        </Page>
    )
}

export default HistoryPage
