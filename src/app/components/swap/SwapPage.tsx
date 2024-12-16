"use client"

import { useCallback, useEffect, useState } from "react"
import { parseUnits } from "viem"
import { useAccount } from "wagmi"

import ArrowIcon from "@/app/components/icons/ArrowIcon"
import ChevronIcon from "@/app/components/icons/ChevronIcon"
import { RefreshIcon } from "@/app/components/icons/RefreshIcon"
import RouteIcon from "@/app/components/icons/RouteIcon"
import { SettingsIcon } from "@/app/components/icons/SettingsIcon"
import SwapIcon from "@/app/components/icons/SwapIcon"
import PreferencesDialog from "@/app/components/preferences/PreferencesDialog"
import { ReviewRouteButton } from "@/app/components/routes/ReviewRouteButton"
import { ReviewRouteDialog } from "@/app/components/routes/ReviewRouteDialog"
import RouteSummaryItem from "@/app/components/routes/RouteSummaryItem"
import { SelectRouteDialog } from "@/app/components/routes/SelectRouteDialog"
import { TokenSelectAmountComboItem } from "@/app/components/tokens/TokenSelectAmountComboItem"
import Button from "@/app/components/ui/Button"
import { Card, CardActions, CardContent, CardHeader, CardTitle } from "@/app/components/ui/Card"
import { defaultChain } from "@/app/config/chains"
import { defaultDstTokenId } from "@/app/config/swaps"
import useAccountData from "@/app/hooks/account/useAccountData"
import useReadSwapRoutes from "@/app/hooks/swap/useReadSwapRoutes"
import useWriteInitiateSwap from "@/app/hooks/swap/useWriteInitiateSwap"
import useReadAllowance from "@/app/hooks/tokens/useReadAllowance"
import useWriteApprove from "@/app/hooks/tokens/useWriteApprove"
import { getChain } from "@/app/lib/chains"
import { formatDecimalInput } from "@/app/lib/numbers"
import { getPendingSwapHistory, getSuggestedRoute } from "@/app/lib/routes"
import { getInitiateSwapErrMsg, getReviewRouteErrMsg, getRoutesMaxDstAmount, getSelectedSwapData, setSelectedSwapData } from "@/app/lib/swaps"
import { getNativeToken, getToken } from "@/app/lib/tokens"
import { Chain } from "@/app/types/chains"
import { StyleDirection, StyleToggleDirection } from "@/app/types/styling"
import { Route, RouteTxData, SwapHistory } from "@/app/types/swaps"
import { Token } from "@/app/types/tokens"

import { serialize } from "wagmi"
import { isEqualObj } from "@/app/lib/utils"
import { shortenAddress } from "thirdweb/utils"

////////////////////////////////////////////////////////////////////////////////

// todo:
//  - add logic for wrapped <> native wrapping on same chain
//  - fee accounting
//  - error handling and communication
//  - tx history

//  - simon on gas/teleporter requirements:

// I am not entirely sure about these values either, they also depend on the action at least the gas estimate. Gas buffer was just me trying stuff when something didn't work.
// Regarding the gas estimate. We have two values per hop:
//     uint256 requiredGasLimit;
//     uint256 recipientGasLimit;

// In general, recipient gas limit will only be used if the destination bridge calls our cell on the destination chain after a hop. So only if the action of that hop is HopAndCall it needs to be set.

// The field requiredGasLimit on the other hand is required for all hops involving a bridge action so Hop, HopAndCall and SwapAndHop.

// The required gas limit is calculated like this: Gas required for bridging + recipient gas limit
// Recipient gas limit is calculated like this: Gas required for cell code execution ( + Swap execution)

// Gas required for bridging we can hardcode. We can definitely optimize this but I think a safe value to start with is 500k.
// Gas for cell execution varies depending on the action. We can hardcode this as well and probably start with the highest value. If we have more data we can optimize with hardcoded values for each indiviual action.
// The swap gas estimate you get from the Cell route function.

