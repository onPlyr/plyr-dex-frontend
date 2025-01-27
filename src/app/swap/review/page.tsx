"use client"

import "@/app/styles/globals.css"

import { useRouter } from "next/navigation"
import { useConnectModal } from "@rainbow-me/rainbowkit"
import { useCallback, useEffect, useState } from "react"
import { TransactionReceipt } from "viem"
import { useAccount, useSwitchChain } from "wagmi"

import LoadingIcon from "@/app/components/icons/LoadingIcon"
import RouteSummaryBadges from "@/app/components/routes/RouteSummaryBadges"
import SwapEventSummary from "@/app/components/swap/SwapEventSummary"
import SwapSummaryLabels from "@/app/components/swap/SwapSummaryLabels"
import SwapSummaryTokenDetail from "@/app/components/swap/SwapSummaryTokenDetail"
import Button from "@/app/components/ui/Button"
import { Page } from "@/app/components/ui/Page"
import { SwapTab } from "@/app/config/pages"
import { iconSizes } from "@/app/config/styling"
import { txActionInProgressMessages, txActionMessages } from "@/app/config/txs"
import useQuoteData from "@/app/hooks/quotes/useQuoteData"
import useSwapData from "@/app/hooks/swap/useSwapData"
import useWriteInitiateSwap from "@/app/hooks/swap/useWriteInitiateSwap"
import useReadAllowance from "@/app/hooks/tokens/useReadAllowance"
import useTokens from "@/app/hooks/tokens/useTokens"
import useWriteApprove from "@/app/hooks/tokens/useWriteApprove"
import { getChain } from "@/app/lib/chains"
import { getInitiateSwapErrMsg, getRouteTypeLabel, getSwapFromQuote } from "@/app/lib/swaps"
import { RouteType } from "@/app/types/swaps"
import { TxActionType } from "@/app/types/txs"

import { shortenAddress } from 'thirdweb/utils';
import { Pencil, RefreshCcw, Wallet2, X } from "lucide-react"

