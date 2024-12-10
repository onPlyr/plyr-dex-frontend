"use client"

import * as React from "react"
import { useCallback, useEffect, useState } from "react"
import { Hash } from "viem"
import { useSwitchChain } from "wagmi"

import LoadingIcon from "@/app/components/icons/LoadingIcon"
import RouteDetailItem from "@/app/components/routes/RouteDetailItem"
import SwapStatusDetailItem from "@/app/components/swap/SwapStatusDetailItem"
import Button from "@/app/components/ui/Button"
import { Dialog, DialogProps } from "@/app/components/ui/Dialog"
import { TabContent, TabsContainer, TabsList, TabTrigger } from "@/app/components/ui/Tabs"
import { getActionTxStatus, getRouteTypeLabel } from "@/app/lib/swaps"
import { Route, RouteTxData, RouteType, SwapHistory } from "@/app/types/swaps"
import { TxActionType, TxReceiptStatusType, TxStatusType } from "@/app/types/txs"
import DecimalAmount from "../ui/DecimalAmount"

export interface ReviewRouteDialogProps extends DialogProps {
    route?: Route,
    allRoutes?: Route[],
    routeTxData?: RouteTxData,
    maxDstAmount: bigint,
    reviewErr?: string,
    initiateErr?: string,
    isSwitchChainRequired?: boolean,
    isApprovalRequired?: boolean,
    handleWriteApprove?: () => void,
    handleWriteInitiate?: () => void,
    handleInitiateTxComplete?: () => void,
    approveTxHash?: Hash,
    approveTxStatus: TxStatusType,
    approveTxReceiptStatus: TxReceiptStatusType,
    initiateTxHash?: Hash,
    initiateTxStatus: TxStatusType,
    initiateTxReceiptStatus: TxReceiptStatusType,
    latestSwap?: SwapHistory,
    pendingSwap?: SwapHistory,
}

enum ReviewRouteDialogTab {
    RouteDetail = "routeDetail",
    SwapStatus = "swapStatus",
}
const reviewRouteDialogDefaultTab = ReviewRouteDialogTab.RouteDetail

