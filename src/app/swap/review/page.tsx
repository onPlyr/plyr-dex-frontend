"use client"

import { useRouter } from "next/navigation"
import { useCallback } from "react"
import { TransactionReceipt } from "viem"
import { useAccount, useSwitchChain } from "wagmi"

import ScaleInOut from "@/app/components/animations/ScaleInOut"
import LoadingIcon from "@/app/components/icons/LoadingIcon"
import RouteSummaryBadges from "@/app/components/routes/RouteSummaryBadges"
import SwapEventDetail from "@/app/components/swap/SwapEventDetail"
import SwapOverview from "@/app/components/swap/SwapOverview"
import SwapTokenDetail from "@/app/components/swap/SwapTokenDetail"
import Button from "@/app/components/ui/Button"
import Collapsible from "@/app/components/ui/Collapsible"
import DecimalAmount from "@/app/components/ui/DecimalAmount"
import { Page } from "@/app/components/ui/Page"
import { SwapTab } from "@/app/config/pages"
import { NumberFormatType } from "@/app/config/numbers"
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
import RouteTypeIcon from "@/app/components/icons/RouteTypeIcon"

const ReviewSwapPage = () => {

    const { address: accountAddress, chainId: connectedChainId } = useAccount()
    const connectedChain = connectedChainId ? getChain(connectedChainId) : undefined
    const { switchChainAsync } = useSwitchChain()
    const { refetch: refetchTokens } = useTokens()
    const { handleSrcAmountInput, selectedRoute: route } = useQuoteData()
    const { addSwap } = useSwapData()
    const router = useRouter()

    // todo: proper handling if no route selected
    // if (!route) {
    //     router.push("/swap")
    // }

    const errInitiateSwap = getInitiateSwapErrMsg({
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

    const enabled = !(!accountAddress || !connectedChain || !route || !route.srcChain || !route.srcToken || !route.srcAmount || route.srcAmount === BigInt(0) || !route.dstChain || !route.dstToken)
    const isSwitchChainRequired = enabled && connectedChain.id !== route.srcChain.id
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
            })
            if (swap) {
                addSwap(swap)
                redirectUrl = `/swap/${swap.id}/${swap.srcData.chain.id}`
            }

            refetchTokens()
            refetchAllowance?.()
            handleSrcAmountInput("")

            if (redirectUrl) {
                router.push(redirectUrl)
            }
        }

    }, [refetchTokens, refetchAllowance, handleSrcAmountInput])

    const { write: writeInitiate, isInProgress: initiateIsInProgress } = useWriteInitiateSwap({
        connectedChain: connectedChain,
        accountAddress: accountAddress,
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

    const swapOnClick = isSwitchChainRequired ? (isApprovalRequired ? handleSwitchAndApprove : handleSwitchAndInitiate) : (isApprovalRequired ? writeApprove : writeInitiate)

    const pageFooter = <Button
        className="gradient-btn"
        onClick={!errInitiateSwap ? swapOnClick?.bind(this) : undefined}
        disabled={errInitiateSwap !== undefined}
    >
        {!errInitiateSwap && isSwitchChainRequired && `Switch to ${route!.srcChain.name} and `}{swapActionMsg}
        {(approveIsInProgress || initiateIsInProgress) && (
            <LoadingIcon />
        )}
    </Button>

    // todo: display message / redirect if no route, handle properly
    return route && (
        <Page
            key={SwapTab.Review}
            header={`Review ${getRouteTypeLabel(route.type)}`}
            footer={pageFooter}
            backUrl="/swap"
        >
            <ScaleInOut className="flex flex-col flex-none gap-4 w-full h-fit">
                <div className="container flex flex-col flex-1 p-4 gap-4">
                    <div className="flex flex-col flex-1 gap-4">
                        <div className="flex flex-row flex-1 gap-4 justify-center items-center font-bold text-base">
                            {getRouteTypeLabel(route.type)}
                        </div>
                        <div className="flex flex-row flex-1 gap-4 justify-between items-center">
                            <SwapTokenDetail
                                label="From"
                                token={route.srcToken}
                                chain={route.srcChain}
                            />
                            <div className="flex flex-row flex-1 max-w-16 max-h-16 justify-center items-center text-white">
                                <RouteTypeIcon type={route.type} className="w-full h-full" />
                            </div>
                            <SwapTokenDetail
                                label="To"
                                token={route.dstToken}
                                chain={route.dstChain}
                            />
                        </div>
                        <div className="flex flex-row flex-1 flex-wrap gap-x-1 gap-y-2 justify-center items-center font-bold">
                            {route.type === RouteType.Bridge ? "Transferring" : "Swapping"} from &nbsp;
                            <div
                                className="swap-label border-1"
                                style={{
                                    borderColor: route.srcToken.iconBackground,
                                }}
                            >
                                <DecimalAmount
                                    amountFormatted={route.srcAmountFormatted}
                                    symbol={route.srcToken.symbol}
                                    token={route.srcToken}
                                    type={NumberFormatType.Precise}
                                />
                                &nbsp;on {route.srcChain.name}
                            </div>
                            &nbsp;to&nbsp;
                            <div
                                className="swap-label border-1"
                                style={{
                                    borderColor: route.dstToken.iconBackground,
                                }}
                            >
                                <DecimalAmount
                                    amountFormatted={route.dstAmountFormatted}
                                    symbol={route.dstToken.symbol}
                                    token={route.dstToken}
                                    type={NumberFormatType.Precise}
                                />
                                &nbsp;on {route.dstChain.name}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="container flex flex-col flex-1 p-4 gap-4">
                    <div className="flex flex-row flex-1 justify-end">
                        <RouteSummaryBadges route={route} />
                    </div>
                    <SwapOverview
                        route={route}
                        className="p-0"
                    />
                </div>
                <Collapsible trigger={`${getRouteTypeLabel(route.type)} Steps`}>
                    {route.quote.events.map((event, i) => (
                        <SwapEventDetail
                            key={i}
                            event={event}
                            animate={true}
                            delays={{
                                animate: i * 0.1,
                                exit: (route.quote.events.length - 1 - i) * 0.05,
                            }}
                        />
                    ))}
                </Collapsible>
            </ScaleInOut>
        </Page>
    )
}

export default ReviewSwapPage
