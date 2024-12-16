import { useCallback, useEffect } from "react"
import { Address, zeroAddress } from "viem"
import { useSimulateContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi"

import { cellAbi } from "@/app/config/abis"
import useAccountHistory from "@/app/hooks/account/useAccountHistory"
import { useToast } from "@/app/hooks/toast/useToast"
import { getRouteInstructions } from "@/app/lib/routes"
import { getErrorToastData } from "@/app/lib/utils"
import { Chain } from "@/app/types/chains"
import { Route } from "@/app/types/swaps"

// Add support for custom destination address //
const useWriteInitiateSwap = ({
    connectedChain,
    accountAddress,
    destinationAddress,
    route,
    setRoute,
    _enabled = true,
}: {
    connectedChain?: Chain,
    accountAddress?: Address,
    destinationAddress?: Address,
    route?: Route,
    setRoute?: (route?: Route) => void,
    _enabled?: boolean,
}) => {

    const instructions = getRouteInstructions((destinationAddress ? destinationAddress : accountAddress), route)
    const enabled = _enabled !== false && connectedChain !== undefined && accountAddress !== undefined && route !== undefined && route.initiateTx === undefined && instructions !== undefined && connectedChain.id === route.srcChain.id

    const { data, error: simulateError } = useSimulateContract({
        chainId: route?.srcChain.id,
        account: accountAddress,
        address: route?.srcCell.address,
        // todo: come back to this, univ2 cell doesn't seem to accept value
        // abi: route?.srcCell.abi,
        abi: cellAbi,
        functionName: "initiate",
        args: [route?.srcToken.address || zeroAddress, route?.srcAmount || BigInt(0), instructions!],
        value: route?.srcToken.isNative ? route?.srcAmount : undefined,
        query: {
            enabled: enabled,
        },
    })

    const { data: txHash, status, writeContract } = useWriteContract()
    const write = useCallback(() => {
        if (data !== undefined) {
            writeContract(data.request)
        }
    }, [data, writeContract])

    const { data: txReceipt, failureReason, status: txReceiptStatus, error: txReceiptError } = useWaitForTransactionReceipt({
        chainId: route?.srcChain.id,
        hash: txHash,
        onReplaced: replacement => console.log(`useWriteInitiateSwap::replacement`, replacement),
        query: {
            enabled: txHash !== undefined,
            retry: false // See https://github.com/wevm/wagmi/issues/3674
        }
    })

    useEffect(() => {
        if (failureReason !== null) {
            console.log(`useWriteInitiateSwap::failureReason`, failureReason)
        }
    }, [failureReason])

    const { addSwapHistory, getSwapHistory } = useAccountHistory()
    useEffect(() => {
        const existingHistory = getSwapHistory(txHash)
        if (route !== undefined && txHash !== undefined && txReceipt !== undefined && txReceipt.status === "success" && txReceipt.transactionHash === txHash) {
            if (existingHistory === undefined) {
                addSwapHistory(route.quote, txReceipt)
            }
        }
    }, [route, txHash, txReceipt, addSwapHistory, getSwapHistory])

    useEffect(() => {
        if (route && txHash && txReceipt && txReceipt.status === "success" && txHash === txReceipt.transactionHash && route.initiateTx === undefined) {
            setRoute?.({
                ...route,
                initiateTx: txReceipt.transactionHash,
            })
        }
    }, [txHash, txReceipt])

    const { toast } = useToast()
    useEffect(() => {
        if (simulateError) {
            toast(getErrorToastData({
                description: "Error simulating swap. Please check the browser console for more details."
            }))
            console.error(`useWriteInitiateSwap - useSimulateContract error - name: ${simulateError.name}, message: ${simulateError.message}`)
        }
        if (txHash && txReceiptError) {
            toast(getErrorToastData({
                description: "Error fetching swap transaction receipt. Please check the browser console for more details."
            }))
            console.error(`useWriteInitiateSwap - useWaitForTransactionReceipt error - name: ${txReceiptError.name}, message: ${txReceiptError.message}`)
        }
    }, [txHash, simulateError, txReceiptError])

    return {
        status,
        write,
        txHash,
        txReceipt,
        txReceiptStatus,
    }
}

export default useWriteInitiateSwap
