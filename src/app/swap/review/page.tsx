"use client"

import "@/app/styles/globals.css"

import { useRouter } from "next/navigation"
import { useConnectModal } from "@rainbow-me/rainbowkit"
import { useCallback, useEffect, useState } from "react"
import { TransactionReceipt } from "viem"
import { useAccount } from "wagmi"

import LoadingIcon from "@/app/components/icons/LoadingIcon"
import SwapHistoryEventSummary from "@/app/components/swapQuotes/SwapHistoryEventSummary"
import SwapQuoteExpiryTimer from "@/app/components/swapQuotes/SwapQuoteExpiryTimer"
import SwapQuotePreviewSummary from "@/app/components/swapQuotes/SwapQuotePreviewSummary"
import Button from "@/app/components/ui/Button"
import { Page } from "@/app/components/ui/Page"
import { Tooltip } from "@/app/components/ui/Tooltip"
import { SwapTab } from "@/app/config/pages"
import { iconSizes } from "@/app/config/styling"
import useApiData from "@/app/hooks/apis/useApiData"
import useBlockData from "@/app/hooks/blocks/useBlockData"
import useQuoteData from "@/app/hooks/quotes/useQuoteData"
import useSwapHistory from "@/app/hooks/swap/useSwapHistory"
import useWriteInitiateSwap from "@/app/hooks/swap/useWriteInitiateSwap"
import useReadAllowance from "@/app/hooks/tokens/useReadAllowance"
import useTokens from "@/app/hooks/tokens/useTokens"
import useWriteApprove from "@/app/hooks/tokens/useWriteApprove"
import { formatDuration } from "@/app/lib/datetime"
import { amountToLocale } from "@/app/lib/numbers"
import { getInitiateSwapError } from "@/app/lib/swaps"
import useNotifications from "@/app/hooks/notifications/useNotifications"
import { NotificationStatus, NotificationType } from "@/app/types/notifications"
import { InitiateSwapAction, isValidQuoteData, isValidSwapQuote, SwapHistory, SwapQuote, SwapStatus, SwapTypeLabel } from "@/app/types/swaps"

import { shortenAddress } from 'thirdweb/utils';
import { Pencil, RefreshCcw, Wallet2, X } from "lucide-react"