const ReviewSwapPage = () => {

    const { address: accountAddress, chainId: connectedChainId } = useAccount()
    const connectedChain = connectedChainId ? getChain(connectedChainId) : undefined
    const { switchChainAsync } = useSwitchChain()
    const { openConnectModal } = useConnectModal()
    const { refetch: refetchTokens } = useTokens()
    const { handleSrcAmountInput, selectedRoute: route } = useQuoteData()
    const { addSwap } = useSwapData()
    const router = useRouter()

    // Mirror Address //
    const [plyrId, setPlyrId] = useState<string | undefined>(undefined)
    const [plyrAvatar, setPlyrAvatar] = useState<string | undefined>(undefined)
    const [mirrorAddress, setMirrorAddress] = useState<string | undefined>(undefined)
    const [isEditingPlyrId, setIsEditingPlyrId] = useState<boolean>(false)
    const [isEditedPlyrId, setIsEditedPlyrId] = useState<boolean>(false)
    const [destinationAddress, setDestinationAddress] = useState<string | undefined>(undefined)

    useEffect(() => {
        if (accountAddress) {
            setDestinationAddress(accountAddress)
        }
    }, [accountAddress]);

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
        else {
            setPlyrId(undefined)
            setMirrorAddress(undefined)
            setPlyrAvatar(undefined)
            setDestinationAddress(undefined)
        }
    }, [accountAddress])

    const { err: errInitiateSwap, isConnectWalletErr} = getInitiateSwapErrMsg({
        accountAddress: accountAddress,
        route: route,
    })

    const { data: allowance, refetch: refetchAllowance } = useReadAllowance({
        chain: route?.srcChain,
        token: route?.srcToken,
        accountAddress: accountAddress,
        spenderAddress: route?.srcCell.address,
        _enabled: route !== undefined,
    })


    const enabled = !(!accountAddress || !route || !route.srcChain || !route.srcToken || !route.srcAmount || route.srcAmount === BigInt(0) || !route.dstChain || !route.dstToken)
    const isSwitchChainRequired = !connectedChain || (route && connectedChain.id !== route.srcChain.id)


    const isApprovalRequired = enabled && (route.srcToken.isNative !== true && !(allowance !== undefined && allowance >= route.srcAmount))

    const approveOnConfirmation = useCallback(() => {
        refetchAllowance?.()
    }, [refetchAllowance])

    const { write: writeApprove, isInProgress: approveIsInProgress } = useWriteApprove({
        chain: route?.srcChain,
        token: route?.srcToken,
        spenderAddress: route?.srcCell.address,
        amount: route?.srcAmount,
        onConfirmation: approveOnConfirmation,
        _enabled: enabled && isApprovalRequired,
    })

    const initiateOnConfirmation = useCallback((receipt?: TransactionReceipt) => {

        let redirectUrl: `/${string}` | undefined = undefined

        if (receipt) {
            const swap = getSwapFromQuote({
                route: route,
                txHash: receipt.transactionHash,
                accountAddress: accountAddress,
                plyrId: plyrId && destinationAddress && destinationAddress !== accountAddress ? plyrId : undefined,
                destinationAddress: destinationAddress
            })
            if (swap) {
                addSwap(swap)
                let plyrToCheck = '';
                if (plyrId && destinationAddress && destinationAddress !== accountAddress && route) {
                    plyrToCheck = '?plyrId=' + plyrId
                }
                redirectUrl = `/swap/${swap.id}/${swap.srcData.chain.id}` + plyrToCheck
            }

            refetchTokens()
            refetchAllowance?.()
            handleSrcAmountInput("")

            if (redirectUrl) {
                router.push(redirectUrl)
            }
        }

    }, [refetchTokens, refetchAllowance, handleSrcAmountInput, plyrId, destinationAddress])

    const { write: writeInitiate, isInProgress: initiateIsInProgress, status: initiateStatus } = useWriteInitiateSwap({
        connectedChain: connectedChain,
        accountAddress: accountAddress,
        destinationAddress: destinationAddress,
        route: route,
        onConfirmation: initiateOnConfirmation,
        _enabled: enabled && !errInitiateSwap && !isSwitchChainRequired && !isApprovalRequired,
    })

    const approvalMsg = isApprovalRequired ? approveIsInProgress ? txActionInProgressMessages[TxActionType.Approve] : txActionMessages[TxActionType.Approve] : undefined
    const initiateAction = route?.type === RouteType.Bridge ? TxActionType.Bridge : TxActionType.Swap
    const initiateMsg = initiateIsInProgress ? txActionInProgressMessages[initiateAction] : txActionMessages[initiateAction]
    const swapActionMsg = errInitiateSwap ?? (isApprovalRequired ? approvalMsg : initiateMsg)

    const handleSwitchAndApprove = useCallback(async () => {
        if (route && writeApprove) {
            await switchChainAsync({
                chainId: route.srcChain.id,
            })
            writeApprove()
        }
    }, [route, writeApprove, switchChainAsync])

    const handleSwitchAndInitiate = useCallback(async () => {
        if (route && writeInitiate) {
            await switchChainAsync({
                chainId: route.srcChain.id,
            })
            writeInitiate()
        }
    }, [route, writeInitiate, switchChainAsync])

    const swapOnClick = isConnectWalletErr ? openConnectModal : isSwitchChainRequired ? (isApprovalRequired ? handleSwitchAndApprove : handleSwitchAndInitiate) : (isApprovalRequired ? writeApprove : writeInitiate)
    const swapBtnEnabled = isConnectWalletErr || isSwitchChainRequired || (enabled && !errInitiateSwap && !approveIsInProgress && !initiateIsInProgress && destinationAddress)


    const pageFooter = <Button
        className="gradient-btn"
        onClick={swapBtnEnabled ? swapOnClick?.bind(this) : undefined}
        disabled={!swapBtnEnabled}
    >
         {errInitiateSwap ?? `${isSwitchChainRequired ? `Switch to ${route!.srcChain.name} and ${swapActionMsg}` : swapActionMsg}`}
        {(approveIsInProgress || initiateIsInProgress) && (
            <LoadingIcon className={iconSizes.sm} />
        )}
    </Button>

    const reviewSwap = getSwapFromQuote({
        route: route,
        isReviewSwap: true,
    })

    useEffect(() => {
        console.log('route', route)
        console.log('initiateStatus', initiateStatus)
        if (!route && initiateStatus !== "success") {
            router.push("/swap")
        }
    }, [route])

    // todo: display message / redirect if no route, handle properly
    return route && reviewSwap && (
        <Page
            key={SwapTab.Review}
            header={`Review ${getRouteTypeLabel(route.type)}`}
            footer={pageFooter}
            backUrl="/swap"
        >
            <div className="flex flex-col flex-none gap-4 w-full h-fit">
                <div
                    className="container-select p-6"
                    data-selected={true}
                >
                    <div className="flex flex-col flex-1 gap-4">
                        <div className="flex flex-col sm:flex-row flex-1 gap-4">
                            <SwapSummaryTokenDetail
                                token={route.dstToken}
                                chain={route.dstChain}
                                amountFormatted={route.dstAmountFormatted}
                                minAmountFormatted={route.minDstAmountFormatted}
                            />
                            <RouteSummaryBadges route={route} />
                        </div>
                        <SwapSummaryLabels
                            route={route}
                            hideEvents={true}
                        />
                    </div>
                </div>
                <SwapEventSummary swap={reviewSwap} isReviewSwap={true} />

                <div className="container flex flex-col flex-1 p-4 gap-4">
                    <div className="flex flex-row flex-1 gap-4">
                        <div>Destination Address</div>
                        <div className="font-bold text-right">{destinationAddress ? shortenAddress(destinationAddress) : 'Please select a destination address'}</div>
                    </div>
                    {/* Destination Address */}
                    <div className="flex flex-col md:flex-row flex-1 justify-center items-center gap-2 md:gap-4">
                        <div onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (approveIsInProgress || initiateIsInProgress) return;
                            setDestinationAddress(accountAddress || undefined)
                        }} className={`w-full flex flex-row items-center justify-center p-2 md:p-4 flex-1 border-2 ${accountAddress === destinationAddress ? "border-[#daff00]" : "border-transparent"} rounded-3xl bg-[#ffffff10] text-white text-xs cursor-pointer`}>
                            <Wallet2 className="w-8 h-8 md:w-10 md:h-10 text-white mr-2 md:mr-4 ml-1" />
                            <div className="flex flex-col flex-1 justify-center items-start gap-0">
                                <div className="font-bold text-[10px] md:text-xs">EVM ADDRESS</div>
                                <div className="text-sm md:text-base">{accountAddress && shortenAddress(accountAddress)}</div>
                            </div>
                        </div>
                        {
                            (route.dstToken.chainId.toString() === '62831' || route.dstToken.chainId.toString() === '16180') &&
                            <div onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (approveIsInProgress || initiateIsInProgress) return;
                                setDestinationAddress(mirrorAddress || undefined)
                            }} className={`w-full relative flex flex-row items-center justify-start p-2 md:p-4 flex-1 border-2 ${destinationAddress === mirrorAddress ? "border-[#daff00]" : "border-transparent"} rounded-3xl bg-[#ffffff10] text-white text-xs cursor-pointer`}>
                                <button onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (approveIsInProgress || initiateIsInProgress) return;
                                    getUserInfo(accountAddress || '', true)
                                }} className="absolute top-2 right-3">
                                    <RefreshCcw className="w-4 h-4 text-white" style={{ strokeWidth: 2 }} />
                                </button>
                                {
                                    !isEditingPlyrId && <button onClick={() => {
                                        if (approveIsInProgress || initiateIsInProgress) return;
                                        setIsEditingPlyrId(true)
                                    }} className="absolute top-2 right-10">
                                        <Pencil className="w-4 h-4 text-white" style={{ strokeWidth: 2 }} />
                                    </button>
                                }
                                {
                                    plyrId && <img src={plyrAvatar} alt="PLYR Avatar" className="w-8 h-8 md:w-10 md:h-10 rounded-full mr-2 md:mr-4 ml-1" />
                                }
                                {
                                    !plyrId && <X className="w-8 h-8 md:w-10 md:h-10 rounded-full mr-4 ml-1" />
                                }
                                <div className=" flex flex-col flex-1 justify-center items-start gap-0">

                                    {

                                        isEditingPlyrId ? <>
                                            <form onSubmit={(e) => { e.preventDefault(); setIsEditingPlyrId(false); getUserInfo(plyrId?.trim()?.toUpperCase() || '', true); }}>
                                                <input autoFocus={true} className="bg-transparent uppercase text-lg border-b border-white text-white focus:outline-none" type="text" value={plyrId} onChange={(e) => setPlyrId(e.target.value)} onBlur={(e) => { setIsEditingPlyrId(false); getUserInfo(e.target.value.trim().toUpperCase(), true); }} />
                                            </form>
                                        </> :
                                            <>
                                                <div className="font-bold text-[10px] md:text-xs">PLYR[ID]</div>
                                                <div className="text-sm md:text-base">{plyrId ? plyrId.toUpperCase() : 'NOT FOUND'}

                                                    {/* {mirrorAddress && shortenAddress(mirrorAddress)} */}
                                                </div>
                                            </>
                                    }
                                </div>
                            </div>
                        }
                    </div>
                </div>

            </div>
        </Page>
    )
}

export default ReviewSwapPage