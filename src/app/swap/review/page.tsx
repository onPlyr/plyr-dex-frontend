"use client"

import "@/app/styles/globals.css"

import { AnimatePresence } from "motion/react"
import { useRouter } from "next/navigation"
import { useConnectModal } from "@rainbow-me/rainbowkit"
import { useCallback, useEffect, useMemo, useState } from "react"
import { TransactionReceipt } from "viem"
import { useAccount } from "wagmi"

import LoadingIcon from "@/app/components/icons/LoadingIcon"
import QuoteExpiry from "@/app/components/swap/QuoteExpiry"
import SwapEventTabs from "@/app/components/swap/SwapEventTabs"
import SwapPreview from "@/app/components/swap/SwapPreview"
import SwapRecipientInput from "@/app/components/swap/SwapRecipientInput"
import SwapSlippageInput from "@/app/components/swap/SwapSlippageInput"
import Button from "@/app/components/ui/Button"
import { Page } from "@/app/components/ui/Page"
import { iconSizes } from "@/app/config/styling"
import useApiData from "@/app/hooks/apis/useApiData"
import useLatestBlocks from "@/app/hooks/blocks/useLatestBlocks"
import useNotifications from "@/app/hooks/notifications/useNotifications"
import useQuoteData from "@/app/hooks/quotes/useQuoteData"
import useAlternativeSwapQuote from "@/app/hooks/swap/useAlternativeSwapQuote"
import useSwapHistory from "@/app/hooks/swap/useSwapHistory"
import useSwapRecipient from "@/app/hooks/swap/useSwapRecipient"
import useSwapSlippage from "@/app/hooks/swap/useSwapSlippage"
import useWriteInitiateSwap from "@/app/hooks/swap/useWriteInitiateSwap"
import useReadAllowance from "@/app/hooks/tokens/useReadAllowance"
import useTokens from "@/app/hooks/tokens/useTokens"
import useWriteApprove from "@/app/hooks/tokens/useWriteApprove"
import { getInitiatedBlockNumber, getInitiateSwapError, getSwapChainIds } from "@/app/lib/swaps"
import { getTxActionLabel } from "@/app/lib/txs"
import { PageType } from "@/app/types/navigation"
import { NotificationStatus, NotificationType } from "@/app/types/notifications"
import { InitiateSwapAction, isTransferType, isValidInitiateSwapQuote, isValidSwapQuote, SwapHistory, SwapQuote, SwapStatus, SwapTypeLabel } from "@/app/types/swaps"
import { isNativeToken } from "@/app/types/tokens"
import { TxAction, TxLabelType } from "@/app/types/txs"

import { shortenAddress } from 'thirdweb/utils';
import { Pencil, RefreshCcw, Wallet2, X } from "lucide-react"