export const ReviewRouteDialog = React.forwardRef<React.ElementRef<typeof Dialog>, ReviewRouteDialogProps>(({
    trigger,
    header,
    route,
    allRoutes,
    routeTxData,
    maxDstAmount,
    reviewErr,
    initiateErr,
    isSwitchChainRequired,
    isApprovalRequired,
    handleWriteApprove,
    handleWriteInitiate,
    handleInitiateTxComplete,
    approveTxHash,
    approveTxStatus,
    approveTxReceiptStatus,
    initiateTxHash,
    initiateTxStatus,
    initiateTxReceiptStatus,
    latestSwap,
    pendingSwap,
    disabled = false,
    ...props
}, ref) => {

    const { switchChainAsync } = useSwitchChain()
    const [isOpen, setIsOpen] = useState<boolean>(false)

    const [activeTab, setActiveTab] = useState<ReviewRouteDialogTab>(reviewRouteDialogDefaultTab)
    const setTab = useCallback((tab: string) => {
        setActiveTab(tab && (Object.values(ReviewRouteDialogTab) as string[]).includes(tab) ? tab as ReviewRouteDialogTab : reviewRouteDialogDefaultTab)
    }, [setActiveTab])

    const approvalTxData = getActionTxStatus(TxActionType.Approve, approveTxStatus, approveTxReceiptStatus, approveTxHash, routeTxData)
    const initiateTxData = getActionTxStatus(route?.type === RouteType.Bridge ? TxActionType.Bridge : TxActionType.Swap, initiateTxStatus, initiateTxReceiptStatus, initiateTxHash, routeTxData)
    const submitDisabled = disabled || reviewErr !== undefined || initiateErr !== undefined
    const actionMsg = reviewErr ?? initiateErr ?? (isApprovalRequired ? approvalTxData.msg : initiateTxData.msg)

    useEffect(() => {
        if (initiateTxData.isComplete) {
            handleInitiateTxComplete?.()
        }
    }, [initiateTxData, handleInitiateTxComplete])

    // todo: add msg if routes refresh and a better rate is found
    // todo: add msg if alternative better route available
    // todo: need to refetch allowance, balance, set isapproved, etc. when route/src token/account address changes

    const handleSwitchAndApprove = useCallback(async () => {
        if (route && handleWriteApprove) {
            await switchChainAsync({
                chainId: route.srcChain.id,
            })
            handleWriteApprove()
        }
    }, [route, handleWriteApprove, switchChainAsync])

    const handleSwitchAndInitiate = useCallback(async () => {
        if (route && handleWriteInitiate) {
            await switchChainAsync({
                chainId: route.srcChain.id,
            })
            handleWriteInitiate()
        }
    }, [route, handleWriteInitiate, switchChainAsync])

    const onClickAction = isSwitchChainRequired ? (isApprovalRequired ? handleSwitchAndApprove : handleSwitchAndInitiate) : (isApprovalRequired ? handleWriteApprove : handleWriteInitiate)

    const showProgress = pendingSwap !== undefined || route === undefined
    const activeSwapHistory = pendingSwap ?? latestSwap
    const dialogHeader = showProgress ? `${activeSwapHistory ? getRouteTypeLabel(activeSwapHistory.type) : "Swap"} Status` : header
    const dialogFooter = route && showProgress !== true ? (
        <div className="flex flex-col flex-1 gap-4">
            <div className="flex flex-col flex-1 -mt-2 text-sm">
                <div className="flex flex-row flex-1 justify-between items-center">
                    <div>To send</div>
                    <DecimalAmount
                        className="font-bold"
                        amountFormatted={route.srcAmountFormatted}
                        symbol={route.srcToken.symbol}
                        token={route.srcToken}
                    />
                </div>
                <div className="flex flex-row flex-1 justify-between items-center">
                    <div>Est. to receive</div>
                    <DecimalAmount
                        className="font-bold"
                        amountFormatted={route.dstAmountFormatted}
                        symbol={route.dstToken.symbol}
                        token={route.dstToken}
                    />
                </div>
                <div className="flex flex-row flex-1 justify-between items-center">
                    <div>Min. to receive</div>
                    <DecimalAmount
                        className="font-bold"
                        amountFormatted={route.minDstAmountFormatted}
                        symbol={route.dstToken.symbol}
                        token={route.dstToken}
                    />
                </div>
            </div>
            <Button
                className="btn-gradient btn-full"
                onClick={submitDisabled !== true ? onClickAction?.bind(this) : undefined}
                disabled={submitDisabled}
            >
                {isSwitchChainRequired && submitDisabled !== true && `Switch to ${route.srcChain.name} and `}{actionMsg}
                {(approvalTxData.isInProgress || initiateTxData.isInProgress) && (
                    <LoadingIcon />
                )}
            </Button>
        </div>
    ) : undefined

    useEffect(() => {
        setActiveTab(showProgress ? ReviewRouteDialogTab.SwapStatus : ReviewRouteDialogTab.RouteDetail)
    }, [showProgress])

    return (
        <Dialog
            ref={ref}
            trigger={trigger}
            header={dialogHeader}
            footer={dialogFooter}
            open={isOpen}
            onOpenChange={setIsOpen}
            preventOutsideClose={pendingSwap !== undefined || route !== undefined}
            disabled={disabled}
            {...props}
        >
            <TabsContainer value={activeTab} onValueChange={(tab) => setTab(tab)}>
                <TabsList className="hidden">
                    <TabTrigger value={ReviewRouteDialogTab.RouteDetail}>
                        Route Detail
                    </TabTrigger>
                    <TabTrigger value={ReviewRouteDialogTab.SwapStatus}>
                        {route ? getRouteTypeLabel(route.type) : "Swap"} Status
                    </TabTrigger>
                </TabsList>
                <TabContent className="animate-tab-slide-in-out-left" value={ReviewRouteDialogTab.RouteDetail}>
                    {route && allRoutes && (
                        <div className="flex flex-col flex-1 gap-6">
                            <RouteDetailItem
                                route={route}
                                allRoutes={allRoutes}
                                selectedRoute={route}
                                maxDstAmount={maxDstAmount}
                            />
                        </div>
                    )}
                </TabContent>
                <TabContent className="animate-tab-slide-in-out-right" value={ReviewRouteDialogTab.SwapStatus}>
                    <SwapStatusDetailItem
                        history={latestSwap}
                        pendingHistory={pendingSwap}
                        className={showProgress ? "flex" : "hidden"}
                    />
                </TabContent>
            </TabsContainer>
        </Dialog>
    )
})
ReviewRouteDialog.displayName = "ReviewRouteDialog"
