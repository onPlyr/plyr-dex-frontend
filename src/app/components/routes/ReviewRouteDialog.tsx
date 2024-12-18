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
import { shortenAddress } from "thirdweb/utils"
import { Cross, Pencil, RefreshCcw, Wallet, Wallet2, X } from "lucide-react"
import { bpsToPercent } from "@/app/lib/numbers"
import usePreferences from "@/app/hooks/preferences/usePreferences"
import { PreferenceType } from "@/app/types/preferences"
import { defaultSlippageBps } from "@/app/config/swaps"

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
    accountAddress?: string,
    destinationAddress?: string,
    setDestinationAddress: (address: string | undefined) => void,
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
    accountAddress,
    destinationAddress,
    setDestinationAddress,
    ...props
}, ref) => {

    const { preferences } = usePreferences()

    const { switchChainAsync } = useSwitchChain()
    const [isOpen, setIsOpen] = useState<boolean>(false)

    const [activeTab, setActiveTab] = useState<ReviewRouteDialogTab>(reviewRouteDialogDefaultTab)
    const setTab = useCallback((tab: string) => {
        setActiveTab(tab && (Object.values(ReviewRouteDialogTab) as string[]).includes(tab) ? tab as ReviewRouteDialogTab : reviewRouteDialogDefaultTab)
    }, [setActiveTab])

    const approvalTxData = getActionTxStatus(TxActionType.Approve, approveTxStatus, approveTxReceiptStatus, approveTxHash, routeTxData)
    const initiateTxData = getActionTxStatus(route?.type === RouteType.Bridge ? TxActionType.Bridge : TxActionType.Swap, initiateTxStatus, initiateTxReceiptStatus, initiateTxHash, routeTxData)
    const submitDisabled = disabled || reviewErr !== undefined || initiateErr !== undefined || destinationAddress === undefined
    const actionMsg = reviewErr ?? initiateErr ?? (isApprovalRequired ? approvalTxData.msg : initiateTxData.msg)

    useEffect(() => {
        if (initiateTxData.isComplete) {
            handleInitiateTxComplete?.()
        }
    }, [initiateTxData, handleInitiateTxComplete])


    // Mirror Address //
    const [plyrId, setPlyrId] = useState<string | undefined>(undefined)
    const [plyrAvatar, setPlyrAvatar] = useState<string | undefined>(undefined)
    const [mirrorAddress, setMirrorAddress] = useState<string | undefined>(undefined)
    const [isEditingPlyrId, setIsEditingPlyrId] = useState<boolean>(false)
    const [isEditedPlyrId, setIsEditedPlyrId] = useState<boolean>(false)

    useEffect(() => {
        if (accountAddress) {
            setDestinationAddress(accountAddress)
        }
    }, []);

    // get user info //
    const getUserInfo = async (address: string, isEdited: boolean = false) => {
        if (address === '' && !isEdited) {
            setPlyrId(undefined)
            setMirrorAddress(undefined)
            setPlyrAvatar(undefined)
            return
        }



        if (address === '' && isEdited) {
            address = accountAddress || '';
        }


        // Load from local storage
        const localInfo = localStorage.getItem('plyrswapInfo-' + address);
        if (localInfo) {
            const localInfoJson = JSON.parse(localInfo);
            if (localInfoJson.expiryTime > new Date().getTime()) {
                setPlyrId(localInfoJson.plyrId);
                setMirrorAddress(localInfoJson.mirrorAddress);
                setPlyrAvatar(localInfoJson.avatar);

                if (isEdited) {
                    // alert(localInfoJson.mirrorAddress)
                    setIsEditedPlyrId(false);
                    setDestinationAddress(localInfoJson.mirrorAddress || '');
                }

                return;
            }
        }


        try {
            const response = await fetch('/api/userInfo/', {
                method: 'POST',
                body: JSON.stringify({ searchTxt: address })
            });
            const retJson = await response.json();
            if (retJson?.success === false) {

                setPlyrId('');
                setMirrorAddress('');
                setPlyrAvatar('');
                setDestinationAddress(accountAddress || '');


                // toast({
                //     description: 'This PLYR[ID] not found',
                //     variant: 'destructive',
                // })
                throw new Error('Failed to get PLYR[ID]');
            }
            else {
                setPlyrId(retJson.plyrId);
                setMirrorAddress(retJson.mirrorAddress);
                setPlyrAvatar(retJson.avatar);

                // Save to local storage with address as key and expiry time as value
                const expiryTime = new Date().getTime() + 1000 * 60 * 60 * 24; // 1 day
                localStorage.setItem('plyrswapInfo-' + address, JSON.stringify({ plyrId: retJson.plyrId, mirrorAddress: retJson.mirrorAddress, avatar: retJson.avatar, expiryTime: expiryTime }));


                if (isEdited) {
                    setIsEditedPlyrId(false);
                    setDestinationAddress(retJson.mirrorAddress || '');
                }
            }
        }
        catch (e) {
            console.log(e);
            setDestinationAddress(accountAddress || '');
        }

    }

    useEffect(() => {
        if (accountAddress) {

            getUserInfo(accountAddress)
        }
    }, [accountAddress])

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
                <div className="flex flex-row flex-1 justify-between items-center">
                    <div>Max. slippage</div>
                    <div>{bpsToPercent(preferences[PreferenceType.Slippage] ?? defaultSlippageBps)}%</div>
                </div>
                <div className="flex flex-row flex-1 justify-between items-center">
                    <div>Destination Address</div>
                    <div>{destinationAddress ? shortenAddress(destinationAddress) : 'Please select a destination address'}</div>
                </div>

                {/* Destination Address */}
                <div className="flex mt-4 flex-col md:flex-row flex-1 justify-center items-center gap-4">
                    <div onClick={(e) => { e.preventDefault(); e.stopPropagation(); setDestinationAddress(accountAddress || undefined) }} className={`w-full flex flex-row items-center justify-center p-4 flex-1 border-2 ${accountAddress === destinationAddress ? "border-[#daff00]" : "border-transparent"} rounded-2.5xl bg-[#ffffff10] text-white text-xs cursor-pointer`}>
                        <Wallet2 className="w-10 h-10 text-white mr-4 ml-1" />
                        <div className="flex flex-col flex-1 justify-center items-start gap-0">
                            <div className="font-bold text-xs">EVM ADDRESS ADDRESS</div>
                            <div className="text-base">{accountAddress && shortenAddress(accountAddress)}</div>
                        </div>
                    </div>
                    {
                        (route.dstToken.chainId.toString() === '62831' || route.dstToken.chainId.toString() === '16180') && <div onClick={(e) => { e.preventDefault(); e.stopPropagation(); setDestinationAddress(mirrorAddress || undefined) }} className={`w-full relative flex flex-row items-center justify-start p-4 flex-1 border-2 ${destinationAddress === mirrorAddress ? "border-[#daff00]" : "border-transparent"} rounded-2.5xl bg-[#ffffff10] text-white text-xs cursor-pointer`}>
                            <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); getUserInfo(accountAddress || '', true) }} className="absolute top-2 right-3">
                                <RefreshCcw className="w-4 h-4 text-white" style={{ strokeWidth: 2 }} />
                            </button>
                            {
                                !isEditingPlyrId && <button onClick={() => setIsEditingPlyrId(true)} className="absolute top-2 right-10">
                                    <Pencil className="w-4 h-4 text-white" style={{ strokeWidth: 2 }} />
                                </button>
                            }
                            {
                                plyrId && <img src={plyrAvatar} alt="PLYR Avatar" className="w-10 h-10 rounded-full mr-4 ml-1" />
                            }
                            {
                                !plyrId && <X className="w-10 h-10 rounded-full mr-4 ml-1" />
                            }
                            <div className=" flex flex-col flex-1 justify-center items-start gap-0">

                                {

                                    isEditingPlyrId ? <>
                                        <form onSubmit={(e) => { e.preventDefault(); setIsEditingPlyrId(false); getUserInfo(plyrId?.trim()?.toUpperCase() || '', true); }}>
                                            <input autoFocus={true} className="bg-transparent uppercase text-lg border-b border-white text-white focus:outline-none" type="text" value={plyrId} onChange={(e) => setPlyrId(e.target.value)} onBlur={(e) => { setIsEditingPlyrId(false); getUserInfo(e.target.value.trim().toUpperCase(), true); }} />
                                        </form>
                                    </> :
                                        <>
                                            <div className="font-bold text-xs">PLYR[ID]</div>
                                            <div className="text-base">{plyrId ? plyrId.toUpperCase() : 'NOT FOUND'}

                                                {/* {mirrorAddress && shortenAddress(mirrorAddress)} */}
                                            </div>
                                        </>
                                }
                            </div>
                        </div>
                    }
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


    console.log('showProgress', showProgress);
    console.log('activeTab', activeTab);

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
            <TabsContainer value={activeTab}>
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
                        plyrId={plyrId}
                        isPlyrDestination={destinationAddress?.toLowerCase() !== accountAddress?.toLowerCase()}
                    />
                </TabContent>
            </TabsContainer>
        </Dialog>
    )
})
ReviewRouteDialog.displayName = "ReviewRouteDialog"