const ReviewSwapPage = () => {

    const { address: accountAddress, isConnected } = useAccount()
    const { getNativeToken, getSupportedTokenById, useBalancesData, refetch: refetchTokens } = useTokens()
    const { getBalance, isInProgress: balanceIsInProgress } = useBalancesData
    const { setSwapHistory, setInitiateSwapData } = useSwapHistory()
    const { getFirmQuote } = useApiData()
    const { setSrcAmountInput, selectedQuote } = useQuoteData()
    const { setNotification, removeNotification } = useNotifications()
    const { openConnectModal } = useConnectModal()
    const router = useRouter()

    const [quote, setQuote] = useState(selectedQuote)
    const [confirmedQuoteId, setConfirmedQuoteId] = useState<string>()
    const [initiatePromptedId, setInitiatePromptedId] = useState<string>()
    const useSwapRecipientData = useSwapRecipient({
        swap: quote,
        setSwap: setQuote,
        initialRecipient: accountAddress,
    })
    const useSwapSlippageData = useSwapSlippage({
        swap: quote,
        setSwap: setQuote,
    })

    const quoteChainIds = useMemo(() => quote ? getSwapChainIds(quote) : [], [quote])
    const { getLatestBlock } = useLatestBlocks(quoteChainIds)

    useAlternativeSwapQuote({
        quote: quote,
        setQuote: setQuote,
    })

    useEffect(() => {
        if (quote) {
            quote.accountAddress = accountAddress
            if (!quote.recipientAddress) {
                quote.recipientAddress = accountAddress
            }
            setQuote(quote)
        }
    }, [quote, accountAddress])

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


    // Set Quote of recipient address
    useEffect(() => {
        setQuote((prev) => (prev && {
            ...prev,
            recipientAddress: destinationAddress as `0x${string}` || undefined,
        }))
    }, [destinationAddress])

    const { srcData, dstData } = quote ?? {}
    const { srcBalance, nativeBalance } = useMemo(() => {

        const srcBalance = getBalance(srcData?.token)
        const nativeBalance = isNativeToken(srcData?.token) ? srcBalance : getBalance(getNativeToken(srcData?.chain.id))

        return {
            srcBalance,
            nativeBalance,
        }

    }, [getBalance, getNativeToken, srcData])

    const isValidQuote = quote && isValidSwapQuote(quote)
    const isValidInitiate = isValidQuote && isValidInitiateSwapQuote(quote)

    // todo: check if review quote has expired, add time limit (eg. 5 mins) and prevent swapping before refreshing or force auto update to prevent stale quotes
    // todo: add message / 404 / notification on redirect
    useEffect(() => {
        if (!isValidQuote) {
            router.push("/swap")
        }
    }, [router, isValidQuote])

    const { data: allowance, refetch: refetchAllowance, isInProgress: allowanceIsInProgress } = useReadAllowance({
        chain: srcData?.chain,
        token: srcData?.token,
        accountAddress: accountAddress,
        spenderAddress: srcData?.cell.address,
        _enabled: isConnected,
    })

    const enabled = isConnected && !(!accountAddress || !isValidQuote || !srcData || !dstData)
    const isApprove = useMemo(() => enabled && !isNativeToken(srcData.token) && (!allowance || allowance < quote.srcAmount), [enabled, srcData?.token, allowance, quote?.srcAmount])
    const isConfirmQuote = useMemo(() => !quote?.isConfirmed, [quote?.isConfirmed])

    const initiateOnSettled = useCallback((receipt?: TransactionReceipt) => {

        // todo: testing, may need updating, eg. error message
        if (!enabled || !receipt || !isValidInitiate) {
            return
        }

        // todo: should probably be put in a function somewhere
        const swap: SwapHistory = {
            ...quote,
            hops: quote.hops.map((hop) => ({
                ...hop,
                initiatedBlock: getInitiatedBlockNumber(getLatestBlock(hop.srcData.chain.id)),
                status: SwapStatus.Pending,
            })),
            events: quote.events.map((event) => ({
                ...event,
                status: SwapStatus.Pending,
            })),
            accountAddress: accountAddress,
            txHash: receipt.transactionHash,
            dstInitiatedBlock: getInitiatedBlockNumber(getLatestBlock(quote.dstData.chain.id)),
            status: SwapStatus.Pending,
            plyrId: quote?.recipientAddress && quote?.recipientAddress !== accountAddress ? plyrId : undefined,
        }

        setSwapHistory(swap)
        setInitiateSwapData(swap, receipt)
        refetchTokens()
        refetchAllowance()
        setSrcAmountInput("")

        router.push(`/swap/${receipt.transactionHash}/${swap.srcData.chain.id}${quote?.recipientAddress && quote?.recipientAddress !== accountAddress ? `?plyrId=${plyrId}` : ""}`)

    }, [enabled, isValidInitiate, router, quote, refetchTokens, refetchAllowance, setSrcAmountInput, setSwapHistory, setInitiateSwapData, getLatestBlock, accountAddress])

    const { write: writeInitiate, isInProgress: initiateIsInProgress } = useWriteInitiateSwap({
        quote: quote,
        callbacks: {
            onSettled: initiateOnSettled,
        },
    })

    const switchQuote = useCallback((newQuote: SwapQuote) => {
        if (quote?.recipientAddress) {
            newQuote.recipientAddress = quote.recipientAddress
        }
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

            const { swap: confirmedQuote, error } = await getFirmQuote(quote, getSupportedTokenById) ?? {}

            if (confirmedQuote) {
                switchQuote(confirmedQuote)
                if (confirmedQuote.isConfirmed) {
                    setConfirmedQuoteId(confirmedQuote.id)
                }
            }

            setNotification({
                id: quote.id,
                type: error ? NotificationType.Error : NotificationType.Success,
                header: error ? "Error Confirming Quote" : "Quote Confirmed",
                body: error ?? "Successfully confirmed quote!",
                status: error ? NotificationStatus.Error : NotificationStatus.Success,
            })

            // if (!error) {
            //     writeInitiate()
            // }
        }

    }, [enabled, getSupportedTokenById, quote, isConfirmQuote, getFirmQuote, setConfirmedQuoteId, switchQuote, setNotification])

    useEffect(() => {
        if (quote?.isConfirmed && quote.id === confirmedQuoteId && quote.id !== initiatePromptedId) {
            writeInitiate()
            setInitiatePromptedId(quote.id)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [quote?.isConfirmed, confirmedQuoteId])

    const approveOnSettled = useCallback(() => {
        refetchAllowance()
    }, [refetchAllowance])

    const { write: writeApprove, isInProgress: approveIsInProgress } = useWriteApprove({
        chain: srcData?.chain,
        token: srcData?.token,
        spenderAddress: srcData?.cell?.address,
        amount: quote?.srcAmount,
        callbacks: {
            onSettled: approveOnSettled,
            onSuccess: (isConfirmQuote ? confirmQuote : writeInitiate),
        },
        _enabled: isApprove,
    })

    const isInProgress = balanceIsInProgress || allowanceIsInProgress || approveIsInProgress || initiateIsInProgress
    const { errorMsg, isConnectError } = getInitiateSwapError({
        action: InitiateSwapAction.Initiate,
        isConnected: isConnected,
        srcToken: srcData?.token,
        srcBalance: srcBalance,
        nativeBalance: nativeBalance,
        selectedQuote: quote,
        isInProgress: isInProgress,
    })
    const approveLabel = getTxActionLabel(TxAction.Approve, approveIsInProgress ? TxLabelType.InProgress : TxLabelType.Default)
    const initiateLabel = getTxActionLabel(quote && isTransferType(quote.type) ? TxAction.Transfer : TxAction.Swap, initiateIsInProgress ? TxLabelType.InProgress : TxLabelType.Default)

    const handleInitiate = useCallback(() => {

        if (isConnectError || !isConnected) {
            openConnectModal?.()

        }

        else if (!enabled || !isValidInitiate || errorMsg) {
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


    }, [enabled, isValidInitiate, quote, errorMsg, isConfirmQuote, isConnected, isConnectError, isApprove, openConnectModal, setNotification, writeInitiate, confirmQuote, writeApprove])

    const pageHeader = quote && <div className="relative flex flex-row flex-1 gap-4 justify-center items-center">
        <div className="flex flex-row flex-none justify-center items-center">
            Review {SwapTypeLabel[quote.type]}
        </div>
        <div className="flex flex-row flex-none gap-4 absolute end-0 justify-end items-center">
            <QuoteExpiry />
        </div>
    </div>

    const pageFooter = <>
        <Button
            className="gradient-btn"
            onClick={handleInitiate.bind(this)}
            disabled={isInProgress}
            isAnimated={true}
        >
            {approveIsInProgress ? approveLabel : initiateIsInProgress ? initiateLabel : allowanceIsInProgress ? "Loading" : errorMsg ? errorMsg : isApprove ? approveLabel : initiateLabel}
            {isInProgress && <LoadingIcon className={iconSizes.sm} />}
        </Button>
    </>

    // todo: display message / redirect if no route, handle properly
    return (
        <Page
            key={PageType.Review}
            header={pageHeader}
            footer={pageFooter}
            backUrl="/swap"
        >
            <div className="flex flex-col flex-none gap-4 w-full h-fit">
                {quote && (
                    <div className="flex flex-col flex-none gap-4">
                        <SwapPreview
                            swap={quote}
                            isReviewPage={true}
                        />
                        <SwapEventTabs
                            swap={quote}
                            useSwapRecipientData={useSwapRecipientData}
                            useSwapSlippageData={useSwapSlippageData}
                        />
                    </div>
                )}

                {/* Destination Address */}
                <div className="container flex flex-col flex-1 p-4 gap-4">
                    <div className="flex flex-row flex-1 gap-4">
                        <div>Destination Address</div>
                        <div className="font-bold text-right">{quote?.recipientAddress ? shortenAddress(quote?.recipientAddress) : 'Please select a destination address'}</div>
                    </div>

                </div>
                <div className="flex flex-col md:flex-row flex-1 justify-center items-center gap-2 md:gap-4">
                    <div onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (approveIsInProgress || initiateIsInProgress) return;
                        setDestinationAddress(accountAddress as `0x${string}` || undefined)
                    }} className={`w-full flex flex-row items-center justify-center p-2 md:p-4 flex-1 border-2 ${accountAddress === quote?.recipientAddress ? "border-[#daff00]" : "border-transparent"} rounded-3xl bg-[#ffffff10] text-white text-xs cursor-pointer`}>
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
                            //alert(mirrorAddress)
                            if (approveIsInProgress || initiateIsInProgress) return;
                            setDestinationAddress(mirrorAddress as `0x${string}` || undefined)
                        }} className={`w-full relative flex flex-row items-center justify-start p-2 md:p-4 flex-1 border-2 ${quote?.recipientAddress === mirrorAddress ? "border-[#daff00]" : "border-transparent"} rounded-3xl bg-[#ffffff10] text-white text-xs cursor-pointer`}>
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
                </div>
            </div>

            {/* <AnimatePresence mode="wait">
                {quote && useSwapRecipientData.showRecipient && (
                    <SwapRecipientInput useSwapRecipientData={useSwapRecipientData} />
                )}
            </AnimatePresence> */}
            <AnimatePresence mode="wait">
                {quote && useSwapSlippageData.showSlippage && (
                    <SwapSlippageInput useSwapSlippageData={useSwapSlippageData} />
                )}
            </AnimatePresence>
        </Page>
    )
}

export default ReviewSwapPage