const ReviewSwapPage = () => {

    const { address: accountAddress, isConnected } = useAccount()
    const { getTokenData, refetch: refetchTokens } = useTokens()
    const { setSwapHistory, setInitiateSwapData } = useSwapHistory()
    const { getFirmQuote } = useApiData()
    const { latestBlocks } = useBlockData()
    const { setSrcAmountInput, useSwapQuotesData, selectedQuote, quoteExpiry } = useQuoteData()
    const { setNotification, removeNotification } = useNotifications()
    const { openConnectModal } = useConnectModal()
    const router = useRouter()

    // Mirror Address //
    const [plyrId, setPlyrId] = useState<string | undefined>(undefined)
    const [plyrAvatar, setPlyrAvatar] = useState<string | undefined>(undefined)
    const [mirrorAddress, setMirrorAddress] = useState<string | undefined>(undefined)
    const [isEditingPlyrId, setIsEditingPlyrId] = useState<boolean>(false)
    const [isEditedPlyrId, setIsEditedPlyrId] = useState<boolean>(false)
    const [destinationAddress, setDestinationAddress] = useState<`0x${string}` | undefined>(undefined)

    useEffect(() => {
        if (accountAddress) {
            setDestinationAddress(accountAddress as `0x${string}`)
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
                    setDestinationAddress(localInfoJson.mirrorAddress as `0x${string}` || undefined);
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
                setDestinationAddress(accountAddress as `0x${string}`);


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
                    setDestinationAddress(retJson.mirrorAddress as `0x${string}` || undefined);
                }
            }
        }
        catch (e) {
            console.log(e);
            setDestinationAddress(accountAddress as `0x${string}`);
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


    const [quote, setQuote] = useState(selectedQuote)
    const isValidQuote = quote && isValidSwapQuote(quote)
    const [isConfirmQuote, setIsConfirmQuote] = useState(!quote?.isConfirmed)
    const [initiatedBlockData, setInitiatedBlockData] = useState(latestBlocks)

    // todo: add message / 404 / notification on redirect
    useEffect(() => {
        if (!isValidQuote) {
            router.push("/swap")
        }
    }, [isValidQuote])

    // todo: check if review quote has expired, add time limit (eg. 5 mins) and prevent swapping before refreshing or force auto update to prevent stale quotes
    useEffect(() => {
        if (quote && selectedQuote && selectedQuote.estDstAmount > quote.estDstAmount) {
            setNotification({
                id: quote.id,
                type: NotificationType.Info,
                header: `${amountToLocale(selectedQuote.estDstAmount, selectedQuote.dstData.token.decimals)} ${selectedQuote.dstData.token.symbol} Route Found`,
                body: `An alternative route has been found with an increased estimated return of ${amountToLocale(selectedQuote.estDstAmount, selectedQuote.dstData.token.decimals)} ${selectedQuote.dstData.token.symbol}`,
                action: <Button
                    className="btn gradient-btn px-3 py-2"
                    onClick={switchQuote.bind(this, selectedQuote)}
                >
                    Switch Route
                </Button>,
                status: NotificationStatus.Info,
                isManualDismiss: true,
            })
        }
    }, [quote, selectedQuote])

    useEffect(() => {
        setIsConfirmQuote(!quote?.isConfirmed)
        setInitiatedBlockData(latestBlocks)
    }, [quote?.id])

    const { srcData, dstData } = quote ?? {}
    const { errorMsg, isConnectError } = getInitiateSwapError({
        action: InitiateSwapAction.Initiate,
        isConnected: isConnected,
        selectedQuote: quote,
        srcToken: getTokenData(srcData?.token.id, srcData?.chain.id),
    })

    const { data: allowance, refetch: refetchAllowance } = useReadAllowance({
        chain: srcData?.chain,
        token: srcData?.token,
        accountAddress: accountAddress,
        spenderAddress: srcData?.cell.address,
        _enabled: isConnected,
    })


    const enabled = isConnected && !(!accountAddress || !isValidQuote || !srcData || !dstData)
    const isApprove = enabled && !srcData.token.isNative && (!allowance || allowance < quote.srcAmount)

    const initiateOnSettled = useCallback((receipt?: TransactionReceipt) => {

        // todo: testing, may need updating, eg. error message
        if (!enabled || !receipt || !isValidQuoteData(quote.srcData) || !isValidQuoteData(quote.dstData)) {
            return
        }

        // todo: should probably be put in a function somewhere
        const swap: SwapHistory = {
            ...quote,
            srcData: quote.srcData,
            dstData: quote.dstData,
            hops: quote.hops.map((hop) => ({
                ...hop,
                initiatedBlock: initiatedBlockData[hop.srcData.chain.id]?.number ?? undefined,
                status: SwapStatus.Pending,
            })),
            events: quote.events.map((event) => ({
                ...event,
                status: SwapStatus.Pending,
            })),
            accountAddress: accountAddress,
            txHash: receipt.transactionHash,
            dstInitiatedBlock: initiatedBlockData[quote.dstData.chain.id]?.number ?? undefined,
            status: SwapStatus.Pending,
        }

        setSwapHistory(swap)
        setInitiateSwapData(swap, receipt)
        refetchTokens()
        refetchAllowance()
        setSrcAmountInput("")

        router.push(`/swap/${receipt.transactionHash}/${swap.srcData.chain.id}`)

    }, [enabled, router, quote, refetchTokens, accountAddress, refetchAllowance, setSrcAmountInput, setSwapHistory, initiatedBlockData, setInitiateSwapData])

    const { write: writeInitiate, isInProgress: initiateIsInProgress } = useWriteInitiateSwap({
        quote: quote,
        callbacks: {
            onSettled: initiateOnSettled,
        },
    })

    const switchQuote = useCallback((newQuote: SwapQuote) => {
        setQuote(newQuote)
        removeNotification(quote?.id)
    }, [quote, setQuote, removeNotification])

    const confirmQuote = useCallback(async () => {

        if (enabled && isConfirmQuote && !quote.isConfirmed) {

            setNotification({
                id: quote.id,
                type: NotificationType.Pending,
                header: "Confirming Quote",
                body: "Fetching confirmation for your selected quote.",
                status: NotificationStatus.Pending,
            })

            const { swap: confirmedQuote, error } = await getFirmQuote(quote) ?? {}

            if (confirmedQuote) {
                switchQuote(confirmedQuote)
            }

            setNotification({
                id: quote.id,
                type: error ? NotificationType.Error : NotificationType.Success,
                header: error ? "Error Confirming Quote" : "Quote Confirmed",
                body: error ?? "Successfully confirmed quote!",
                status: error ? NotificationStatus.Error : NotificationStatus.Success,
            })

            if (!error) {
                writeInitiate()
            }
        }

    }, [enabled, quote, isConfirmQuote, getFirmQuote, switchQuote, setNotification, writeInitiate])

    const approveOnSettled = useCallback(() => {
        refetchAllowance()
    }, [refetchAllowance])

    const { write: writeApprove, isInProgress: approveIsInProgress } = useWriteApprove({
        chain: srcData?.chain,
        token: srcData?.token,
        spenderAddress: srcData?.cell?.address,
        amount: quote?.srcAmount,
        quote: quote,
        callbacks: {
            onSettled: approveOnSettled,
            onSuccess: (isConfirmQuote ? confirmQuote : writeInitiate),
        },
        _enabled: isApprove,
    })

    const handleInitiate = useCallback(() => {

        if (isConnectError || !isConnected) {
            openConnectModal?.()
           
        }

        else if (!enabled || errorMsg) {
            
            setNotification({
                id: quote?.id ?? "initiate-disabled",
                type: NotificationType.Error,
                header: `${quote ? SwapTypeLabel[quote.type] : "Quote"} Error`,
                body: errorMsg ?? "Invalid quote.",
                status: NotificationStatus.Error,
            })
        }

        else {
            (isApprove ? writeApprove : isConfirmQuote ? confirmQuote : writeInitiate)()
        }
        

    }, [enabled, quote, errorMsg, isConfirmQuote, isConnected, isConnectError, isApprove, openConnectModal, setNotification, writeInitiate, confirmQuote, writeApprove])

    const pageHeader = quote && <div className="relative flex flex-row flex-1 gap-4 justify-center items-center">
        <div className="flex flex-row flex-none justify-center items-center">
            Review {SwapTypeLabel[quote.type]}
        </div>
        <Tooltip
            trigger=<Button
                label="Refresh"
                className="icon-btn absolute end-0"
                replaceClass={true}
                onClick={useSwapQuotesData.refetch.bind(this)}
            >
                <SwapQuoteExpiryTimer />
            </Button>
        >
            Refresh in {formatDuration(quoteExpiry)}
        </Tooltip>
    </div>

    const pageFooter = <>
        <Button
            className="gradient-btn"
            onClick={handleInitiate.bind(this)}
            disabled={approveIsInProgress || initiateIsInProgress}
        >
            {errorMsg ? errorMsg : isApprove ? "Approve" : quote ? SwapTypeLabel[quote.type] : "Swap"}
            {(approveIsInProgress || initiateIsInProgress) && (
                <LoadingIcon className={iconSizes.sm} />
            )}
        </Button>
    </>

    // todo: display message / redirect if no route, handle properly
    return (
        <Page
            key={SwapTab.Review}
            header={pageHeader}
            footer={pageFooter}
            backUrl="/swap"
        >
            <div className="flex flex-col flex-none gap-4 w-full h-fit">
                <div
                    className="container-select p-4"
                    data-selected={true}
                >
                    <div className="flex flex-col flex-1 gap-4">
                        {quote && (
                            <SwapQuotePreviewSummary
                                quote={quote}
                                quoteData={useSwapQuotesData.data}
                            />
                        )}
                    </div>
                </div>

                
                {quote && <SwapHistoryEventSummary swap={quote} />}

                {/* Destination Address */}
                {/* <div className="container flex flex-col flex-1 p-4 gap-4">
                    <div className="flex flex-row flex-1 gap-4">
                        <div>Destination Address</div>
                        <div className="font-bold text-right">{destinationAddress ? shortenAddress(destinationAddress) : 'Please select a destination address'}</div>
                    </div>
                    
                </div> */}
                {/* <div className="flex flex-col md:flex-row flex-1 justify-center items-center gap-2 md:gap-4">
                        <div onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (approveIsInProgress || initiateIsInProgress) return;
                            setDestinationAddress(accountAddress as `0x${string}` || undefined)
                        }} className={`w-full flex flex-row items-center justify-center p-2 md:p-4 flex-1 border-2 ${accountAddress === destinationAddress ? "border-[#daff00]" : "border-transparent"} rounded-3xl bg-[#ffffff10] text-white text-xs cursor-pointer`}>
                            <Wallet2 className="w-8 h-8 md:w-10 md:h-10 text-white mr-2 md:mr-4 ml-1" />
                            <div className="flex flex-col flex-1 justify-center items-start gap-0">
                                <div className="font-bold text-[10px] md:text-xs">EVM ADDRESS</div>
                                <div className="text-sm md:text-base">{accountAddress && shortenAddress(accountAddress)}</div>
                            </div>
                        </div>
                        {
                            (quote?.dstData.token.chainId.toString() === '62831' || quote?.dstData.token.chainId.toString() === '16180') &&
                            <div onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (approveIsInProgress || initiateIsInProgress) return;
                                setDestinationAddress(mirrorAddress as `0x${string}` || undefined)
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

                                                   
                                                </div>
                                            </>
                                    }
                                </div>
                            </div>
                        }
                    </div> */}
            </div>
        </Page>
    )
}

export default ReviewSwapPage