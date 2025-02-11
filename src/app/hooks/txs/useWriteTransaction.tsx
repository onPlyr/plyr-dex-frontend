import React, { useCallback, useState } from "react"
import { Hash, TransactionReceipt } from "viem"
import { useAccount, useSimulateContract, UseSimulateContractParameters, useWriteContract, UseWriteContractReturnType } from "wagmi"
import { waitForTransactionReceipt } from "@wagmi/core"

import { wagmiConfig } from "@/app/config/wagmi"
import useNotifications from "@/app/hooks/notifications/useNotifications"
import { getChain } from "@/app/lib/chains"
import { getParsedError } from "@/app/lib/utils"
import { NotificationStatus, NotificationType, NotificationTypeData } from "@/app/types/notifications"
import { DefaultNotificationTypeMsg } from "@/app/config/notifications"

const defaultConfirmations = 1

interface UseWriteTransactionReturnType extends Omit<UseWriteContractReturnType, "writeContract" | "writeContractAsync"> {
    writeTransaction: () => void,
    txReceipt?: TransactionReceipt,
    isInProgress: boolean,
    refetch: () => void,
}

export type WriteTransactionCallbackType = (receipt?: TransactionReceipt, notificationId?: string, txHash?: Hash) => void
export interface WriteTransactionCallbacks {
    onSuccess?: WriteTransactionCallbackType,
    onError?: WriteTransactionCallbackType,
    onSettled?: WriteTransactionCallbackType,
    onSimulateError?: WriteTransactionCallbackType,
}

const useWriteTransaction = ({
    params,
    confirmations,
    callbacks,
    notifications,
    _enabled = true,
}: {
    params: UseSimulateContractParameters,
    confirmations?: number,
    callbacks?: WriteTransactionCallbacks,
    notifications?: NotificationTypeData,
    _enabled?: boolean,
}): UseWriteTransactionReturnType => {

    const { setNotification } = useNotifications()
    const { address: accountAddress, chainId: connectedChainId } = useAccount()
    const connectedChain = connectedChainId ? getChain(connectedChainId) : undefined
    const txChain = params.chainId ? getChain(params.chainId) : undefined
    const receiptConfirmations = confirmations || defaultConfirmations
    const enabled = _enabled !== false && params.query?.enabled !== false && accountAddress !== undefined && connectedChain !== undefined && txChain !== undefined && connectedChain.id === txChain.id

    const { data: simulateData, error: simulateError, failureReason: simulateFailureReason, status: simulateStatus, refetch } = useSimulateContract({
        ...params,
        query: {
            ...params.query,
            enabled: enabled,
        },
    })
    const [isInProgress, setIsInProgress] = useState(false)
    const [txReceipt, setTxReceipt] = useState<TransactionReceipt>()
    const wagmiWriteContract = useWriteContract(params)

    const setTransactionNotification = useCallback(({
        id,
        type,
        status,
        replaceBody,
        txHash,
    }: {
        id: string,
        type: NotificationType,
        status: NotificationStatus,
        replaceBody?: React.ReactNode,
        txHash?: Hash,
    }) => {
        const data = notifications?.[type]
        if (!data?.ignore) {
            setNotification({
                id: id,
                type: type,
                header: data?.header ?? DefaultNotificationTypeMsg[type].header,
                body: replaceBody ?? data?.body ?? DefaultNotificationTypeMsg[type].body,
                status: status,
                txHash: txHash,
            })
        }
    }, [setNotification, notifications])

    const writeTransaction = useCallback(async () => {

        let txHash: Hash | undefined = undefined
        let txReceipt: TransactionReceipt | undefined = undefined
        const notificationId = window.crypto.randomUUID()

        if (enabled && simulateStatus !== "pending" && (simulateFailureReason || simulateError || !simulateData)) {
            const err = simulateFailureReason ?? simulateError
            setTransactionNotification({
                id: notificationId,
                type: simulateFailureReason ? NotificationType.SimulateFailed : NotificationType.SimulateError,
                status: NotificationStatus.Error,
                replaceBody: err ? getParsedError(err) : undefined,
            })
            callbacks?.onSimulateError?.(txReceipt, notificationId, txHash)
            return
        }

        if (!enabled || !simulateData) {
            return
        }

        try {

            setIsInProgress(true)
            setTransactionNotification({
                id: notificationId,
                type: NotificationType.Pending,
                status: NotificationStatus.Pending,
            })

            txHash = await wagmiWriteContract.writeContractAsync(simulateData.request)
            setTransactionNotification({
                id: notificationId,
                type: NotificationType.Submitted,
                status: NotificationStatus.Pending,
                txHash: txHash,
            })

            txReceipt = await waitForTransactionReceipt(wagmiConfig, {
                chainId: simulateData.request.chainId,
                hash: txHash,
                confirmations: receiptConfirmations,
            })
            setTxReceipt(txReceipt)

            if (txReceipt.status === "reverted") {
                throw new Error("Transaction Reverted")
            }

            setTransactionNotification({
                id: notificationId,
                type: NotificationType.Success,
                status: NotificationStatus.Success,
                txHash: txHash,
            })

            callbacks?.onSuccess?.(txReceipt, notificationId, txHash)
        }

        catch (err: unknown) {
            setTransactionNotification({
                id: notificationId,
                type: txReceipt?.status === "reverted" ? NotificationType.Reverted : NotificationType.Error,
                status: NotificationStatus.Error,
                replaceBody: err ? getParsedError(err) : undefined,
                txHash: txHash,
            })
            callbacks?.onError?.(txReceipt, notificationId, txHash)
        }

        finally {
            setIsInProgress(false)
            callbacks?.onSettled?.(txReceipt, notificationId, txHash)
        }

    }, [enabled, callbacks, simulateData, simulateError, simulateFailureReason, simulateStatus, setTransactionNotification, setTxReceipt, wagmiWriteContract, receiptConfirmations, setIsInProgress])

    return {
        ...wagmiWriteContract,
        writeTransaction: writeTransaction,
        txReceipt: txReceipt,
        isInProgress: isInProgress,
        refetch: refetch,
    }
}

export default useWriteTransaction