// Teleporter fees are more complicated to calculate and can't be hardcoded. The way it should work is that they at least cover the cost for the relayer to execute the transaction on destination chain. If they break even they might execute the transaction,
// if they profit from it they are incentivized to execute the transaction.

// For some cases this will be easy to calculate for example: We have a subnet using AVAX as the their gas token and we would like to swap and receive on fuji. We can then just use requiredGasLimit and the current fuji gas price to calculate and set the teleporter fee very accuratly.
// But most of the time we will need to pay the fee in another token and will need to take prices into account. We will also need to figure out if and how much we need to add to get swift execution by the relayers.
// Saying all that, I think we should not prioritize this part. Avalabs will probably subsidize this and we can run with teleporter fee 0 or something low and hardcoded in the beginning.

const SwapPage = () => {

    // todo: add token prices api
    // todo: add price impact and warning if over x% once prices are added

    const { address: accountAddress, chainId: connectedChainId } = useAccount()
    const connectedChain = connectedChainId ? getChain(connectedChainId) : undefined

    const { balances: accountBalanceData, history: accountHistoryData } = useAccountData()
    const { data: tokenBalanceData, getTokenBalanceData, refetch: refetchBalances } = accountBalanceData
    const { latestSwapHistory } = accountHistoryData

    const [srcChain, setSrcChain] = useState<Chain>()
    const [srcToken, setSrcToken] = useState<Token>()

    const [dstChain, setDstChain] = useState<Chain>()
    const [dstToken, setDstToken] = useState<Token>()

    const setSelectedSrcToken = useCallback((token?: Token, skipDstCheck?: boolean) => {
        setSrcToken(token)
        if (token) {
            setSrcChain(getChain(token.chainId))
        }
        setSelectedSwapData({
            srcChainId: token?.chainId,
            srcTokenId: token?.id,
        })
        if (skipDstCheck !== true && token && dstToken && token.chainId === dstToken.chainId && token.id === dstToken.id) {
            setDstToken(undefined)
            setSelectedSwapData({
                dstChainId: undefined,
                dstTokenId: undefined,
            })
        }
    }, [setSrcChain, setSrcToken, dstToken, setDstToken])

    const setSelectedDstToken = useCallback((token?: Token, skipSrcCheck?: boolean) => {
        setDstToken(token)
        if (token) {
            setDstChain(getChain(token.chainId))
        }
        setSelectedSwapData({
            dstChainId: token?.chainId,
            dstTokenId: token?.id,
        })
        if (skipSrcCheck !== true && token && srcToken && token.chainId === srcToken.chainId && token.id === srcToken.id) {
            setSrcToken(undefined)
            setSelectedSwapData({
                srcChainId: undefined,
                srcTokenId: undefined,
            })
        }
    }, [srcToken, setSrcToken, setDstChain, setDstToken])

    useEffect(() => {
        const { srcToken: storedSrcToken, dstToken: storedDstToken } = getSelectedSwapData()
        if (srcToken === undefined) {
            setSelectedSrcToken(storedSrcToken ?? getNativeToken(defaultChain))
        }
        if (dstToken === undefined) {
            setSelectedDstToken(storedDstToken ?? getToken(defaultDstTokenId, defaultChain))
        }
    }, [])

    useEffect(() => {
        if (tokenBalanceData && tokenBalanceData.length !== 0) {
            if (srcToken) {
                const srcTokenData = getTokenBalanceData(srcToken)
                if (srcTokenData) {
                    setSelectedSrcToken(srcTokenData)
                }
            }
            if (dstToken) {
                const dstTokenData = getTokenBalanceData(dstToken)
                if (dstTokenData) {
                    setSelectedDstToken(dstTokenData)
                }
            }
        }
    }, [srcToken, dstToken, tokenBalanceData, getTokenBalanceData, setSelectedSrcToken, setSelectedDstToken])
    
    const [srcAmount, setSrcAmount] = useState<bigint>(BigInt(0))
    const [srcAmountFormatted, setSrcAmountFormatted] = useState<string>("")

    const handleSrcAmountInput = useCallback((value: string) => {
        setSrcAmountFormatted(value)
        setSrcAmount(parseUnits(value, srcToken?.decimals || 18))
    }, [srcToken, setSrcAmountFormatted, setSrcAmount])

    useEffect(() => {
        const srcAmountInput = srcToken ? formatDecimalInput(srcAmountFormatted, srcToken?.decimals) : ""
        setSrcAmountFormatted(srcAmountInput)
        setSrcAmount(srcToken ? parseUnits(srcAmountInput, srcToken?.decimals || 18) : BigInt(0))
    }, [srcToken])

    ////////////////////////////////////////////////////////////////////////////////
    // todo: update the below to work with quotes rather than routes

    const [selectedRoute, setSelectedRoute] = useState<Route>()
    const setRoute = useCallback((route?: Route) => {
        setSelectedRoute(route)
    }, [setSelectedRoute])

    const { routes, status: routeQueryStatus, refetch: refetchRoutes } = useReadSwapRoutes({
        srcChain: srcChain,
        srcToken: srcToken,
        srcAmount: srcAmount,
        dstChain: dstChain,
        dstToken: dstToken,
    })
    const suggestedRoute = getSuggestedRoute(routes)

    useEffect(() => {
        setRoute(suggestedRoute)
    }, [suggestedRoute, setRoute])

    const [maxDstAmount, setMaxDstAmount] = useState<bigint>(BigInt(0))
    useEffect(() => {
        setMaxDstAmount(getRoutesMaxDstAmount(routes))
    }, [routes])

    console.log(">>> routes: " + serialize(routes))
    console.log(">>> selectedRoute: " + serialize(selectedRoute))

    const handleRefetch = useCallback(() => {
        refetchBalances()
        refetchRoutes()
    }, [refetchBalances, refetchRoutes])

    const handleSwitchSrcDstTokens = useCallback((srcChain?: Chain, srcToken?: Token, dstChain?: Chain, dstToken?: Token, dstAmountFormatted?: string) => {
        if (srcChain || srcToken || dstChain || dstToken || dstAmountFormatted) {
            setSrcChain(dstChain)
            setSelectedSrcToken(dstToken, true)
            setDstChain(srcChain)
            setSelectedDstToken(srcToken, true)
            handleSrcAmountInput(dstAmountFormatted ?? "")
        }
    }, [setSrcChain, setSelectedSrcToken, setDstChain, setSelectedDstToken, handleSrcAmountInput])

    ////////////////////////////////////////////////////////////////////////////////

    const [selectedRouteTxData, setSelectedRouteTxData] = useState<RouteTxData>()
    const setRouteTxData = useCallback((data?: RouteTxData) => {
        setSelectedRouteTxData(data)
    }, [setSelectedRouteTxData])

    useEffect(() => {
        setRouteTxData(undefined)
    }, [selectedRoute, setRouteTxData])

    const { data: allowance, refetch: refetchAllowance } = useReadAllowance({
        chain: selectedRoute?.srcChain,
        token: selectedRoute?.srcToken,
        accountAddress: accountAddress,
        spenderAddress: selectedRoute?.srcCell.address,
        _enabled: selectedRoute !== undefined,
    })

    const { write: writeApprove, txHash: approveTxHash, status: approveTxStatus, txReceipt: approveTxReceipt, txReceiptStatus: approveTxReceiptStatus } = useWriteApprove({
        chain: selectedRoute?.srcChain,
        token: selectedRoute?.srcToken,
        spenderAddress: selectedRoute?.srcCell.address,
        amount: selectedRoute?.srcAmount,
        _enabled: selectedRoute !== undefined,
    })

    useEffect(() => {
        setRouteTxData({
            approveTx: approveTxHash,
            initiateTx: selectedRouteTxData?.initiateTx,
        })
    }, [approveTxHash, setRouteTxData])

    const { err: errReviewRoute, isConnectWalletErr: errReviewRouteIsConnectWallet } = getReviewRouteErrMsg({
        accountAddress: accountAddress,
        connectedChain: connectedChain,
        srcChain: srcChain,
        srcToken: srcToken,
        srcAmount: srcAmount,
        dstChain: dstChain,
        dstToken: dstToken,
        routes: routes,
        selectedRoute: selectedRoute,
        queryStatus: routeQueryStatus,
    })

    const errInitiateSwap = getInitiateSwapErrMsg({
        accountAddress: accountAddress,
        connectedChain: connectedChain,
        route: selectedRoute,
    })

    const [isSwitchChainRequired, setIsSwitchChainRequired] = useState<boolean>()
    const [isApprovalRequired, setIsApprovalRequired] = useState<boolean>()

    useEffect(() => {

        let switchChainRequired = undefined
        let approvalRequired = undefined

        if (selectedRoute && selectedRoute.initiateTx !== undefined) {
            switchChainRequired = false
            approvalRequired = false
        }
        else if (accountAddress && connectedChain && srcChain && srcToken && srcAmount !== undefined && dstChain && dstToken && selectedRoute) {
            switchChainRequired = connectedChain.id !== selectedRoute.srcChain.id
            if (selectedRoute.srcAmount > 0) {
                approvalRequired = (selectedRoute.srcToken.isNative || (allowance !== undefined && allowance >= selectedRoute.srcAmount)) ? false : true
            }
        }

        setIsSwitchChainRequired(switchChainRequired)
        setIsApprovalRequired(approvalRequired)

    }, [accountAddress, connectedChain, srcChain, srcToken, srcAmount, dstChain, dstToken, selectedRoute, allowance, setIsSwitchChainRequired, setIsApprovalRequired])

    useEffect(() => {
        if (approveTxReceipt && approveTxReceipt.status === "success") {
            refetchAllowance?.()
        }
    }, [approveTxReceipt, refetchAllowance])


    const [destinationAddress, setDestinationAddress] = useState<string | undefined>(undefined)

    const { write: writeInitiate, txHash: initiateTxHash, status: initiateTxStatus, txReceiptStatus: initiateTxReceiptStatus } = useWriteInitiateSwap({
        connectedChain: connectedChain,
        accountAddress: accountAddress,
        destinationAddress: destinationAddress,
        route: selectedRoute,
        setRoute: setRoute,
        _enabled: selectedRoute !== undefined && errReviewRoute === undefined && errInitiateSwap === undefined && isSwitchChainRequired === false && isApprovalRequired === false,
    })

    const [pendingSwapHistory, setPendingSwapHistory] = useState<SwapHistory>()

    const handleInitiateTxComplete = useCallback(() => {
        handleSrcAmountInput("")
        handleRefetch()
        refetchAllowance?.()
    }, [handleRefetch, refetchAllowance, handleSrcAmountInput])

    useEffect(() => {
        setRouteTxData({
            approveTx: selectedRouteTxData?.approveTx,
            initiateTx: initiateTxHash,
        })
        setPendingSwapHistory(getPendingSwapHistory(selectedRoute?.quote, initiateTxHash))
    }, [initiateTxHash, setRouteTxData, setPendingSwapHistory])

    useEffect(() => {
        if (latestSwapHistory) {
            refetchBalances()
            setPendingSwapHistory(undefined)
        }
    }, [latestSwapHistory, refetchBalances, setPendingSwapHistory])

    const reviewRouteBtn = <ReviewRouteButton
        err={errReviewRoute}
        isConnectWalletErr={errReviewRouteIsConnectWallet}
        queryStatus={routeQueryStatus}
    />

    const reviewRouteDialogProps = {
        header: "Review Selected Route",
        route: selectedRoute,
        allRoutes: routes,
        routeTxData: selectedRouteTxData,
        maxDstAmount: maxDstAmount,
        reviewErr: errReviewRoute,
        initiateErr: errInitiateSwap,
        isSwitchChainRequired: isSwitchChainRequired,
        isApprovalRequired: isApprovalRequired,
        handleWriteApprove: writeApprove,
        handleWriteInitiate: writeInitiate,
        handleInitiateTxComplete: handleInitiateTxComplete,
        approveTxHash: approveTxHash,
        approveTxStatus: approveTxStatus,
        approveTxReceiptStatus: approveTxReceiptStatus,
        initiateTxHash: initiateTxHash,
        initiateTxStatus: initiateTxStatus,
        initiateTxReceiptStatus: initiateTxReceiptStatus,
        latestSwap: latestSwapHistory,
        pendingSwap: pendingSwapHistory,
        accountAddress: accountAddress,
        destinationAddress: destinationAddress,
        setDestinationAddress: setDestinationAddress,
    }

    return (
        <Card glow={true} className="w-full">
            <CardHeader>
                <CardTitle>
                    <div className="text-white text-4xl font-black leading-none" style={{ fontFamily: 'var(--font-road-rage)' }}>SWAP</div>
                </CardTitle>
                <CardActions>
                    <RefreshIcon onClick={handleRefetch} className="text-[#daff00] transition hover:rotate-180" />
                    <PreferencesDialog
                        header="Preferences"
                        trigger=<SettingsIcon className="transition text-[#daff00] hover:rotate-90" />
                    />
                </CardActions>
            </CardHeader>

            <CardContent>
                <TokenSelectAmountComboItem
                    selectedChain={srcChain}
                    selectedToken={srcToken}
                    setSelectedToken={setSelectedSrcToken}
                    amountValue={srcAmountFormatted}
                    handleAmountInput={handleSrcAmountInput}
                />
                <div className="z-30 flex flex-row flex-1 -my-8 justify-center items-center">
                    <Button
                        className="btn bg-[#3A3935] hover:bg-[#3A3935] focus:bg-[#3A3935] p-3 rounded-full transition hover:rotate-180"
                        onClick={handleSwitchSrcDstTokens.bind(this, srcChain, srcToken, dstChain, dstToken, selectedRoute?.dstAmountFormatted)}
                    >
                        <ArrowIcon className="text-[#daff00]" toggleDirection={StyleToggleDirection.UpDown} />
                    </Button>
                </div>
                <TokenSelectAmountComboItem
                    selectedChain={dstChain}
                    selectedToken={dstToken}
                    setSelectedToken={setSelectedDstToken}
                    amountValue={selectedRoute?.dstAmountFormatted}
                    dst={true}
                />
            </CardContent>

            {routes && routes.length !== 0 && (<>
                <CardHeader className="-mt-4">
                    <CardTitle>
                        <RouteIcon />
                        Routes
                    </CardTitle>
                    <SelectRouteDialog
                        trigger=<CardActions className="font-bold text-end">
                            View all route details
                            <ChevronIcon direction={StyleDirection.Right} />
                        </CardActions>
                        header="Route Details"
                        routes={routes}
                        selectedRoute={selectedRoute}
                        setSelectedRoute={setRoute}
                        maxDstAmount={maxDstAmount}
                    />
                </CardHeader>
                <CardContent>
                    {routes?.map((route, i) => {
                        const isSelectedRoute = isEqualObj(selectedRoute, route)
                        const routeSummaryItem = <RouteSummaryItem
                            key={i}
                            route={route}
                            allRoutes={routes}
                            maxDstAmount={maxDstAmount}
                            selectedRoute={selectedRoute}
                            setSelectedRoute={setRoute}
                            isSelectedRoute={isSelectedRoute}
                        />
                        return isSelectedRoute ? (
                            <ReviewRouteDialog
                                {...reviewRouteDialogProps}
                                key={i}
                                trigger={routeSummaryItem}
                                disabled={errReviewRoute !== undefined}
                            />
                        ) : routeSummaryItem
                    })}
                </CardContent>
            </>)}



            <CardContent className="-mt-6 overflow-visible">
                {accountAddress ? (
                    <ReviewRouteDialog
                        {...reviewRouteDialogProps}
                        trigger={reviewRouteBtn}
                    />
                ) : (<>
                    {reviewRouteBtn}
                </>)}
            </CardContent>
        </Card>
    )
}

export default SwapPage
